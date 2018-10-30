import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { urlPathConsts } from './../../../../service/http-service/url-path.const';
import { environment } from './../../../../../environments/environment';
import { AddressService } from '../../../service/address.service';
import { structForDetailData } from './detail-edit.module';
import { DesignService } from './../../../../service/design.service';

export class HouseLayout {
    no: string;
    name: string;
    floorplan_url: string;
    house_type: number = 0;
    area: number = 0;
    area_id?: number = 0;
    community_name?: string;
    community_id?: number = 0;
}
@Component({
    selector: 'app-detail-edit',
    templateUrl: './detail-edit.component.html',
    styleUrls: ['./detail-edit.component.css']
})
export class DetailEditComponent implements OnInit {
    public provinces: Array<object>;
    public citys: Array<object>;
    public areas: Array<object>;
    public provinceValue: string;
    public cityValue: string;
    public areaValue: string;
    public houseType: Array<object>;
    public houselayout: HouseLayout = new HouseLayout();
    public _no: string;

    textname: string;

    @Output() close = new EventEmitter();
    @Input() set no(no: string) {
        if (no) {
            this._no = no;
            this.getDetail(no);
        }
    }

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.provinceValue = 'default';
        this.cityValue = 'default';
        this.areaValue = 'default';
        this.houseType = [
            {
                'id': 0,
                'name': '其它'
            },
            {
                'id': 1,
                'name': '一室一厅'
            },
            {
                'id': 2,
                'name': '两室一厅'
            },
            {
                'id': 3,
                'name': '两室两厅'
            },
            {
                'id': 4,
                'name': '三室一厅'
            },
            {
                'id': 5,
                'name': '三室两厅'
            },
            {
                'id': 6,
                'name': '四室两厅'
            },
            {
                'id': 7,
                'name': '五室两厅'
            },
            {
                'id': 8,
                'name': 'LOFT'
            },
            {
                'id': 9,
                'name': '复式'
            }
        ];

        this.getAddressData();
    }

    getDetail(no: string) {
        const url = environment.urlBase + urlPathConsts.getDetailHouselayout + '?no=' + no;
        this.http.get(url).subscribe((res: any) => {
            if (res && res.data) {
                this.houselayout.name = res.data.name || '';
                this.houselayout.floorplan_url = res.data.floorplan_url;
                this.houselayout.house_type = res.data.house_type || 0;
                this.houselayout.area = res.data.area || 0;
                this.houselayout.area_id = res.data.id || 0;
                this.houselayout.community_name = res.data.community_name || '';
                this.houselayout.community_id = res.data.community_id || 0;
                this.houselayout.no = res.data.no;
            }
        }, error => {
            console.log(error)
        });
    }


    getAddressData() {
        this.http.get(environment.urlBase + urlPathConsts.getAddress).subscribe((res: any) => {
            if (res && res.data) {
                this.provinces = res.data;
            }
        }, error => {
            console.log('error: ' + error);
        });
    }

    /**
     * 设置城市列表
     * @param provinceCode
     * @returns {any[]}
     */
    private setCity(provinceCode: string) {
        if (this.provinces) {
            let result = new Array();
            for (let i = 0; i < this.provinces.length; i++) {
                const value = this.provinces[i];
                if (value['id'].toString() === provinceCode) {
                    result = value['city'];
                }
            }
            return result;
        }
    }

    /**
     * 设置地区列表
     * @param cityCode
     * @returns {any[]}
     */
    private setArea(cityCode: string) {
        if (this.citys) {
            let result = new Array();
            for (let i = 0; i < this.citys.length; i++) {
                const value = this.citys[i];
                if (value['id'].toString() === cityCode) {
                    result = value['area'];
                }
            }
            return result;
        }
    }

    public selectProvince(code: string) {
        this.cityValue = 'default';
        this.areaValue = 'default';
        this.citys = this.setCity(code);
    }

    public selectCity(code: string) {
        this.areaValue = 'default';
        this.areas = this.setArea(code);
    }

    selectArea() {
        console.log(this.areaValue)
    }

    save() {
        let areaValue, houselayoutNo;
        areaValue = this.areaValue !== 'default' ? this.areaValue : this.houselayout.area_id.toString();
        houselayoutNo = this._no  ? this._no : DesignService.houselayout_no;
        const data: FormData = new FormData();
        data.append('no', houselayoutNo);
        data.append('name', this.houselayout.name);
        data.append('house_type', this.houselayout.house_type.toString());
        data.append('area', this.houselayout.area.toString());
        data.append('area_id', areaValue);
        data.append('community_name', this.houselayout.community_name);

        this.http.post(environment.urlBase + urlPathConsts.saveHouselayout, data).subscribe((res: any) => {
            DesignService.houselayout_no = res.data.no;
            this.toClose();
        }, error => {
            console.log('error', error);
        });
    }

    toClose() {
        this.close.emit('close');
    }

    selectHouseType(event) {
        console.log('selectHouseType', event)
    }
}
