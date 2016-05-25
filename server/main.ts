import { Meteor } from 'meteor/meteor';
import {Observable} from 'rxjs';
import {relevant_data} from "../collections/relevant_data.ts";
import {temp} from "../collections/relevant_data.ts";
import { Mongo } from 'meteor/mongo';

import {get_users} from './mysql.ts';
var rows;

class main{
    public temp: Mongo.Cursor<Object>

}
Meteor.startup(() => {rows = get_users().then(rows => {
    console.log(rows[2]);
    var arr = [];
    for (var x in rows){
        arr.push(rows[x].email);
    }
    temp.insert({'email': arr});
    Meteor.call('insert',{'email': arr});
});
});

Meteor.methods({
    'insert': function(doc){
        temp.insert(doc);
    }
});


