import {Component,ElementRef, OnInit, OnDestroy} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common'
import {LoadingService} from "./loading_service";

@Component({
    selector: 'loading-indicator',
    directives: [CORE_DIRECTIVES],
    template:`
<div [style.visibility]="isLoading ? 'visible':'hidden'" class="loading-indicator-container">
<div class="bullet-one">
<img src="http://delpad.com/template/bitrix/img/loading.gif">
<style>
img{
        vertical-align: text-top;
        border: none;
        cursor: pointer;
        height: 200px;
        width: 100%;
        alt:"LOADING..."
}
</style>
</div>
</div>
`
})

export class LoadingIndicator implements OnInit, OnDestroy {
    private isLoading = false;
    private subscription: any;
    constructor (public el:ElementRef, public loadingService:LoadingService){}

    showOrHideLoadingIndicator(loading){
        this.isLoading = loading;
        if(this.isLoading) this.playLoadingAnimation();
    }

    playLoadingAnimation(){
        console.log('PLAYING IMAGE')
    }

    ngOnInit(){
        this.subscription = this.loadingService.loading$.subscribe(loading =>
        this.showOrHideLoadingIndicator(loading));
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}
