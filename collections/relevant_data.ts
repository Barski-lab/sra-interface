import {Mongo} from 'meteor/mongo';

export let relevant_data = new Mongo.Collection('data');
export let temp = new Mongo.Collection('temp');