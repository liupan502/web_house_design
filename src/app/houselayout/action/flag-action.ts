
import {HouseLayoutActionManager, HouseLayoutAddAction, HouseLayoutDeleteAction, HouseLayoutModifyAction} from './base-houselayout-action'

import {HouseLayoutFlag} from '../../houselayout/entity/entity'

import {HouseLayoutGeometryFactory} from '../entity-geometry/entity-geometry'

function removeFlagGeo(mgr: HouseLayoutActionManager, flag: HouseLayoutFlag) {
    if (mgr === null || flag === null) {
        return;
    }

    const name = flag.showEntityInfo() + flag.id().toString();
    mgr.removeGeometry(name);
}

function addFlagGeo(mgr: HouseLayoutActionManager, flag: HouseLayoutFlag) {
    if (mgr === null || flag === null) {
        return;
    }
    const name = flag.showEntityInfo() + flag.id().toString();
    const geo = HouseLayoutGeometryFactory.CreateGeometry(flag);
    if (geo !== null) {
        mgr.addGeometry(name, geo);
    }
}

export class FlagAddAction extends HouseLayoutAddAction {
    constructor(flag: HouseLayoutFlag) {
        const objects = new Array<any>();
        objects.push(flag);
        super(objects);
    }

    flag(): HouseLayoutFlag {
        return <HouseLayoutFlag>this.objects_[0];
    }

    excute(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houselayout = mgr.houseLayout();
        const flag = this.flag();
        // set istmp 为false 以通知底层更新集合信息
        flag.setIsTmp(false);
        
        if (flag !== null) {
            addFlagGeo(this.houseLayoutActionManager(), flag);
            const result =  flag.addToHouseLayout(houselayout);            
            this.objects_[0] = <HouseLayoutFlag>(flag.shallowclone());            
            return result;
        }  else {
            return false;
        }
    }

    cancel(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houselayout = mgr.houseLayout();
        const flag = this.flag();
        if (flag !== null) {   
            removeFlagGeo(this.houseLayoutActionManager(), flag);      
            return flag.removeFromHouseLayout(houselayout);
        } else {
            return false;
        }
    }

    
}

export class FlagDeleteAction extends HouseLayoutDeleteAction {
    constructor(flag: HouseLayoutFlag) {
        const objects = new Array<any>();
        objects.push(flag);
        super(objects);
    }

    flag(): HouseLayoutFlag {
        return <HouseLayoutFlag>this.objects_[0];
    }

    excute(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houseLayout = mgr.houseLayout();
        const flag = this.flag();
        removeFlagGeo(this.houseLayoutActionManager(), flag);
        return flag.removeFromHouseLayout(houseLayout);
    }

    cancel(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houselayout = mgr.houseLayout();
        const flag = this.flag();
        addFlagGeo(this.houseLayoutActionManager(), flag);
        const result =  flag.addToHouseLayout(houselayout);       
        return result;
    }
}

export class FlagModifyAction extends HouseLayoutModifyAction {
    constructor(previousFlag: HouseLayoutFlag, currentFlag: HouseLayoutFlag) {
        const preObjects = new Array<any>();
        preObjects.push(previousFlag);
        const currentObjects = new Array<any>();
        currentObjects.push(currentFlag);
        super(preObjects, currentObjects);
    }

    previousFlag(): HouseLayoutFlag {
        return <HouseLayoutFlag>this.previousObjects_[0];
    }

    currentFlag(): HouseLayoutFlag {
        return <HouseLayoutFlag> this.currentObjects_[0];
    }

    /**
     * 执行修改动作时，将新版本的flag实体的数据赋值给houselayout内部对应的flag实体（通过addToHouseLayout）
     */     
    excute(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houselayout = mgr.houseLayout();
        const preFlag = this.previousFlag();
        const currentFlag = this.currentFlag();   

        removeFlagGeo(this.houseLayoutActionManager(), preFlag);
        addFlagGeo(this.houseLayoutActionManager(), currentFlag);


        // preFlag.removeFromHouseLayout(houselayout);        
        currentFlag.setIsTmp(false);
        currentFlag.addToHouseLayout(houselayout);       
        
        

        this.currentObjects_[0] = this.currentFlag().shallowclone();
        return true;
    }

    /**
     * 执行撤销修改动作时，将新版本的flag实体的数据赋值给houselayout内部对应的flag实体（通过addToHouseLayout）
     */  
    cancel(): boolean {
        const mgr = this.houseLayoutActionManager();
        const houselayout = mgr.houseLayout();
        const preFlag = this.previousFlag();
        const currentFlag = this.currentFlag();

        removeFlagGeo(this.houseLayoutActionManager(), currentFlag);
        addFlagGeo(this.houseLayoutActionManager(), preFlag);

        // currentFlag.removeFromHouseLayout(houselayout);        
        preFlag.setIsTmp(false);
        preFlag.addToHouseLayout(houselayout);
        
        return true;
    }
 }