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
import {isArray} from "@angular/platform-browser/src/facade/lang";

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
    public lab_id;
    public grp_id;
    constructor() {}

    //Display the SRA details
    getsra(id, lab_id,grp_id) {
        var that = this;
        //TEMP ARRANGEMENTS
        Meteor.call('search_labid',lab_id, function(err,res){
            if (res != ''){ that.lab_id = res[0].id }

        });
        Meteor.call('search_grpid',grp_id, function(err,res){
            if (res != ''){ that.grp_id = res[0].id }

        });
        // TEMP
        console.log('Clicked');
        return new Promise((resolve,reject) => {
            sra(id).then((res)=>{
                this.output = res.Record;
                resolve(this.output);
                console.log('Retrieved');
            });
        });
    }

    //Select all option
    select_all(event,output){
        if(event.target.checked){
            this.global_flag = true;
            this.all_output = output;
            console.log('Select All option Chosen')
        }
        else{
            this.global_flag = false;
        }
    }

    // Intermediate function to transport everything
    Selected() {
        if (this.global_flag == false){
            //Routine to select only selected record of the SRA
            this.Object_relevant_json(this.gross).then(value => {
                console.log(value);
                Meteor.call('insert', value , function(err,res) {
                    if (err) console.log(err);
                });
            });
        }
        else{
            this.dump_all(this.all_output).then(value=>{});

            // Just trial function!!
            this.decide_antibody('mouse anti-Smad2/3 antibody').then(value => {
                //mouse anti-Smad2/3 antibody
                console.log(value);
            });
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
    // Generate UUID
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

    // Sending all data to Database
    dump_all(raw_data){
        var that = this;
        return new Promise((resolve,reject)=>{
            var json = [];
            var l= Object.keys(raw_data).length;
            raw_data.forEach(function(listitem,index){
                 json[index] = {
                    uid: that.uuid(),
                    dateadd: new Date().toISOString().slice(0, 10),
                    deleted: 0,
                    libstatus: 0,
                    author: 'bharath',
                    notes: that.notes_accum(raw_data[index]),
                    cells: that.decide_celltype(raw_data[index]),
                    conditions: '',
                    protocol: raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_CONSTRUCTION_PROTOCOL,
                    laboratory_id: that.lab_id,
                    egroup_id: that.grp_id,
                    url: that.check_runaccession(raw_data[index]),
                    genome_id: 1,
                 };
                that.decide_exptypeid(raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY,Object.keys(raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0]).then(value => {
                    json[index].experimenttype_id = value;
                });
                // input for exptypeconsole.log(Object.keys(raw_data[i].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0]);
            });
            // Meteor.call('insert', json, function(err,res) {
            //     if (err) console.log(err);
            // });
            resolve(json);
        });
    }

    // Returns Type of the experiment RNA-Seq or DNA-Seq Single or Paired
    decide_exptypeid(assay_type,layout){
        return new Promise((resolve,reject)=>{
            Meteor.call('populate_exp',function(err,res){
                if (err) reject(err);
                var a = _.find(res, function(rw){
                    if (layout == 'PAIRED' & (assay_type == 'DNA-Seq' | assay_type == 'RNA-Seq')){
                        return rw.etype == assay_type+' pair'
                    }
                    else if (layout == 'PAIRED' & assay_type == 'ChIP-Seq'){
                        return rw.etype == 'DNA-Seq'+' pair'
                    }
                    else if (layout == 'SINGLE' & assay_type == 'ChIP-Seq'){
                        return rw.etype == 'DNA-Seq'
                    }else return rw.etype == assay_type});
                if (a){
                    resolve(a.id);
                }
            });
        });
    }

    // Returns URL to download SRR.SRA files
    check_runaccession(raw_data){
        var adv=[];
        if (!isArray(raw_data.RUN_SET.RUN)){
            return 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/'
                + raw_data.RUN_SET.RUN.accession.substring(0, 3) + '/'
                + raw_data.RUN_SET.RUN.accession.substring(0, 6) + '/'
                + raw_data.RUN_SET.RUN.accession + '/' + raw_data.RUN_SET.RUN.accession + '.sra';
        }
        else{
            for (var i=0;i<raw_data.RUN_SET.RUN.length; i++){
                var adv = adv + '; ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/' + raw_data.RUN_SET.RUN[i].accession.substring(0, 3) + '/' + raw_data.RUN_SET.RUN[i].accession.substring(0, 6) + '/' + raw_data.RUN_SET.RUN[i].accession + '/' + raw_data.RUN_SET.RUN[i].accession + '.sra'
            }
            return adv;
        }
    }

    //Returns the cell name (only if it available for now)
    decide_celltype(raw_data){
        //item.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var ind = _.find(a, function(rw){
            if (rw.TAG == 'cell_type'){
                return rw.VALUE
            }
        });
        if (ind){return(ind.VALUE)}
        else {return ('')}
    }

    //Returns the notes - accumulation of relevant details that is not entered into wardrobe
    notes_accum(raw_data){
        var a,b,c,d;

        if (raw_data.EXPERIMENT.alias){
            a = 'BIOPROJECT:' + raw_data.EXPERIMENT.alias}
        if (raw_data.SUBMISSION.alias){
            b = '\n SUBMISSION ALIAS:'+raw_data.SUBMISSION.alias}
        if (raw_data.Pool.Member.organism){
            c = '\n ORGANISM:' +raw_data.Pool.Member.organism}
        if (raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY){
            d = '\n ASSAY TYPE' +raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY;
        }
        return (a+b+c+d);
    }

    // Returns antibody id if available or else adds the new antibody to database and returns it
    decide_antibody(raw_data){
        var that = this;
        //var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        // var ind = _.find(a, function(rw){
        //     if (rw.TAG == 'CHIP ANTIBODY'){return rw.VALUE}
        // });
        return new Promise ((resolve,reject) => {
            Meteor.call('antibody',function(err,res){
                var antibody;
                console.log(raw_data);
                //resolve(res);
                var res_id = _.find(res, function(elem){
                   if (elem.antibody.toLowerCase() == raw_data.toLowerCase()){return elem.id}
                });
                if (res_id){resolve (res_id.id)}
                else{
                    antibody = {
                      antibody: raw_data,
                        id: that.uuid()
                    };
                    Meteor.call('insert_antibody',antibody, function(err,res){

                    });
                }
                //console.log(res_id.id);
                //console.log(res);
            });
        });
    }
}
// var arr = Object.keys(obj).map(function (key) {return obj[key]});
bootstrap(Socially,[NO_SANITIZATION_PROVIDERS,LinkCheck, ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);