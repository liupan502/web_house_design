import { urlPathConsts } from './../../../../service/http-service/url-path.const';
import { environment } from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DrawHouseLayoutService, Message } from '../../../service/hsservice';
import { AddressService } from '../../../service/address.service';
// export enum HouselayoutType {
//     FREEDRAW = 0,
//     LIANGFANG = 1
// }

export class HouseLayout {
    // no: string;
    // name: string;
    // floorplan_url: string;
    // house_type: number = 0;
    // area: number = 0;
    // area_id?: number = 0;
    // community_name?: string;
    // community_id?: number = 0;
    // city_id?: number = 0;
    // community_name: string
    // city_name:string;
    // id: number;
    // name:string;
    // no: string;
    // house_type: number = 0;
    // area: number;
    // preview_url: string;
    // house_level: number;
    // thumbnail_url: string;
    // modify_time: string;
}

@Component({
    selector: 'app-search-houselayout',
    templateUrl: './search-houselayout.component.html',
    styleUrls: ['./search-houselayout.component.css'],
    providers: [AddressService]
})
export class SearchHouselayoutComponent implements OnInit {

    @Output() close = new EventEmitter();
    public isShowProvince: boolean = false;
    public isShowCity: boolean = false;
    public all = {};
    public provinces: Array<object>;
    public citys: Array<object> = [];
    public areas: Array<object>;
    public provinceValue: string;
    public provinceName: string;
    public provinceId: number = 0;
    //public cityValue: string;
    public cityId: number = 0;
    public areaValue: string;
    public houseType: Array<object>;
    //public houselayoutType: HouselayoutType = HouselayoutType.FREEDRAW;   
    
    public totalCount: number = 0;
    public searchHouselayouts: Array<object> = [];
    //public searchList: Array<object> = [];
    public houseName: string;
    public house_type: number = 0;

     public startIndex = 0;
     public preCount: number = 10;
   // public houselayout: HouseLayout = new HouseLayout();
    //public searchHouselayouts: HouseLayout[] = [];



    constructor(private drawHouseLayoutService: DrawHouseLayoutService,
        private addressService: AddressService,
        private http: HttpClient) {
    }

    ngOnInit() {
        this.provinceValue = 'default';
       // this.cityValue = 'default';
        this.areaValue = 'default';
        //this.house_type = 'default';
        this.provinceName = '上海'
        //this.setAll();
        //this.toSearchHouselayout();



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

        this.getAddressData()

    }

  

    toSearchHouselayout() {
        let url;
        // start_index = 0;

         url = environment.urlBase + urlPathConsts.searchHouselayout + '?start_index=' +  this.startIndex + '&count=' + this.preCount;
        // url = url +'&city_id=' + this.cityId + '&house_type='+ this.house_Type + '&query=' + this.houseName;
         url = (this.house_type !== undefined && this.house_type !== null) ? url + '&house_type=' + this.house_type : url;
         url = (this.houseName !== undefined && this.houseName !== null) ? url + '&query=' + this.houseName : url;
         url = (this.cityId !== undefined && this.cityId !== null) ? url + '&city_id=' + this.cityId : url;
  

        this.http.get(url).subscribe((res: any) => {
            console.log(res);
            if (res && res.data) {
                this.totalCount = res.data.total_count;
                this.searchHouselayouts = res.data.records;
                //this.houselayout.house_type = res.data.records.house_type_label || 0;
                //this.houselayout.city_id = res.data.records.city_id || 0


            }
        }, error => {
            console.log('error: ' + error);
        });
    }






    selectHouseType(event) {
        console.log('selectHouseType', event);


    }


    pageChange(event) {

    }

    // changeHouseType(index: number) {
    //     this.houselayoutType = index === 0 ? HouselayoutType.FREEDRAW : HouselayoutType.LIANGFANG;
    // }

    toClose() {
        this.close.emit('close');
    }

    openDetailEdit() {
        console.log('openDetailEdit');
        this.toClose();
        const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, 'DetailEdit');
        this.drawHouseLayoutService.postMessage(message);
    }

    toShowAdd() {
        this.isShowProvince = !this.isShowProvince;

    }

    toShowCity() {
        this.isShowCity = true;


    }

    toSelectCity() {
        this.isShowCity = false;

    }

    delete(no: string) {
        let formData = new FormData();
        formData.append('no', no);
        this.http.post(environment.urlBase + urlPathConsts.deleteHouselayout, formData).subscribe((res: any) => {
            console.log(res);
        }, error => {
            console.log('error: ' + error);
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
                if (value['id'] == provinceCode) {
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
       // this.cityValue = 'default';
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

    clickProvice(event, index, id, name) {
        this.citys = this.setCity(id);

        if (this.citys.length <= 1) {
            this.provinceName = name;
            this.provinceId = id;
           // console.log(this.provinceId)
            
            return
        }

        let ele, provinceNodes, parent, nodeNumber;
        parent = event.currentTarget.parentNode; 
        ele = document.getElementById('citylist');
        nodeNumber = Math.floor(index / 6) * 6 + 6 <= this.provinces.length ? Math.floor(index / 6) * 6 + 6 : this.provinces.length;
        console.log(parent, nodeNumber - 1)
        provinceNodes = document.getElementsByClassName('main-province')[nodeNumber-1];
        parent.insertBefore(ele, provinceNodes.nextSibling);
    }

    clickCity(name, id) {
        this.cityId = id;
        this.provinceName = name;
        this.isShowProvince = false;
        console.log(this.cityId,this.provinceName)
    }
}
