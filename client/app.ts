import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component, provide, OnInit} from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra';
import { DisplayPipe } from './display.pipe.ts';
import { LinkPipe } from "./link.pipe.ts";
import { NO_SANITIZATION_PROVIDERS } from './sanity';
import { IsArray } from "./isarray";
import { LayoutPipe } from "./layout.pipe.ts";
import { LinkCheck } from "./linkcheck.service";
import { Meteor } from 'meteor/meteor';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig } from '@angular/router-deprecated';
import { APP_BASE_HREF } from '@angular/common';

@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray, LayoutPipe],
    providers:[LinkCheck],
    directives: [ROUTER_DIRECTIVES]
})

// @RouteConfig([
//     { path: '/', as: 'query', component: query},
// ])

class Socially {
    public gross:Object = [];
    public global_flag: Boolean = false;
    public output;
    public all_output;
    constructor(private check:LinkCheck) {
    }

    select_all(event,output){
        if(event.target.checked){
            this.global_flag = true;
            this.all_output = output;
            console.log(output);
        }
        else{
            this.global_flag = false;
        }
    }

    getsra(id) {
        console.log('Clicked');
        return new Promise((resolve,reject) => {
            sra(id).then((res)=>{
                this.output = res.Record;
                resolve(this.output);
                console.log(this.output);
            });
        });
    }

    Selected() {
        if (this.global_flag == false){
            console.log(this.gross);
            this.Object_relevant_json(this.gross).then(value => {
                console.log(value);
                Meteor.call('insert', value , function(err,res) {
                    if (err) console.log(err);
                });
            });
        }
        else{
            this.dump_all(this.all_output).then(value=>{
                console.log(value);
            });
            this.decide_exptypeid('RNA-Seq','PAIRED').then((o)=>{
                console.log(o);
            });
            //selecting all records in the same format
        }
    }

    initialize(item,i,event,text) {
        if (typeof this.gross.text == 'undefined') {
            this.gross[text] = new Array();
        }
        return this.gross;
    }

    checkbox(item, i, event, text) {
        console.log(event);
        if (typeof this.gross[text] == "undefined")
        {

            this.initialize(item, i, event, text);
        }
        console.log(item+i+event+text);

        if (event.target.checked && i==i && this.global_flag == false){
            console.log(this.gross);
            this.gross[text][i] = item;
            console.log('added '+text+'_'+i);
        }
        if (!event.target.checked && i==i && this.global_flag == false){
            this.gross[text][i] = '';
            console.log('deleted '+text+'_'+i)
        }
    }

    Object_relevant_json(obj){
        return new Promise((resolve,reject)=>{
            var json = [];
            var l = Object.keys(obj).length;
            //include function to determine the max of each array elements
            for (var i = 0; i<2; i++) {
                json[i] = {
                    uid: this.uuid(),
                    deleted: 0,
                    libstatus: 0,
                    author: 'bharath',
                    notes: '',
                    cells: '',
                    conditions: '',
                    protocol: obj.protocol[i],
                    dateadd: new Date().toISOString().slice(0, 10),
                    url: 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/' + obj.run_accession[0].substring(0, 3) + '/' + obj.run_accession[0].substring(0, 6) + '/' + obj.run_accession[0] + '/' + obj.run_accession[0] + '.sra',
                    genome_id: 1,
                    experimenttype_id: this.decide_exptypeid(obj.assay_type[i])
                };
            }
            resolve(json);
        });
    }

    uuid() {
    var chars = '0123456789abcdef'.split('');
    var uuid = [], rnd = Math.random, r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4'; // version 4
    for (var i = 0; i < 36; i++)
    {
        if (!uuid[i]) {
            r = 0 | rnd()*16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
        }
    }
        return uuid.join('');
    }

    dump_all(raw_data){
        return new Promise((resolve,reject)=>{
            var json = [];
            var l= Object.keys(raw_data).length;
            for (var i=0; i<l ; i++){
                json[i] = {
                    uid: this.uuid(),
                    dateadd: new Date().toISOString().slice(0, 10),
                    deleted: 0,
                    libstatus: 0,
                    author: 'bharath',
                    notes: '',
                    cells: '',
                    conditions: '',
                    protocol: raw_data[i].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_CONSTRUCTION_PROTOCOL,
                    url: 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/' + raw_data[i].RUN_SET.RUN.accession.substring(0, 3) + '/' + raw_data[i].RUN_SET.RUN.accession.substring(0, 6) + '/' + raw_data[i].RUN_SET.RUN.accession + '/' + raw_data[i].RUN_SET.RUN.accession + '.sra',
                    genome_id: 1,
                    experimenttype_id:1
                };
                // input for exptypeconsole.log(Object.keys(raw_data[i].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0]);
            }

            // Meteor.call('insert', json, function(err,res) {
            //     if (err) console.log(err);
            // });
            resolve(json);
        });
    }

    decide_exptypeid(assay_type,layout){
        return new Promise((resolve,reject)=>{
            Meteor.call('populate_exp',function(err,res){
                if (err) reject(err);
                var a = _.find(res, function(rw){
                    if (layout == 'PAIRED'){
                        return rw.etype == assay_type+' pair'
                    }
                    return rw.etype == assay_type});
                resolve(a.id);
            });
        });
    }

    decide_celltype(strain_data){

    }

    notes_accum(){

    }

    decide_antibody(){

    }

}
// var arr = Object.keys(obj).map(function (key) {return obj[key]});
bootstrap(Socially,[NO_SANITIZATION_PROVIDERS,LinkCheck, ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);