import {BaseAction, BaseAddAction, BaseDeleteAction, BaseModifyAction, BaseActionManager} from './action'

import {
    //DesignService, 
     DrawHouseLayoutService, Message} from '../service/hsservice'

import {HouseLayout} from '../../houselayout/entity/entity'

import {BaseEntityGeometry} from '../entity-geometry/entity-geometry'

function ConvertToHouseLayoutActionManager(mgr: BaseActionManager): HouseLayoutActionManager {
    if (mgr === null || mgr === undefined) {
        return null;
    }

    if (! (mgr instanceof HouseLayoutActionManager)) {
        return null;
    }
    return <HouseLayoutActionManager>mgr;
}

export class HouseLayoutActionManager extends BaseActionManager {
    protected houseLayout_: HouseLayout;
    protected dhlService_: DrawHouseLayoutService;
    constructor(houselayout: HouseLayout, dhlService: DrawHouseLayoutService) {
        super();
        this.houseLayout_ = houselayout;
        this.dhlService_ = dhlService;
    }

    houseLayout(): HouseLayout {
        return this.houseLayout_;
    }

        /**
     * 发送一条添加可渲染的图元的消息
     * @param name 
     * @param geometry 
     */
    addGeometry(name: string, geometry: BaseEntityGeometry) {
        const array = new Array();
        array.push(name);
        array.push(geometry);
        const message = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
        this.dhlService_.postMessage(message);
    }

    /**
     * 发送一条移除可渲染的图元的消息
     * @param name 
     */
    removeGeometry(name: string) {
        const array = new Array();
        array.push(name);
        const msg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, array);
        this.dhlService_.postMessage(msg);
    }

    /**
     * 发送更新激活点信息
     */
    initActivatedPoint() {
        const array = null;
        const msg = new Message(DrawHouseLayoutService.INIT_ACTIVATEDPOINTS, array);
        this.dhlService_.postMessage(msg);      
    }

    /**
     * 发送消息让tool恢复到默认状态
     */
    resumeToDefaultTool() {
        const array = null;
        const msg = new Message(DrawHouseLayoutService.DETECT_TOOL_STATUS, array);
        this.dhlService_.postMessage(msg);
    }
    

}

export class HouseLayoutAddAction extends BaseAddAction {
    constructor(objects: Array<any>) {
        super(objects);
    }

    houseLayoutActionManager(): HouseLayoutActionManager {
        return ConvertToHouseLayoutActionManager(this.mgr_);
    }
}

export class HouseLayoutDeleteAction extends BaseDeleteAction {
    /*constructor(objects: Array<any>) {
        super(objects);
    }*/

    houseLayoutActionManager(): HouseLayoutActionManager {
        return ConvertToHouseLayoutActionManager(this.mgr_);
    }
}

export class HouseLayoutModifyAction extends BaseModifyAction {
    
    
    houseLayoutActionManager(): HouseLayoutActionManager {
        return ConvertToHouseLayoutActionManager(this.mgr_);
    }
}

