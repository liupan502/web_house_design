import { Room } from './../entity/room';
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

function addWallGeo(mgr: HouseLayoutActionManager, wall:InnerWall) {
    if (mgr === null || wall === null) {
        return;
    }

    const name = wall.showEntityInfo() + wall.id().toString();
    const geo = HouseLayoutGeometryFactory.CreateGeometry(wall);
    if (geo !== null) {
        mgr.addGeometry(name, geo);
    }    
}

function removeWallGeo(mgr: HouseLayoutActionManager, wall: InnerWall) {
    if (mgr === null || wall === null) {
        return;
    }

    const name = wall.showEntityInfo() + wall.id().toString();
    mgr.removeGeometry(name);
} 

/**
 * 添加房屋绘图数据，
 * 使用innerWall数组构造。
 */
export class DrawroomAddAction extends HouseLayoutAddAction {
    protected wallnumber: number;    
    protected room_: Room;
    constructor( walls: Array<InnerWall>,opening?: any, segment?: any) {
        let objects = new Array<any>();
        if(walls) {
            for(let i = 0; i < walls.length; i++) {
                objects.push(walls[i]);
            }
        }
        objects.push(opening);
        objects.push(segment);
        super(objects);
        if(walls) {
            this.wallnumber = walls.length;
        } else {
            this.wallnumber = 0;
        }
    }


    walls() {
        const wallinfo = new Array<InnerWall>();
        for(let i = 0; i < this.wallnumber;i++) {
            wallinfo.push(this.objects_[i]);
        }

        return wallinfo;
    }

    /**
     * feature: 获取可能的附带Opening信息
     */
    protected attachedOpenging(): Opening {
        return <Opening> this.objects_[this.wallnumber  ];
    }

    /**
     * featrue: 获取（与attachedOpenging的）公共墙信息
     */
    protected attachingWall(): Segment {
        return <Segment> this.objects_[this.wallnumber + 1];
    }

    /**将现有的临时数据组成房间，并记录这个房间 = */
    excute(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout(); 
        // const tmpWall = houselayout.tmpWall();

        const walls = this.walls();
        for(let i = 0; i < walls.length; i++) {
            houselayout.addWall(walls[i],this.attachedOpenging(),this.attachingWall());      
            
            // 添加图像渲染
            addWallGeo(this.houseLayoutActionManager(), walls[i]);
        }


        const rooms = houselayout.rooms();
        this.room_ = rooms[0];
        // 当前id最大房间为添加房间（暂未考虑翻转）
        for(let i = 0; i < rooms.length; i++) {
            if(rooms[i].id() >= this.room_.id()) {
                this.room_ = rooms[i];
            }
        }
        
        this.houseLayoutActionManager().resumeToDefaultTool();        
        
        return true;
    }

    cancel(): boolean {
        const houselayout = this.houseLayoutActionManager().houseLayout();
        const result = houselayout.removeRoom(this.room_);

        // 清除房间图像渲染
        const walls = this.walls();
        if(result) {
            for(let i = 0; i < walls.length; i++) {
                removeWallGeo(this.houseLayoutActionManager(), walls[i]);
                
            }
        }

        this.houseLayoutActionManager().resumeToDefaultTool();          
        return true;
    }

}

export class DrawroomDeleteAction extends HouseLayoutDeleteAction {
    protected wallnumber: number;
    constructor(walls: Array<InnerWall>, opening?: any, segment?: any) {
        let objects = new Array<any>();
        objects = objects.concat(walls);
        objects.push(opening);
        objects.push(segment);
        super(objects);
        if(walls) {
            this.wallnumber = walls.length;     
        } else {
            this.wallnumber = 0;
        }
    }

    protected walls(): Array<InnerWall> {
        const walls = new Array<InnerWall>();
        for(let i = 0; i < this.wallnumber; i++) {
            walls.push(this.objects_[i]);
        }

        return walls;
    }

    /**
     * feature: 获取可能的附带Opening信息
     */
    protected attachedOpenging(): Opening {
        return <Opening> this.objects_[this.wallnumber + 1];
    }

    /**
     * featrue: 获取（与attachedOpenging的）公共墙信息
     */
    protected attachingWall(): Segment {
        return <Segment> this.objects_[this.wallnumber + 2];
    }

    excute(): boolean {
        // const houselayout = this.houseLayoutActionManager().houseLayout();
        // houselayout.popWall();
        // removeWallGeo(this.houseLayoutActionManager(), this.wall());
        return true;
    }

    cancel(): boolean {
        // const houselayout = this.houseLayoutActionManager().houseLayout();
        // houselayout.addWall(this.wall(), this.attachedOpenging(), this.attachingWall()); 
        // addWallGeo(this.houseLayoutActionManager(), this.wall());
        return true;
    }
}

// export class WallModifyAction extends HouseLayoutModifyAction {

//     protected isFirst_: boolean;
//     constructor(previousWall: InnerWall, currentWall: InnerWall) {
//         const preObjects = new Array<any>();
//         preObjects.push(previousWall);
//         const currentObjects = new Array<any>();
//         currentObjects.push(currentWall);
//         super(preObjects, currentObjects);        
//     }

//     previousWall(): InnerWall {
//         return <InnerWall>this.previousObjects_[0];
//     }

//     currentWall(): InnerWall {
//         return <InnerWall>this.currentObjects_[0];
//     }

//     excute(): boolean {        

//         const currentWall = this.currentWall(); // 新版本
//         const previousWall = this.previousWall(); // 旧版本
//         // 维护数据版本即可
//         const houselayout = this.houseLayoutActionManager().houseLayout(); 
//         houselayout.addWall(currentWall);

//         removeWallGeo(this.houseLayoutActionManager(), previousWall)
//         addWallGeo(this.houseLayoutActionManager(), currentWall);    
//         return true;
//     }

//     cancel(): boolean {
//         const previousWall = this.previousWall(); // 旧版本
//         const currentWall = this.currentWall();  // 新版本
//         const houselayout = this.houseLayoutActionManager().houseLayout();

//         houselayout.addWall(previousWall);

//         removeWallGeo(this.houseLayoutActionManager(), currentWall);
//         addWallGeo(this.houseLayoutActionManager(), previousWall);
//         return true;
//     }
// }