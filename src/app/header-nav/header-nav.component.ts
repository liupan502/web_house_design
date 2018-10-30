import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-header-nav',
    templateUrl: './header-nav.component.html',
    styleUrls: ['./header-nav.component.css']
})
export class HeaderNavComponent implements OnInit {

    workModuleName: string = '工作台';
    isDropDown: boolean = false;
    isLogin: boolean;
    name: string = '';

    constructor(private router: Router, private httpClient: HttpClient) {
        this.isLogin = true;
        this.name = sessionStorage.getItem('user');
    }

    ngOnInit() {
    }

    toRoute(routerLink, workModuleName) {
        this.router.navigate([routerLink]);
        this.workModuleName = workModuleName;
        this.isDropDown = false;
    }


    dropDown() {
        this.isDropDown = !this.isDropDown;

    }

    logout() {
    }
}
