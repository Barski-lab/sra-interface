import {Pipe} from '@angular/core';

@Pipe({
    name: 'displaypipe'
})

export class DisplayPipe{
    transform(value){
        if(value){
            return JSON.stringify(value).replace(/\"/g,"");
        }
    }
}