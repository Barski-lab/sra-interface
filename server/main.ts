import { Meteor } from 'meteor/meteor';
import {Observable} from 'rxjs';
import { Mongo } from 'meteor/mongo';
import {get_users} from './mysql.ts';

var uuid = Npm.require('node-uuid');
var Mysql = Npm.require('mysql');
var Client = Npm.require('ftp');
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
Meteor.startup(() => {});

Meteor.methods({
    'insert':function(data) {
        console.log(data);
        console.log('Ready to transfer data');
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                console.log('ok');
                for (var i= 0; i<data.length; i++){

                    connection.query(
                        //'INSERT INTO labdata ( uid,deleted, libstatus, author, notes, protocol, dateadd, url, genome_id, expereminttype_id  ) values', [], (err, rows, fields)=> {
                        'INSERT INTO labdata SET ?', data[i] , (err, res)=> {
                            if (err == null) {
                                console.log('Added' + data[i].uid);
                                resolve(res);
                            } else {
                                console.log(err);
                                reject('nothing');
                            }
                        });
                }
                connection.release();
                
            });
        });
    },

    'ftpcheck':function(path,filename){
        return new Promise((resolve,reject)=>{
            var c = new Client();
            var path="/sra/sra-instant/reads/ByRun/sra/SRR/SRR001/SRR001000/";
            var ftpServer = {
                host:""
            }
            c.connect(ftpServer);
            c.on( 'ready', function () {
                c.list(path, function ( err, list ) {
                    if ( err ) reject (err);
                    resolve(list[0].name == filename);
                });
                c.end();
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
                            resolve(exp);
                        } else {
                            reject('nothing');
                        }
                    });
            });
        });
    }
});


