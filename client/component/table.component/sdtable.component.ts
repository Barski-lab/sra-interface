import {
    Component,
    Input,
    ComponentFactory,
    ComponentRef,
    ViewContainerRef,
    ComponentResolver,
    ViewChild, NgZone, OnInit
} from '@angular/core';

import {NgClass} from '@angular/common';
import {TableService} from "./tabledata.service.component";

abstract class SDTableBase {

    cmpRef:ComponentRef<any>;

    protected isViewInitialized:boolean = false;

    abstract updateComponent();

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.updateComponent();
    }

    ngOnDestroy() {
        if(this.cmpRef) {
            this.cmpRef.destroy();
        }
    }

    findEntity(index, lookFor){
        if(!lookFor){
            return "";
        }
        var arr = lookFor.split(".");
        while(arr.length && (index = index[arr.shift()]));
        return index;

    }
}
/**
 *
 *
 *
 */

@Component({
    selector: 'sd-cell',
    template: `

<div #target>{{writing}} </div>

`

})
export class SDCell extends SDTableBase implements OnInit{

    @ViewChild('target', {read: ViewContainerRef})
    target;

    @Input()
    data;

    @Input()
    cell;

    writing: any = "";

    constructor(private resolver: ComponentResolver, private _zone:NgZone){
        super();
    }

    ngOnInit(){
        if(this.cell.title){
            this.writing = this.cell.title;
        }

        if(!this.cell.type && !this.cell.title){
            this._zone.run(()=> {
                this.writing = this.findEntity(this.data, this.cell.path);
            });
        }
    }


    updateComponent() {
        if(!this.isViewInitialized) {
            return;
        }
        if(this.cmpRef) {
            this.cmpRef.destroy();
        }
        if(this.cell.type){

            this.resolver.resolveComponent(this.cell.type).then((factory:ComponentFactory<any>) => {
                this.cmpRef = this.target.createComponent(factory);
                this.cmpRef.instance.setData(this.findEntity(this.data, this.cell.path));
            });
        }

    }
}

/**
 *
 *
 *
 */
@Component({
    selector: 'sd-table',
    template:`        
        
    <table class='table' [ngClass]="styles" >
     
        <thead>
            <tr> 
                <th *ngFor="let headercell of header" [ngClass]="headercell.styles"> 
                    <i *ngIf="headercell.sorted == true" class="fa fa-sort pull-right" aria-hidden="true" style="vertical-align: middle;" (click)="sort(data)"></i>
                    <i *ngIf="headercell.sorted == 'asc'" class="fa fa-sort-asc pull-right" aria-hidden="true" style="vertical-align: middle;" (click)="sort(data)"></i>
                    <i *ngIf="headercell.sorted == 'desc'" class="fa fa-sort-desc pull-right" aria-hidden="true" style="vertical-align: middle;" (click)="sort(data)"></i>                   <sd-cell [cell]="headercell">
                   </sd-cell>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let index of data">
                <td *ngFor="let cell of cells" [ngClass]="cell.styles" >
                    <sd-cell [cell]="cell" [data]="index"></sd-cell>
               </td>
            </tr>            
        </tbody>
    </table>
    
      `,
    directives: [SDCell, NgClass, TableService]

})
export class SDTable implements OnInit{

    @Input()
    data: any[];
    @Input()
    cells: any[];
    @Input()
    header: any[];
    @Input()
    styles: any;

    keys:any = "";

    ngOnInit(){
        this.cells = this.clean(this.cells);
        this.data = this.clean(this.data);
        this.header = this.clean(this.header);
    }

    clean(unclean){
        var arr=[];
        arr = unclean.filter(function(ele){
            if (Object.keys(ele).length>0){
                return ele;
            }
        });

        return arr;
    }
}
