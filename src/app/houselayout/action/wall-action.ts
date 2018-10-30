import { HouseLayout } from './../entity/house-layout';
import {HouseLayoutAddAction,
    HouseLayoutDeleteAction,
    HouseLayoutModifyAction,
    HouseLayoutActionManager} from './base-houselayout-action'

import {Segment} from '../geometry/geometry'
import {Opening, InnerWall} from '../entity/entity'
import {
    //DesignService,
     DrawHouseLayoutService, Message} from '../service/hsservice'

import {HouseLayoutGeometryFactory} from '../entity-geometry/entity-geometry'
// import {DrawHouseLayoutWrapper} from '../wrapper/wrapper'



/**
 * 发送一条增加图元信息
 * @param mgr
 * @param wall
 */
export function addWallGeo(mgr: HouseLayoutActionManager, wall:InnerWall) {
    if (mgr === null || wall === null) {
        return;
    }

    const name = wall.showEntityInfo() + wall.id().toString();
    const geo = HouseLayoutGeometryFactory.CreateGeometry(wall);
    if (geo !== null) {
        mgr.addGeometry(name, geo);
    }
}

export function removeWallGeo(mgr: HouseLayoutActionManager, wall: InnerWall) {
    if (mgr === null || wall === null) {
        return;
    }

    const name = wall.showEntityInfo() + wall.id().toString();
    mgr.removeGeometry(name);
}

export class WallAddAction extends HouseLayoutAddAction {
    constructor(wall: InnerWall, opening?: any, segment?: any) {
        const objects = new Array<any>();
        objects.push(wall);
        objects.push(opening);
        objects.push(segment);
        super(objects);
    }

    /**
     * featrue: 获取（与attachedOpenging的）公共墙信息
     */
    protected attachingWall(): Segment {
        return <Segment> this.objects_[2];
    }

    /**
     * feature: 获取可能的附带Opening信息
     */
    protected attachedOpenging(): Opening {
        return <Opening> this.objects_[1];
    }

    protected wall(): InnerWall {
        return <InnerWall> this.objects_[0];
    }


    excute(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout();
        const wall = this.wall();
        /// 添加墙时根据场景会有一个至多个墙壁被添加到数据中，则需要获得该数据（array），依此添加其对应geo
        const addedWalls = houselayout.addWall(wall, this.attachedOpenging(), this.attachingWall());
        if(addedWalls !== null) {
            for(let i = 0; i < addedWalls.length; i++) {
                addWallGeo(this.houseLayoutActionManager(), addedWalls[i]);
            }
        }

        this.houseLayoutActionManager().resumeToDefaultTool();
        return true;
    }

    cancel(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout();
        const popedWalls = houselayout.popWall(this.attachedOpenging());
        const wall = this.wall();
        // removeWallGeo(this.houseLayoutActionManager(), wall);

        if(popedWalls !== null ) {
            for(let i = 0; i < popedWalls.length; i++) {
                removeWallGeo(this.houseLayoutActionManager(), popedWalls[i]);
            }
        }

        this.houseLayoutActionManager().resumeToDefaultTool();
        return true;
    }

}

export class WallDeleteAction extends HouseLayoutDeleteAction {
    constructor(wall: InnerWall, opening?: any, segment?: any) {
        const objects = new Array<any>();
        objects.push(wall);
        objects.push(opening);
        objects.push(segment);
        super(objects);
    }

    protected wall(): InnerWall {
        return <InnerWall> this.objects_[0];
    }

    /**
     * feature: 获取可能的附带Opening信息
     */
    protected attachedOpenging(): Opening {
        return <Opening> this.objects_[1];
    }

    /**
     * featrue: 获取（与attachedOpenging的）公共墙信息
     */
    protected attachingWall(): Segment {
        return <Segment> this.objects_[2];
    }

    excute(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout();
        houselayout.popWall();
        removeWallGeo(this.houseLayoutActionManager(), this.wall());
        return true;
    }

    cancel(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout();
        houselayout.addWall(this.wall(), this.attachedOpenging(), this.attachingWall());
        addWallGeo(this.houseLayoutActionManager(), this.wall());
        return true;
    }
}

export class WallModifyAction extends HouseLayoutModifyAction {

    protected isFirst_: boolean;
    constructor(previousWall: InnerWall, currentWall: InnerWall) {
        const preObjects = new Array<any>();
        preObjects.push(previousWall);
        const currentObjects = new Array<any>();
        currentObjects.push(currentWall);
        super(preObjects, currentObjects);
    }

    previousWall(): InnerWall {
        return <InnerWall>this.previousObjects_[0];
    }

    currentWall(): InnerWall {
        return <InnerWall>this.currentObjects_[0];
    }

    excute(): boolean {

        const currentWall = this.currentWall(); // 新版本
        const previousWall = this.previousWall(); // 旧版本
        // 维护数据版本即可
        const houselayout = this.houseLayoutActionManager().houseLayout();
        houselayout.addWall(currentWall);

        removeWallGeo(this.houseLayoutActionManager(), previousWall)
        addWallGeo(this.houseLayoutActionManager(), currentWall);
        return true;
    }

    cancel(): boolean {
        const previousWall = this.previousWall(); // 旧版本
        const currentWall = this.currentWall();  // 新版本
        const houselayout = this.houseLayoutActionManager().houseLayout();

        houselayout.addWall(previousWall);

        removeWallGeo(this.houseLayoutActionManager(), currentWall);
        addWallGeo(this.houseLayoutActionManager(), previousWall);
        return true;
    }
}
