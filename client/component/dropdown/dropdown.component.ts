import {Component, Injectable} from "@angular/core";
import {Meteor} from "meteor/meteor";
import "reflect-metadata";
import "zone.js/dist/zone";
import {Dropdownpipe} from "./dropdown.pipe";

@Component({
    selector: 'ui-form',
    template: `
<ngform>
<div class = "ex">
<div *ngIf="lab">
<label for="lab">Laboratory</label>
<select class="form-control" #t (change)="displaying(t.value)"(change)="selected_lab(t.value)">
<option *ngFor="let item of lab" [value]="item">
{{item | dropdownpipe}}
</option>
</select>
</div>
</div>
        <div *ngIf="grp" class = "ex">
        <label for="grp">Group Name</label>
            <select class="form-control" #k (change)="selected_grp(k.value)">
            <option *ngFor="let item of grp" [value]="item">
            {{item | dropdownpipe}}
            </option>
            </select>
            </div>
</ngform>
<br>
<br>
  `,
    styleUrls: ['./dropdown.css'],
    pipes: [Dropdownpipe]

})

@Injectable()
export class DropdownComponent {
    public lab;
    public lab_id;
    public grp;
    public grp_id;
    public selected_lab_id;
    public selected_grp_id;

    constructor() {
        this.get_data().then((output) => {
            this.lab_id = output.arr2
            this.lab = output.arr;
        })
    }

    get_data() {
        return new Promise((resolve, reject)=> {
            Meteor.call('search_labid', (err, res)=> {
                var arr = ['SELECT']; //Default value
                var arr2 = ['SELECT']; //Default value
                res.forEach(function (item, index) {
                    arr.push(res[index].name + '__' + res[index].id)
                    arr2.push(res[index].id)
                });
                resolve({arr, arr2});
            });
        });
    }

    display(value) {
        return new Promise((resolve, reject)=> {
            Meteor.call('search_grpid', value, (err, res)=> {
                var arr = ['SELECT'];//Default value
                var arr2 = ['SELECT'];//Default value
                if (res == null) {
                    resolve('')
                }
                else {
                    res.forEach(function (item, index) {
                        arr.push(res[index].name + '__' + res[index].id)
                        arr2.push(res[index].id)
                    });
                }
                resolve({arr, arr2});
            });
        });
    }

    displaying(value) {
        this.display(value.split("__")[1]).then((output) => {
            this.grp = output.arr;
            this.grp_id = output.arr2
        });
    }

    selected_lab(value) {
        console.log(value.split('__')[1])
        this.selected_lab_id = value.split('__')[1]
    }

    selected_grp(value) {
        console.log(value.split('__')[1]);
        this.selected_grp_id = value.split('__')[1]
    }

}