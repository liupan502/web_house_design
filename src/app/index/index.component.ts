import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from './../../environments/environment';
import { urlPathConsts } from './../service/http-service/url-path.const';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

    public isShowVertify = false;
    public userName: string;
    public userPhone: number;

    constructor(
        public http: Http,
        public activeRouter: ActivatedRoute,
        public router: Router
    ) { }

    ngOnInit() {
        this.activeRouter.queryParams.subscribe(params => {
            if (params) {
                // 确定模块
                let url = '';
                switch (params.m) {
                    case 'design':
                        url = './../design'
                        break;
                    default:
                        url = '/'
                }

                this.router.navigate([url], { queryParams: params })

            }
        })
    }

    sumbitApply() {
        if (!this.userPhone || !this.userName) {
            return
        }

        const data = new FormData();
        data.append('username', this.userName);
        data.append('mobile', this.userPhone.toString());

        this.http.post(environment.urlBase + urlPathConsts.create, data).subscribe((res: any) => {
            this.isShowVertify = true;
        }, error => {
            console.log('error: ' + error);
        });
    }
}
