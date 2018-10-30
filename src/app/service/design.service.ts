import { Injectable } from '@angular/core'
import { Design, HouseLayout } from '../houselayout/entity/entity'
import { uuid } from '../math/math';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { urlPathConsts } from './http-service/url-path.const';

@Injectable()
export class DesignService {
    public static designId: string; // 后端生成Id
    public static design_no: string; // 前端生成Id
    public static houselayout_no = 'empty';
    public static design_: Design = null;
    private activeRoomId: number = null;

    static setDesignId(id: string) {
        DesignService.designId = id;
        if (!DesignService.design_.designId) {
            DesignService.design_.designId = id;
        }
    }

    static getDesignId(): string {
        return DesignService.designId;
    }

    constructor(private http: HttpClient) {

    }


    getDesign(): Design {
        if (DesignService.design_ === null) {
            DesignService.design_ = new Design();
            DesignService.design_no = DesignService.design_.uuid;
        }

        if (DesignService.design_.designId) {
            DesignService.designId = DesignService.design_.designId; 
        }

        return DesignService.design_;
    }

    getHouseLayout(): HouseLayout {
        return this.getDesign().houseLayout();
    }


    // 设置导航房间
    setActiveRoomId(roomId: number) {
        this.activeRoomId = roomId;
    }

    // 获取导航房间
    getActiveRoomId(): number {
        return this.activeRoomId;
    }
}

