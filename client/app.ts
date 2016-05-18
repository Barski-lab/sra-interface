import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra'
import {DisplayPipe} from '../client/display.pipe'
@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe]
})

class Socially {
    public output = [];
    public relevantdata = ['EXP_ALIAS','EXP_ACC','EXP_TITLE'];
    constructor(){
    }

    getsra(id){
        console.log('Clicked');
        this.output = sra(id).then(response => response.Record);
        //console.log(this.output);
        return(this.output);
    }
    onChange(classId,flag){
        //console.log(flag);
    }
}

bootstrap(Socially);