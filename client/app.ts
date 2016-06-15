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
import {DropdownComponent} from './component/dropdown/dropdown.component';
import {LoadingService} from "./component/loading_component/loading_service";
import {LoadingIndicator} from "./component/loading_component/loading_component";

@Component({
    selector: 'app',
    templateUrl: 'client/app.html',
    pipes: [DisplayPipe, LinkPipe, IsArray, LayoutPipe],
    directives: [ROUTER_DIRECTIVES, DropdownComponent, LoadingIndicator],
    providers: [LoadingService]
})

// @RouteConfig([
//     { path: '/', as: 'query', component: Socially}
// ])

class Socially {
    public gross:Object = [];
    public global_flag: Boolean = false;
    public output;
    public all_output;
    public lab_id;
    public grp_id;
    public write_todb: Boolean = true;
    constructor(private loadingservice:LoadingService) {}
    
  
    //Display the SRA details
    getsra(id,lab_id,grp_id) {
        //window.location.reload();
        this.output = null;
        this.loadingservice.toggleLoadingIndicator(true);
        this.lab_id = lab_id;
        this.grp_id = grp_id;
        console.log('Clicked');
        return new Promise((resolve,reject) => {
            sra(id).then((res)=>{
                if (res.Record.length>1){
                    this.output = res.Record;
                    resolve(this.output);
                }
                else{
                    this.output = [];
                    this.output.push(res.Record);
                    resolve(this.output);
                }
                this.loadingservice.toggleLoadingIndicator(false);
                console.log(this.output);
                console.log('Retrieved');
            });
        });
    }

    //Select all option
    select_all(event,output){
        if(event.target.checked) {
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
            //clean the empty items and dump_all
            this.dump_all(this.clean_selected_input(this.gross)).then(value=>{
                if (value){
                    console.log(value.a.length + 'Records added')
                    console.log(value.b-value.a.length+ ' Records Deleted because it is not either DNA or RNA Seq')
                }
                });
            //Routine to select only selected record of the SRA
        }
        else{
            this.dump_all(this.all_output).then(value => {
                if (value){
                    console.log(value.a.length + 'Records added')
                    console.log(value.b-value.a.length+ ' Records Deleted because it is not either DNA or RNA Seq')
                }
            });
        }
    }

    checkbox(item, i, event) {

        if (event.target.checked && i==i && this.global_flag == false){
            console.log(this.gross);
            this.gross[i] = item;
            console.log('added '+item+'_'+i);
        }
        if (!event.target.checked && i==i && this.global_flag == false){
            this.gross[i] = '';
            console.log('deleted '+item+'_'+i)
        }
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
        console.log('dump_all')
        var that = this;
        var arr = [];
        var json = [];
        raw_data.forEach((listitem,index) => {
            arr[0] = that.decide_antibody(raw_data[index]).then(value =>{
                console.log(value.antibody)
                json[index] = {
                    experimenttype_id:'',
                    cells: that.decide_celltype(raw_data[index]),
                    conditions: that.decide_conditions(raw_data[index]),
                    uid: that.uuid(),
                    dateadd: new Date().toISOString().slice(0, 10),
                    deleted: 0,
                    libstatus: 0,
                    author: 'Bharath Manica Vasagam',
                    notes: that.notes_accum(raw_data[index]),
                    protocol: raw_data[index].EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_CONSTRUCTION_PROTOCOL,
                    laboratory_id: that.lab_id,
                    egroup_id: that.grp_id,
                    url: that.check_runaccession(raw_data[index]),
                    name4browser: raw_data[index].Pool.Member.sample_title,
                    genome_id: that.decide_genome_type(raw_data[index]),
                    antibody_id: value.antibody,
                    download_id:2,
                    antibodycode: value.antibodyname + ' ' + that.decide_anitbody_code(raw_data[index]),
                    params: '{"promoter" : 1000}',
                    };
                });
                arr[1] = that.decide_exptypeid(raw_data[index]).then(value =>{
                    json[index].experimenttype_id = value;
                });

                // arr[2] = that.check_runaccession(raw_data[index]).then(value =>{
                //     json[index].url= value
                // });
            });

     return Promise.all(arr).then(()=>{
         var b = json.length
         console.log(json);
         if(this.write_todb== true){
             Meteor.call('insert', this.clean(json), function(err,res) {
                 if (err) console.log(err);
                 //console.log(res);
             });
         }
         if(this.write_todb == true){
             return ({a:this.clean(json), b:b});
         }
     });
    }

    // Returns Type of the experiment RNA-Seq or DNA-Seq Single or Paired
    decide_exptypeid(raw_data){
        console.log('Experiment id')
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
                else{resolve ('')}
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
        //                 console.log(adv);
        //                 resolve(adv.join(';'));
        //             });
        //         });
        //
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
                adv[i] = 'ftp://ftp-trace.ncbi.nlm.nih.gov/sra/sra-instant/reads/ByRun/sra/' + raw_data.RUN_SET.RUN[i].accession.substring(0, 3) + '/' + raw_data.RUN_SET.RUN[i].accession.substring(0, 6) + '/' + raw_data.RUN_SET.RUN[i].accession + '/' + raw_data.RUN_SET.RUN[i].accession + '.sra'
            }
            return adv.join(';');
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
        var adv = [];
        //item.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE
        var ind = _.find(a, function(rw){
            if (rw.TAG == 'treatment'){
                return rw.VALUE
            }
        });
        if (ind){return(ind.VALUE)}
        else {
            if (!isArray(raw_data.RUN_SET.RUN)){return raw_data.RUN_SET.RUN.accession}
            else{
                for (var i=0;i<raw_data.RUN_SET.RUN.length; i++){
                    adv[i] = raw_data.RUN_SET.RUN[i].accession
                }
                return adv.join('; ')
            }
        }
    }

    //Returns the notes - accumulation of relevant details that is not entered into wardrobe
    notes_accum(raw_data){
        var a,b,c,d,e,f,g,h;

        if (raw_data.EXPERIMENT.alias){
            a = '<b>BIOPROJECT:</b> ' + raw_data.EXPERIMENT.alias}
        if (raw_data.SUBMISSION.alias){
            b = '\n<br> <b>SUBMISSION ALIAS: </b>'+raw_data.SUBMISSION.alias}
        if (raw_data.Pool.Member.organism){
            c = '\n<br> <b>ORGANISM: </b>' +raw_data.Pool.Member.organism}
        if (raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY){
            d = '\n<br> <b>ASSAY TYPE: </b>' +raw_data.EXPERIMENT.DESIGN.LIBRARY_DESCRIPTOR.LIBRARY_STRATEGY;
        }
        if(raw_data.STUDY.DESCRIPTOR.CENTER_PROJECT_NAME){
            e = '\n<br> <b>CENTER PROJECT NAME: </b>' +raw_data.STUDY.DESCRIPTOR.CENTER_PROJECT_NAME;
        }
        if(raw_data.STUDY.DESCRIPTOR.STUDY_TITLE){
            f = '\n<br><br> <b>STUDY TITLE: </b>' +raw_data.STUDY.DESCRIPTOR.STUDY_TITLE;
        }
        if (raw_data.STUDY.DESCRIPTOR.STUDY_ABSTRACT){
            g = '\n<br><br> <b>STUDY ABSTRACT: </b>' +raw_data.STUDY.DESCRIPTOR.STUDY_ABSTRACT;
        }
        if(raw_data.EXPERIMENT.EXPERIMENT_ATTRIBUTES.EXPERIMENT_ATTRIBUTE.VALUE){
            h = '\n\n<br><br> <iframe src="http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc='+raw_data.EXPERIMENT.EXPERIMENT_ATTRIBUTES.EXPERIMENT_ATTRIBUTE.VALUE+'"width="1000" height="1000"></iframe> '
        }
        return (a+b+c+d+e+f+g+h);
    }

    // Returns antibody id if available or else adds the new antibody to database and returns it
    decide_antibody(raw_data) {
        return new Promise((resolve, reject) => {
            console.log('Check antibody')
            Meteor.call('antibody', function (err, res) {
                console.log('inside')
                if (err) {reject(err)}
                else {
                    var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE;
                    var ind = _.find(a, function (rw) {
                        if (rw.TAG == 'chip antibody' | rw.TAG == 'antibody' & rw.VALUE != 'no antibody') {
                            return rw.VALUE
                        }
                    });
                    if (ind) {
                        var index1 = res.findIndex(x => x.antibody.toLowerCase() == ind.VALUE.toLowerCase());
                        if(index != -1){resolve({antibodyname:res[index1].antibody, antibody: res[index1].id, antibodycode:ind})}
                        else{
                            var raw =ind.VALUE.split('anti-')[1].split('(')[0].split(' ')[0];
                            //var raw = 'H3K27me3'
                            var index = res.findIndex(x => x.antibody.toLowerCase() == raw.toLowerCase());
                            if(index != -1){resolve({antibodyname: res[index].antibody, antibody: res[index].id, antibodycode:ind})}
                            //This is the id of N/A antibody
                            else {resolve({antibodyname:'N/A', antibody:'antibody-0000-0000-0000-000000000001', antibodycode:ind})}
                    }} else {
                        resolve({antibodyname:'N/A', antibody:'antibody-0000-0000-0000-000000000001',antibodycode:''})
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
        //         if (elem.antibody.toLowerCase() == raw.toLowerCase()){return elem.id}
        //     });
        //     if (res_id){resolve (res_id.id)}
        //     else{
        //         antibody = {
        //             antibody: raw,
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

    clean(json){
        var gh=json;
        for (var i = 0; i< json.length; i++){
            if (json[i].experimenttype_id == ''| null){
                gh.splice(i,1)
            }
        }
        return (gh);
    }

    decide_genome_type(raw_data){
        var genome = [{id:1, name: 'Homo Sapiens'},
            {id: 3, name: 'Mus Musculus'},
            {id: 4, name: 'Rattus Rattus'},
            {id: 8, name: 'Drosophila Melanogaster'},
            {id: 10, name: 'Xenopus tropicalis'},
            {id: 9, name: 'Xenopus laevis'}]
        var ind = _.find(genome, function (rw) {
            if (raw_data.Pool.Member.organism.toLowerCase().match(rw.name.toLowerCase().split(' ')[0]) &&
                (raw_data.Pool.Member.organism.toLowerCase().match(rw.name.toLowerCase().split(' ')[1]))) {
                return rw.id;
            }
        });
        console.log(ind);
        if (ind){
            return ind.id
        }else{
            this.write_todb = false;
            //Activate Donot write flag
            alert("Genome type doesnot match with Biowardrobe's database\nCannot write records to database")
        }
    }

    clean_selected_input(selected_input){
        var arr = selected_input.filter(function(e){return e});
        console.log(arr)
        return arr;
    }

    decide_anitbody_code(raw_data){
        var a = raw_data.SAMPLE.SAMPLE_ATTRIBUTES.SAMPLE_ATTRIBUTE;
        var ind = _.find(a, function (rw) {
            if (rw.TAG == 'antibody vendorname') {
                return rw.VALUE
            }
        });
        var ind2 = _.find(a, function (rw) {
            if (rw.TAG == 'antibody vendorid') {
                return rw.VALUE
            }
        });
        if(!ind && ind2){
            return '';
        }
        else{
            if(ind && ind2){
                return (ind.VALUE + ' ' + ind2.VALUE)
            }
        }
    }
}
// var arr = Object.keys(obj).map(function (key) {return obj[key]});
bootstrap(Socially,[NO_SANITIZATION_PROVIDERS, DropdownComponent, LoadingIndicator, ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);