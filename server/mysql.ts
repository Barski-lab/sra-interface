import { Meteor } from 'meteor/meteor';

var Mysql = Npm.require('mysql');
var pool = Mysql.createPool({
            host:"localhost",
            user: "root",
            password: "chandran96",
            database: "ems",
            port: "3306"
});

export function get_users() {
    return new Promise((resolve , reject)=>{
       pool.getConnection((err , connection) => {
           connection.query(
               'SELECT DISTINCT(email) FROM worker',[],(err, rows, fields)=>{
                  connection.release();
                   if(err == null && rows.length > 0){
                       console.log(rows);
                       resolve(rows);
                   }else{
                       reject('nothing');
                   }
               });
       });
    });
}