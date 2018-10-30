import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.css'],
    animations: [
        trigger('showChanged', [
            state('active', style({})),
            state('inactiveLeft', style({'transform': 'translateX(-100%)'})),
            state('inactiveRight', style({'transform': 'translateX(100%)'})),
            transition('* => *', animate(200))
        ])
    ]
})
export class SideBarComponent implements OnInit {

    @Input() sidePos: string;

    showChanged: string;
    isShow: boolean = false;
    src: string;

    constructor() {
    }

    ngOnInit() {
    }

    toggle() {
        this.showChanged = this.isShow ? 'active' : (this.sidePos === 'right' ? 'inactiveRight' : 'inactiveLeft');
        this.isShow = !this.isShow;
    }

}
