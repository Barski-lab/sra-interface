import {Pipe} from '@angular/core';

@Pipe({
    name: 'layoutpipe'
})

export class LayoutPipe{
    transform(value){
        var start_pos = value.indexOf('{') + 1;
        var end_pos = value.indexOf(':',start_pos);
        return value.substring(start_pos,end_pos)
    }
}
