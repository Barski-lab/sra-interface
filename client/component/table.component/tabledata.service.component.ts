import { Component, Injectable } from '@angular/core';

@Component({

})

@Injectable()

export class TableService {
    public tabledata;

    getjson(json){
        this.tabledata = json
        return json
    }
}