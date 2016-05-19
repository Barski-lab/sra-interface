import { Pipe } from '@angular/core';

@Pipe({
    name: 'linkpipe'
})
export class LinkPipe {
    transform(val, args) {
        if (args === undefined) {
            return val;
        }

        if (val.length > args) {
            return val.substring(0, args);
        } else {
            return val;
        }
    }
}