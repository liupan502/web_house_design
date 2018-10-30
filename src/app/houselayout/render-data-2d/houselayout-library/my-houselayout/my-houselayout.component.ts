import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DrawHouseLayoutService, Message } from '../../../service/hsservice';
import { environment } from '../../../../../environments/environment';
import { urlPathConsts } from '../../../../service/http-service/url-path.const';
import { HttpClient } from '@angular/common/http';

export enum HouselayoutType {
    FREEDRAW = 0,
    LIANGFANG = 1
}

@Component({
    selector: 'app-my-houselayout',
    templateUrl: './my-houselayout.component.html',
    styleUrls: ['./my-houselayout.component.css']
})
export class MyHouselayoutComponent implements OnInit {

    public houselayoutType: HouselayoutType = HouselayoutType.FREEDRAW;
    @Output() close = new EventEmitter();
    public preCount: number = 8;
    public totalCount: number = 0;
    public myHouselayouts: Array<object> = [];
    public startIndex = 0;

    constructor(private drawHouseLayoutService: DrawHouseLayoutService,
        private http: HttpClient) {
    }

    ngOnInit() {
        this.getMyHouselayout();
    }

    getMyHouselayout() {
        const url = environment.urlBase + urlPathConsts.ownHouselayout + '?start_index=' + this.startIndex + '&count=' + this.preCount;

        this.http.get(url).subscribe((res: any) => {
            if (res && res.data) {
                this.totalCount = res.data.total_count;
                this.myHouselayouts = res.data.records;
            }
        }, error => {
            console.log('error: ' + error);
        });
    }

    pageChange(event) {
        this.startIndex = event.first;
        this.getMyHouselayout();
    }

    changeHouseType(index: number) {
        this.houselayoutType = index === 0 ? HouselayoutType.FREEDRAW : HouselayoutType.LIANGFANG;
    }

    toClose() {
        this.close.emit('close');
    }

    openDetailEdit(no: string) {
        this.toClose();
        const info = new Array();
        info.push('DetailEdit');
        info.push(no);
        const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, info);
        this.drawHouseLayoutService.postMessage(message);
    }

    delete(event, no: string) {
        let formData = new FormData();
        formData.append('no', no);
        let parentNode;
        parentNode = event.currentTarget.parentElement.parentElement;
        this.http.post(environment.urlBase + urlPathConsts.deleteHouselayout, formData).subscribe((res: any) => {
            parentNode.remove();
        }, error => {
            console.log('error: ' + error);
        });
    }
}
