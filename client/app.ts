import 'reflect-metadata';
import 'zone.js/dist/zone';
import { Component, provide, Input} from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { sra } from '../client/sra';
import { DisplayPipe } from './display.pipe.ts';
import { LinkPipe } from "./link.pipe.ts";
import { NO_SANITIZATION_PROVIDERS } from './sanity';
import { IsArray } from "./isarray";
import { LayoutPipe } from "./layout.pipe.ts";
import { Meteor } from 'meteor/meteor';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig } from '@angular/router-deprecated';
import { APP_BASE_HREF } from '@angular/common';
import {isArray} from "@angular/platform-browser/src/facade/lang";
import {DropdownComponent} from './component/dropdown.component';

@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray, LayoutPipe],
    directives: [ROUTER_DIRECTIVES, DropdownComponent]
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

    // @Input() grp_id = this.service.selected_lab_id;
    constructor() {
      
    }
  
    //Display the SRA details
    getsra(id,lab_id,grp_id) {
        this.lab_id = lab_id;
        this.grp_id = grp_id;
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
            this.dump_all(this.all_output).then(value=> {
                console.log(value + ' Records added')
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
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
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




            var arr = [];
        var json = [];
            raw_data.forEach((listitem,index) => {
                // that.decide_exptypeid(raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY,Object.keys(raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0]).then(value => {
                //     json[index].experimenttype_id = value;
                // });
               arr[0] = that.decide_antibody(raw_data[index]).then(value =>{
                   console.log('1');
                    json[index] = {
                        cells: that.decide_celltype(raw_data[index]),
                        conditions: that.decide_conditions(raw_data[index]),
                        uid: that.uuid(),
                        dateadd: new Date().toISOString().slice(0, 10),
                        deleted: 0,
                        libstatus: 0,
                        author: 'Bharath Manica Vasagam',
                        notes: that.notes_accum(raw_data[index]),
                        cells: that.decide_celltype(raw_data[index]),
                        protocol: raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_CONSTRUCTION_PROTOCOL,
                        laboratory_id: that.lab_id,
                        egroup_id: that.grp_id,
                        url: that.check_runaccession(raw_data[index]),
                        name4browser: raw_data[index].RUN_SET.RUN.accession,
                        genome_id: 10,
                        antibody_id:value,
                        download_id:2
                    };
                    console.log(json);
                    //SWITCH TO TRANSPORT DATA

                });
                arr[1] = that.decide_exptypeid(raw_data[index]).then(value =>{
                    json[index].experimenttype_id = value;
                });

                // that.check_runaccession(raw_data).then(value=>{
                //     json[index].url = value;
                // });
                // input for exptypeconsole.log(Object.keys(raw_data[i].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0]);
            });

     return Promise.all(arr).then(()=>{

         console.log('2');
         Meteor.call('insert', json, function(err,res) {
         if (err) console.log(err);
     });
         return json.length;
     });
    }

    // Returns Type of the experiment RNA-Seq or DNA-Seq Single or Paired
    decide_exptypeid(raw_data){
        var assay_type = raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY;
        var layout = Object.keys(raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_LAYOUT)[0];
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
        console.log('Cheking Run-accession');
        var adv=[];
        // return new Promise ((resolve,reject) => {
        //     if (!isArray(raw_data.RUN_SET.RUN)){
        //         var path = 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/'
        //             + raw_data.RUN_SET.RUN.accession.substring(0, 3) + '/'
        //             + raw_data.RUN_SET.RUN.accession.substring(0, 6) + '/'
        //             + raw_data.RUN_SET.RUN.accession + '/' + raw_data.RUN_SET.RUN.accession + '.sra';
        //         var filename = raw_data.RUN_SET.RUN.accession+'.sra';
        //         Meteor.call('ftpcheck',path,filename, function(err,res){
        //             if (err) {reject(err)}
        //             if (res == true){resolve (path)}
        //             else {resolve(filename)}
        //         });
        //     }
        //     else{
        //         raw_data.RUN_SET.RUN.forEach(function(item,index){
        //             var path = 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/' + item.accession.substring(0, 3) + '/' + item.accession.substring(0, 6) + '/' + item.accession + '/' + item.accession + '.sra';
        //             var filename = item.accession + '.sra';
        //             Meteor.call('ftpcheck',path,filename, function(err,res){
        //                 if (err) {reject(err)}
        //                 if (res == true){adv.push(filename)}
        //                 else {adv.push(path)}
        //             });
        //             resolve(adv.join(';'));
        //         });
        //     }
        //
        // });
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
            if (rw.TAG == 'source_name'){
                return rw.VALUE
            }
        });
        if (ind){return(ind.VALUE)}
        else {return (raw_data.RUN_SET.RUN.accession)}
    }

    decide_conditions(raw_data){
        //item.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var ind = _.find(a, function(rw){
            if (rw.TAG == 'treatment'){
                return rw.VALUE
            }
        });
        if (ind){return(ind.VALUE)}
        else {return (raw_data.RUN_SET.RUN.accession)}
    }

    //Returns the notes - accumulation of relevant details that is not entered into wardrobe
    notes_accum(raw_data){
        var a,b,c,d;

        if (raw_data.EXPERIMENT.alias){
            a = 'BIOPROJECT:' + raw_data.EXPERIMENT.alias}
        if (raw_data.SUBMISSION.alias){
            b = '\n<br> SUBMISSION ALIAS:'+raw_data.SUBMISSION.alias}
        if (raw_data.Pool.Member.organism){
            c = '\n<br> ORGANISM:' +raw_data.Pool.Member.organism}
        if (raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY){
            d = '\n<br> ASSAY TYPE' +raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY;
        }
        return (a+b+c+d);
    }

    // Returns antibody id if available or else adds the new antibody to database and returns it
    decide_antibody(raw_data) {
        return new Promise((resolve, reject) => {
            console.log('Check antibody')
            Meteor.call('antibody', function (err, res) {
                if (err) {reject(err)}
                else {
                    var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE;
                    var ind = _.find(a, function (rw) {
                        if (rw.TAG == 'chip antibody' & rw.VALUE != 'no antibody') {
                            return rw.VALUE
                        }
                    });
                    if (ind) {
                        var raw =ind.VALUE.split('anti-')[1].split('(')[0].split(' ')[0];
                        //var raw = 'H3K27me3'
                        var index = res.findIndex(x => x.antibody.toLowerCase() == raw.toLowerCase());
                        if(index != -1){resolve(res[index].id)}
                            //This is the id of N/A antibody
                        else {resolve('antibody-0000-0000-0000-000000000001')}
                    } else {
                        resolve('antibody-0000-0000-0000-000000000001')
                    }
                }

            });
        });


        // This function was written to include the UNAVAILABLE anitbody into antibody table
        // Meteor.call('antibody',function(err,res){
        //     var antibody;
        //     console.log(raw);
        //     //resolve(res);
        //     var res_id = _.find(res, function(elem){
        //        if (elem.antibody.toLowerCase() == raw.toLowerCase()){return elem.id}
        //     });
        //     if (res_id){resolve (res_id.id)}
        //     else{
        //         antibody = {
        //           antibody: raw,
        //             id: that.uuid()
        //         };
        //         Meteor.call('insert_antibody',antibody, function(err,res){
        //             resolve (antibody.id);
        //         });
        //     }
        //     //console.log(res_id.id);
        //     //console.log(res);
        // });

    }
    // get_antibody_sync(raw_data){
    //     var output;
    //     this.decide_antibody(raw_data).then(value =>{
    //     });
    // }
}
// var arr = Object.keys(obj).map(function (key) {return obj[key]});
bootstrap(Socially,[NO_SANITIZATION_PROVIDERS, DropdownComponent, ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);