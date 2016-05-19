import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component, EventEmitter } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra';
import {DisplayPipe} from '../client/display.pipe';
import {LinkPipe} from "./link.pipe";
import { NO_SANITIZATION_PROVIDERS } from './sanity';
import {IsArray} from "./isarray";

@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray]
})

class Socially {
    public output;
    public relevantdata = ['assay type','EXP_ACC','EXP_TITLE'];
    //public arr;
    constructor(){
    }

    getsra(id){
        console.log('Clicked');
        this.output = sra(id).then(response => response.Record);
        console.log(this.output);
        return(this.output);
    }
    Selected(){
        console.log('ok');
        //this.students.filter(_ => _.selected).forEach(_ => { ... })
    }
}

bootstrap(Socially,[NO_SANITIZATION_PROVIDERS]);