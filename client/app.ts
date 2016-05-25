import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component, EventEmitter } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra';
import { DisplayPipe } from './display.pipe.ts';
import { LinkPipe } from "./link.pipe.ts";
import { NO_SANITIZATION_PROVIDERS } from './sanity';
import { IsArray } from "./isarray";
import { LayoutPipe } from "./layout.pipe.ts";
import { LinkCheck } from "./linkcheck.service";
import { Mongo }     from 'meteor/mongo';
import {temp} from "../collections/relevant_data.ts";


@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray, LayoutPipe],
    providers:[LinkCheck]
})

class Socially {
    public gross:Object = [];
    public output;
    //relevant_data: Mongo.Cursor<Object>;
    public temp: Mongo.Cursor<Object>;

    constructor(private check:LinkCheck) {
    }

    initialize(item,i,event,text) {
        if (typeof this.gross.text == 'undefined') {
            this.gross[text] = new Array(20);

            //this.gross[text]
        }
        return this.gross;
    }

    getsra(id) {
        console.log('Clicked');
        this.output = sra(id).then(response => response.Record);
        console.log(this.output);
        return (this.output);
    }

    Selected() {
        //temp.insert{}
    }

    checkbox(item, i, event, text) {
        console.log(this.gross[text]);
        if (typeof this.gross[text] == "undefined")
        {
            console.log('entered');
            this.initialize(item, i, event, text);
        }
        console.log(item+i+event+text);
        //console.log(this.gross);
        if (event.target.checked & i==i){
            console.log('success');
            console.log(this.gross);
            this.gross[text][i] = item;
            //this.gross[text].splice(i,1,item);
            console.log('added '+text+'_'+i)
            //console.log(this.gross);
            //this.gross[text][i]=item;
        }
        if (!event.target.checked & i==i){
            console.log(item+i+event+text);
            console.log('failure');
            this.gross[text][i] = '';
            //this.gross[text].splice(i,1,'');
            console.log('deleted '+text+'_'+i)
        }
    }

}

bootstrap(Socially,[NO_SANITIZATION_PROVIDERS, LinkCheck]);