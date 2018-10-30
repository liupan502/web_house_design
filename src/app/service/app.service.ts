import { Injectable } from '@angular/core'
import { Design, HouseLayout } from '../houselayout/entity/entity'
import { uuid } from '../math/math';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { urlPathConsts } from './http-service/url-path.const';
import { DesignService } from './design.service';
// import { FaimService } from './/faim.service';

@Injectable()
export class AppService {

    constructor(
        private http: HttpClient, 
        private designService: DesignService,
        // private faimService: FaimService
    ) {
        
    }

    // 向后台保存设计
    saveDeign() {
        const designinfo = this.designService.getDesign();
        const jsonresult = designinfo.toJSON();
        const data = {
            'name': Date.now,
            'no': DesignService.design_.uuid,
            'design_data': JSON.stringify(jsonresult),
            'state': 0,
            'houselayout_no': '121222',
            'design_style': 1,
            'house_type': 1,
            'BIM_data': '',
            'preview_fpath': ''
        };

        if (DesignService.designId) {
            this.http.put(environment.urlBase + urlPathConsts.savaData + DesignService.design_.uuid + '/', data).subscribe((res: any) => {
            }, (err: any) => {
                console.log('An error occurred:', err);
            });
        } else {
            this.http.post(environment.urlBase + urlPathConsts.savaData, data).subscribe((res: any) => {
                DesignService.setDesignId(res.id.toString());
                this.saveDeign();
            }, (err: any) => {
                console.log('An error occurred:', err);
            });
        }
    }
}

