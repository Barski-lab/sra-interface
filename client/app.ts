import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component, EventEmitter } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra';
import {DisplayPipe} from '../client/display.pipe';
import {LinkPipe} from "./link.pipe";
import { NO_SANITIZATION_PROVIDERS } from './sanity';
import {IsArray} from "./isarray";
import {LayoutPipe} from "./layout.pipe";
import {LinkCheck} from "./linkcheck.service";

@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray, LayoutPipe],
    providers:[LinkCheck]
})

class Socially {
    public gross:Object = [];
    public output;
    public relevantdata = ['assay type','EXP_ACC','EXP_TITLE'];
    //public arr;
    constructor(private check:LinkCheck){
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

    checkbox(item,i){
        console.log(item+i);
        this.gross[i]=item;
        this.check.check('ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/SRR/SRR104/SRR1049521/SRR104952.sra');
    }
}

bootstrap(Socially,[NO_SANITIZATION_PROVIDERS, LinkCheck]);