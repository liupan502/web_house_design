import {HouseLayoutAddAction, 
    HouseLayoutDeleteAction, 
    HouseLayoutModifyAction, 
    HouseLayoutActionManager} from './base-houselayout-action'
import {Opening, Room, HouseLayout} from '../../houselayout/entity/entity'
import {Segment} from '../../geometry/geometry'
import {HouseLayoutGeometryFactory} from '../entity-geometry/entity-geometry'

function addOpeningGeo(mgr: HouseLayoutActionManager, opening: Opening) {
    if (mgr === null || opening === null) {
        return;
    }

    const name = opening.showEntityInfo() + opening.id().toString();
    const geo = HouseLayoutGeometryFactory.CreateGeometry(opening);
    if (geo !== null) {
        mgr.addGeometry(name, geo);
    }
}

function removeOpeningGeo(mgr: HouseLayoutActionManager, opening: Opening) {
    if (mgr === null || opening === null) {
        return;
    }

    const name = opening.showEntityInfo() + opening.id().toString();
    mgr.removeGeometry(name);
}

export class OpeningAddAction extends HouseLayoutAddAction {
    constructor(opening: Opening) {
        const objects = new Array<any>();
        objects.push(opening);
        super(objects);
    }

    protected opening(): Opening {
        return <Opening>this.objects_[0];
    }

    protected wall(): Segment {
        return <Segment> this.objects_[1];
    }

    /**
     * 添加动作被激活
     */
    excute(): boolean {
        const opening = this.opening();
        // 0. 非法输入判断
        if (opening === null) {
            return false;
        }

        // 1. 获取houselayout（环境)
        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        addOpeningGeo(this.houseLayoutActionManager(), opening);
        const houseLayout: HouseLayout = mgr.houseLayout();   

        // 2, 添加实体
        const binfo =  opening.addToHouseLayout(houseLayout);
        this.objects_[0] = <Opening>opening.shallowclone();       
        return true;
    }

    cancel(): boolean {
        const opening = this.opening();
        if (opening === null) {
            return false;
        }

        removeOpeningGeo(this.houseLayoutActionManager(), opening);
        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        const houseLayout: HouseLayout = mgr.houseLayout();
        
        const result = opening.removeFromHouseLayout(houseLayout);
        return result;
    }
    
}

export class OpeningDeleteAction extends HouseLayoutDeleteAction {
    constructor(opening: Opening) {
        const objects = new Array<any>();
        objects.push(opening);
        super(objects);
    }

    protected opening(): Opening {
        return <Opening>this.objects_[0];
    }

    excute(): boolean {
        const opening = this.opening();
        if (opening === null) {
            return false;
        }

        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        removeOpeningGeo(mgr, opening);
        const houseLayout: HouseLayout = mgr.houseLayout();
        return opening.removeFromHouseLayout(houseLayout);

    }

    cancel(): boolean {
        const opening = this.opening();
        if (opening === null) {
            return false;
        }

        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        addOpeningGeo(mgr, opening);
        const houseLayout: HouseLayout = mgr.houseLayout();
        const result =  opening.addToHouseLayout(houseLayout);
        return result;
    }

}


export class OpeningModifyAction extends HouseLayoutModifyAction {
    constructor(previousOpening: Opening, currentOpening: Opening) {
        const preObjects = new Array<any>();
        preObjects.push(previousOpening);
        const currentObjects = new Array<any>();
        currentObjects.push(currentOpening);
        super(preObjects, currentObjects);
    }

    previousOpening(): Opening {
        return <Opening>this.previousObjects_[0];
    }

    currentOpening(): Opening {
        return <Opening>this.currentObjects_[0];
    }

    /**
     * 执行修改动作时，将新版本的Opening的数据赋值给houselayout内部对应的opening实体（通过addToHouseLayout）
     */    
    excute(): boolean {
        const previousOpening = this.previousOpening();
        const currentOpening = this.currentOpening();
        if (previousOpening === null || currentOpening === null) {
            return false; 
        }

        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        removeOpeningGeo(mgr, previousOpening);
        addOpeningGeo(mgr, currentOpening);
        const houseLayout: HouseLayout = mgr.houseLayout();
        // previousOpening.removeFromHouseLayout(houseLayout);   
        
        currentOpening.addToHouseLayout(houseLayout);
        this.currentObjects_[0] = currentOpening.shallowclone();
        
        return true;
    }


    /**
     * 执行修改动作时，将旧版本的Opening的数据赋值给houselayout内部对应的opening实体（通过addToHouseLayout）
     */     
    cancel(): boolean {
        const previousOpening = this.previousOpening();
        const currentOpening = this.currentOpening();
        if (previousOpening === null || currentOpening === null) {
            return false;
        }
      
        const mgr: HouseLayoutActionManager = this.houseLayoutActionManager();
        removeOpeningGeo(mgr, currentOpening);
        addOpeningGeo(mgr, previousOpening);
        const houseLayout: HouseLayout = mgr.houseLayout();
        // currentOpening.removeFromHouseLayout(houseLayout);       
        previousOpening.addToHouseLayout(houseLayout);        
        return true;
    }
}