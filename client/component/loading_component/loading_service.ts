import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/share'
import {Injectable} from "@angular/core";

@Injectable()
export class LoadingService {
    loading$: Observable<String>;
    private _observer: Observer<String>;

    constructor(){
        this.loading$ = new Observable(
            observer => this._observer = observer).share();
    }

    toggleLoadingIndicator(name){
        if(this._observer){
            this._observer.next(name);
        }
    }
}