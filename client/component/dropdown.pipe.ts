import {Pipe} from '@angular/core';

@Pipe({
    name: 'dropdownpipe'
})

export class Dropdownpipe{

    transform(value){
        if(value){
            return value.split('__')[0];
        }
    }
}