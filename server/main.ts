import { Meteor } from 'meteor/meteor';
import {Observable} from 'rxjs';
import { Mongo } from 'meteor/mongo';
import {get_users} from './mysql.ts';

var uuid = Npm.require('node-uuid');
var Mysql = Npm.require('mysql');
var genome, exp;
var author = 'bharath';
var value;

var pool = Mysql.createPool({
    host:"localhost",
    user: "root",
    password: "chandran96",
    database: "ems",
    port: "3306"
});

class main{
    public temp: Mongo.Cursor<Object>

}
Meteor.startup(() => {
    Meteor.call('populate_genome');
    Meteor.call('populate_exp');
});

Meteor.methods({
    'insert':function(data) {
        console.log(data);
        console.log('Ready to transfer data');
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                console.log('ok');
                connection.query(
                    //'INSERT INTO labdata ( uid,deleted, libstatus, author, notes, protocol, dateadd, url, genome_id, expereminttype_id  ) values', [], (err, rows, fields)=> {
                    'INSERT INTO labdata SET ?', [data] , (err, res)=> {
                        connection.release();
                        if (err == null) {
                            console.log('Added' + data.uid);
                            resolve(res);
                        } else {
                            console.log(err);
                            reject('nothing');
                        }
                    });
            });
        });
    },
    'populate_genome':function(){
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                connection.query(
                    'SELECT id, genome FROM genome',[], (err, rows, fields)=> {
                        connection.release();
                        if (err == null && rows.length > 0) {
                            genome = rows;
                            //console.log(rows);
                            resolve(genome);
                        } else {
                            reject('nothing');
                        }
                    });
            });
        });
    },
    'populate_exp':function(){
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                connection.query(
                    'SELECT id, etype FROM experimenttype',[], (err, rows, fields)=> {
                        connection.release();
                        if (err == null && rows.length > 0) {
                            exp = rows;
                            console.log(rows);
                            resolve(exp);
                        } else {
                            reject('nothing');
                        }
                    });
            });
        });
    },
    'print_sample': function(data){
        console.log(data);
    }
});


