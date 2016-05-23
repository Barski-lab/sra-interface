import { Meteor } from 'meteor/meteor';
import {relevant_data} from "../collections/relevant_data.ts"

import { Mongo } from 'meteor/mongo';

import {get_users} from './mysql.ts';

var rows;

Meteor.startup(() => {get_users()});

Meteor.methods({

});

