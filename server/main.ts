import { Meteor } from 'meteor/meteor';
import {Observable} from 'rxjs';
import { Mongo } from 'meteor/mongo';
import { config } from './config'



var Mysql = Npm.require('mysql');
var Client = Npm.require('ftp');

var genome, exp;
var author = 'bharath';
var value;

var pool = Mysql.createPool(config);

class main{
    public temp: Mongo.Cursor<Object>

}
Meteor.startup(() => {});

Meteor.methods({
    // Main insertion function
    'insert':function(data) {
        console.log(data);
        console.log('Ready to transfer data');
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                console.log('ok');
                data.forEach(function(listitem,index){
                    console.log('ITERATION _'+index);
                    connection.query(
                        //'INSERT INTO labdata ( uid,deleted, libstatus, author, notes, protocol, dateadd, url, genome_id, expereminttype_id  ) values', [], (err, rows, fields)=> {
                        'INSERT INTO labdata SET ?', data[index] , (err, res)=> {
                            if (err == null) {
                                console.log('Added' + data[index].uid);
                                resolve(res);
                            } else {
                                console.log(err);
                                reject('nothing');
                            }
                        });
                });
                connection.release();

            });
        });
    },
    
    // Checks for the ftp link. If active returns the link, if not returns just the SRR number
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
    
    // Retrieves the genome id
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
    
    // Retrieves the experiement type id
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
    },

    // Retrieves the antibody id
    'antibody': function(){
        return new Promise((resolve, reject)=> {
            pool.getConnection((err, connection) => {
                connection.query(
                    'SELECT id,antibody FROM antibody',[], (err, rows, fields)=> {
                        connection.release();
                        if (err == null && rows.length > 0) {
                            resolve(rows);
                        } else {
                            reject('nothing');
                        }
                    });
            });
        });
    },
    
    // Inserts the antibody
    'insert_antibody': function(antibody){
        return new Promise((resolve,reject)=>{
            pool.getConnection((err,connection) => {
                var string = "INSERT INTO antibody SET ?";
                connection.query(string, antibody, (err,rows,fields) => {
                    connection.release();
                    if (err == null && rows.length > 0) {
                    } else {
                        reject('nothing');
                    }
                });
            });
        });
    },
    
    // Retrieves laboratory ID of a particular text
    'search_labid' : function(){
        return new Promise((resolve,reject)=>{
            pool.getConnection((err,connection) => {
                var string = "SELECT id,name  FROM laboratory";
                connection.query(string, [], (err,rows,fields) => {
                    connection.release();
                    if (err == null && rows.length > 0) {
                        //console.log(rows)
                        resolve(rows);
                    } else {
                        reject('nothing');
                    }
                });
            });
        });
    },
    
    // Retrieves the group_id of a particular text
    'search_grpid' : function(text){
        return new Promise((resolve,reject)=>{
            pool.getConnection((err,connection) => {
                var string = "SELECT egroup.id,egroup.name FROM egroup, laboratory WHERE laboratory.id ='" +text+ "'AND laboratory.id=egroup.laboratory_id";
                connection.query(string,[], (err,rows,fields) => {
                    connection.release();
                    if (err == null && rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject('nothing');
                    }
                });
            });
        });
    }

});


