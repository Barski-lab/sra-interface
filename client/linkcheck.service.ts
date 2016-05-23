import { Injectable } from '@angular/core';
import { HTTP } from 'meteor/http';
import { } from 'meteor/http'
@Injectable()

export class LinkCheck {
    constructor(){
    }
    check(link){
        var req= new XMLHttpRequest();
        req.open('GET', link, true);
    }
}