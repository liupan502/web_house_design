import {BaseEntity} from './entity'
import {Wall, Room, FlipStatus} from '../entity/entity'
import {HouseLayout} from './house-layout'
import {Rect, Point,Line,Arc,Circle,Polygon,Segment} from '../../geometry/geometry'
import {Path, PathItem, Point as PaperPoint} from 'paper'
import {HouseLayoutDragEntity} from './base-drag-entity'


import {BaseWrapper, DrawHouseLayoutWrapper} from '../wrapper/wrapper'
import {Opening,OpeningType} from './opening'


export enum FlagType {
    FLAG_NONE = 0 ,
    FLAG_PILLARFLAG = 1,
    FLAG_FLUEFLAG = 2,
    FLAG_GIRDERFLAG = 3,
    FLAG_FLOORDRAINFLAG = 4,
    FLAG_UPHILLFLAG = 5,
    FLAG_PIPELIENFLAG = 6,
    FLAG_STRONGELECTRICBOXFLAG = 7,
    FLAG_WEAKBOXFLAG = 8,
    FLAG_KTFLAG = 9,
    FLAG_RADIATORFLAG = 10,
    FLAG_HANGINGFIREPACE = 11,
    FLAG_GASMETERFLAG = 12,
    FLAG_WATERMETERFLAG = 13,
}

export class HouseLayoutFlag extends HouseLayoutDragEntity {
    protected static maxId = 0;
    protected static idmaxRange = 10000;
    protected flagType_: FlagType;
    private static GenerateId(): number {
        HouseLayoutFlag.maxId = HouseLayoutFlag.maxId + 1;
        HouseLayoutFlag.maxId = (HouseLayoutFlag.maxId) % HouseLayoutFlag.idmaxRange;
        return HouseLayoutFlag.maxId;
    }

    /**
     * 传入序列化后any对象内部的id信息，以维护本地的id信息
     * 返回 维护后的ID
     * @param idinfo 
     */
    protected static  maintainID(idinfo: number): number {
        let result = null;
    
        if(idinfo !== null && idinfo !== undefined && idinfo < HouseLayoutFlag.idmaxRange) {
            result = idinfo;
        } else {
            console.log('[HouseLayoutFlag]---[warning]: ID is not accepted from input val');
            return result;
        }

        if(HouseLayoutFlag.maxId < result) {
            HouseLayoutFlag.maxId = result;
        }       

        return result;
    }      

    constructor(withNewId:boolean) {
        super();
        if(withNewId) {
            this.id_ = HouseLayoutFlag.GenerateId();
        } else {
            this.id_ = 0;
        }

        this.allowToAdded_ = true;
        this.flagType_ = FlagType.FLAG_NONE ;
    }

    flagType(): FlagType {
      return this.flagType_;
    }
    toJSON() {
        const result = super.toJSON();
        result.id_ = this.id_;
        result.showEntityInfo = this.showEntityInfo();
        result.flagType_ = this.flagType_;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        // this.id_ = (input.id_) ? input.id_ : this.id_;
        const id = HouseLayoutFlag.maintainID(input.id_);
        this.id_ = (id !== null && id !== undefined )? id: this.id_;
        this.flagType_ = (input.flagType_) ? input.flagType_ : this.flagType_;
        return this;
    }

    reportinfo() {
        const foo = {} as any;
        foo.width = this.width_;
        foo.height = this.height_;
        foo.length = this.length_;
        //foo.radius = this.radius_;
        foo.name = this.showEntityInfo();
        return foo;
    }

    injectinfo(input: Object) {
        if (null !== input['width'] || undefined !== input['width']) {
            this.width_ = input['width'];
        }

        if (null !== input['length'] || undefined !== input['length']) {
            this.length_ = input['length'];
        }

        if (null !== input['height'] || undefined !== input['height']) {
            this.height_ = input['height'];
        }

        if (null !== input['radius'] || undefined !== input['radius']) {
            //this.radius_ = input['radius'];
        }

    }

    addToHouseLayout(houseLayout: HouseLayout): boolean {

        const result = houseLayout.addFlag(this, null);
        if (result) {
            this.setIsTmp(false);
        }
        return result;
     }

     removeFromHouseLayout(houseLayout: HouseLayout): boolean {
         //this.destoryPath();
         const result = houseLayout.removeFlag(this);
         if (result) {
             this.setIsTmp(true);
         }
         return result;
     }
}


export class Windows extends Opening {
    protected static maxId = 0;

    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId=true)  {
        super(width,length,height,withNewId);
        this.distancefromground_ = (distancefromground) || 0;
    }


    toJSON() {
        const result = super.toJSON();
        result.distancefromground_ = this.distancefromground_;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.distancefromground_ = (input.distancefromground_) ? input.distancefromground_ : this.distancefromground_;
        return this;
    }
  /**if my type has changed ,pls transform me */
  CheckTypeTransform(): Opening {
    const entityInfoArray = ['null', 'OneDoorFlag', 'TwoDoorsFlag' ,'SlidingDoorsFlag'
    ,'FixedWindowFlag','FloorWindowFlag','BayWindowFlag'];
    const typeIndex = <number>(this.openingType_ - OpeningType.BaseOpening);
    if(entityInfoArray[typeIndex] === this.showEntityInfo()) {
        return this;
    }   
    
    let result = null;

    switch (this.openingType_) {
        case OpeningType.BAY_WINDOW:
            result = FlagFactory.createFlag('BayWindowFlag');
            break;
        case OpeningType.FIXED_WINDOW:   
            result = FlagFactory.createFlag('FixedWindowFlag');
            break;
        
        case OpeningType.FLOOR_WINDOW:    
            result = FlagFactory.createFlag('FloorWindowFlag');
        default:
            break;
    }

    if(result !== null) {
        result.shallowCopy(this);
    }

    return result;
} 

}

export class Doors extends Opening {
    protected static maxId = 0;

    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId= true)  {
        super(width,length,height,withNewId);
        this.distancefromground_ = (distancefromground) || 0;

    }

    toJSON() {
        const result = super.toJSON();
        result.distancefromground_ = this.distancefromground_;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.distancefromground_ = (input.distancefromground_) ? input.distancefromground_ : this.distancefromground_;
        return this;
    }
 /**if my type has changed ,pls transform me */
 CheckTypeTransform(): Opening {
    const entityInfoArray = ['null', 'OneDoorFlag', 'TwoDoorsFlag' ,'SlidingDoorsFlag'
    ,'FixedWindowFlag','FloorWindowFlag','BayWindowFlag'];
    const typeIndex = <number>(this.openingType_ - OpeningType.BaseOpening);
    if(entityInfoArray[typeIndex] === this.showEntityInfo()) {
        return this;
    }   
    
    let result = null;

    switch (this.openingType_) {
        case OpeningType.ONE_DOOR:
            result = FlagFactory.createFlag('OneDoorFlag');
            break;
        case OpeningType.TWO_DOOR:   
            result = FlagFactory.createFlag('TwoDoorsFlag');
            break;
        
        case OpeningType.SLIDING_DOOR:    
            result = FlagFactory.createFlag('SlidingDoorsFlag');
        default:
            break;
    }

    if(result !== null) {
        result.shallowCopy(this);
    }

    return result;
} 

}

export class LandMark extends HouseLayoutFlag {
    constructor(length: number, width: number,rotationZ:number,withNewId=true) {
        super(withNewId);
        this.width_ = width;
        this.length_ = length;
        this.rotationZ_ = rotationZ ;

    }

    showEntityInfo() {
        return 'justfordebug';
    }
}

export class RoundLandMark extends LandMark {
    protected radius_: number;
    constructor(radius,rotationZ,withNewId=true) {
        super(radius , radius  ,rotationZ,withNewId);
        this.setRadius(radius);
    }

    toJSON() {
        const result = super.toJSON();
        result.radius_ = this.radius_  ;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.radius_ = (input.radius_) ? input.radius_ : this.radius_;
        return this;
    }

    setRadius(radius) {
        this.radius_ = radius;
        this.width_ = this.radius_ ;
        this.length_ = this.radius_ ;
        this.isDirty_ = true;
    }

    radius() {
        return this.radius_;
    }

    setWidth(width: number) {
        this.setRadius(width);
    }

    setLength(length: number) {
        this.setRadius(length);
    }

    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <RoundLandMark>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below
        this.radius_ = rightval.radius();
        ///
    }
}

export class WallMark extends HouseLayoutFlag {
    protected distancefromground_: number;

    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(withNewId);
        this.width_ = width;
        this.length_ = length;
        this.distancefromground_ = distancefromground;
        this.rotationZ_ = rotationZ;
    }

    toJSON() {
        const result = super.toJSON();
        result.distancefromground_ = this.distancefromground_  ;
         return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.distancefromground_ = (input.distancefromground_) ? input.distancefromground_ : this.distancefromground_;
        return this;
    }

    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <WallMark>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below
        this.distancefromground_ = rightval.distancefromground_;
        ///
    }
}

export class RoundWallMark extends WallMark {

    protected radius_: number;
    constructor(distancefromground,radius,rotationZ,withNewId=true) {
        super(distancefromground,radius * 2, radius * 2 ,rotationZ,withNewId);
        this.setRadius(radius);
    }

    toJSON() {
        const result = super.toJSON();
        result.radius_ = this.radius_  ;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.radius_ = (input.radius_) ? input.radius_ : this.radius_;
        return this;
    }

    setRadius(radius) {
        this.radius_ = radius;
        this.width_ = this.radius_ * 2;
        this.length_ = this.radius_ * 2;
        this.isDirty_ = true;
    }

    radius() {
        return this.radius_;
    }

    setWidth(width: number) {
        this.setRadius(width / 2.0);
    }

    setLength(length: number) {
        this.setRadius(length / 2.0);
    }

    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <RoundWallMark>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below
        this.radius_ = rightval.radius();
        ///
    }
}


//门洞
/*
属性范例
宽度：1000
高度：2200
拱⾼高：150
厚度：240
离地高度： 默认为0， 不可更改
*/
export class DoorwayFlag extends Opening  {
    protected archeight_: number;

    // 门洞在设置时必须设置高度，
    constructor(width:number,length:number,height:number,archeight?: number,withNewId=true) {
        super(width,length,height,withNewId);
        this.openingType_ = OpeningType.BaseOpening ;
        this.rect_ = new Rect(new Point(0.0, 0.0), width, length);
        this.geos_['rect'] = this.rect_;
        this.geos_['tmpRect'] = new Rect(new Point(0.0, 0.0), width, length);
        this.line_ = new Line(new Point(-length / 2.0, 0), new Point(length / 2.0, 0));
        this.geos_['line'] = this.line_;
        const halfWidth = width / 2.0;
        const halfLength = length / 2.0;
        const point1 = new Point( halfLength,  -halfWidth);
        const point2 = new Point(- halfLength,  -halfWidth);
        const rect1 =  new Rect(point1, 10, 10);

        this.geos_['rect1'] = rect1;
        const rect2 = new Rect(point2, 10, 10);

        this.geos_['rect2'] = rect2;

        this.archeight_ = (archeight) || 15;
    }

    // must be
    showEntityInfo() {
        return 'DoorwayFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be

        const rightval = <DoorwayFlag>(rights);
        this.archeight_ = rightval.archeight_;
        this.distancefromground = rightval.distancefromground;

        return;
    }

}

//柱子
/**
 * 长度：500
宽度：500
高度：2800
旋转⻆角度：0
 */
export class PillarFlag extends HouseLayoutFlag {

    constructor(length:number,width:number,height:number,rotationZ:number,withNewId=true) {
        super(withNewId);
        this.flagType_ = FlagType.FLAG_PILLARFLAG;
        this.length_ = length;
        this.width_ = width;
        this.height_ = height;
        this.rotationZ_ = rotationZ;
    }


    showEntityInfo() {
        return 'PillarFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be

        // if any new propertys added to this class, pls add shallowCopy of them at below
        const rightval = <PillarFlag>(rights);
        this.length_ = rightval.length();
        this.width_ = rightval.width();
        this.height_ = rightval.height();
        this.rotationZ_ = rightval.rotationZ_;
        ///
    }
}



//烟道
/**
 * ⻓长度：650
宽度：650
⾼高度：2800
旋转⻆角度：0
 */
export class FlueFlag extends  HouseLayoutFlag {
    protected rotantionAngel_: number;

    constructor(length:number,width:number,height:number,rotationZ_:number,withNewId = true) {
        super(withNewId);
        this.flagType_ = FlagType.FLAG_FLUEFLAG;
        this.length_ = length;
        this.width_ = width;
        this.height_ = height;
        this.rotationZ_ = rotationZ_;


    }


     showEntityInfo(){
        return "FlueFlag";
    }

     // must be
     shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <FlueFlag>rights;

        this.rotantionAngel_ = rightval.rotantionAngel_;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }




}


// 梁
/**
 * ⻓长度：⾃自适应
宽度：400
厚度：400
旋转⻆角度：0
 */
export class GirderFlag extends HouseLayoutFlag {
    protected thickness_:number;
    constructor(length:number,width:number,thickness:number,rotationZ:number,withNewId = true) {
        super(withNewId);
        this.flagType_ = FlagType.FLAG_GIRDERFLAG;
        this.length_ = length;
        this.width_ = width;
        this.thickness_ = thickness;
        this.rotationZ_= rotationZ;


    }

    toJSON() {
        const result = super.toJSON();
        result.radius_ = this.thickness_  ;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.thickness_ = (input.thickness_) ? input.thickness_ : this.thickness_;
        return this;
    }



    // 按照到一特定点的距离对点数组进行排序
    protected sortByPointDistance(point: Point) {
        return function(a: Point, b: Point) {
            return a.distanceTo(point) - b.distanceTo(point);
        }
    }

    showEntityInfo() {
        return 'GirderFlag';
    }

    autoAdapt(houselayout: HouseLayout, point: Point): boolean {
        /*const roominfo = houselayout.rooms();

        if (null === roominfo) {
            return false;
        }

        let currentRoom = null;

        // 查看当前点击的点在哪个房间内部
        for (let i = 0; i < roominfo.length ; i++) {
            if( roominfo[i].containsPoint(point) ) {
                currentRoom = roominfo[i];
                break;
            }
        }

        if( null === currentRoom) {
            return false;
        }

        // 遍历room的每一条边，找出距离当前点最近的两条边界， 然后返回当前店所在水平线与这两个线段的交点
        const walls =(<Room>(currentRoom)).region();
        const parallespath = new Path.Line(new PaperPoint(point.x() - 3000, point.y()),
                new PaperPoint(point.x() + 3000, point.y()));

        const segs = walls.segments();
        const intersects = Array<Point>();
        for (let i = 0; i < segs.length; i++) {
            const seg = segs[i];
            const curPath = new Path.Line(seg.startPoint().toPaperPoint(), seg.endPoint().toPaperPoint());

            const intersctinfo = curPath.getIntersections(parallespath);
            if (intersctinfo.length === 1) {
                intersects.push(new Point(intersctinfo[0].point.x, intersctinfo[0].point.y));
            }
        }

        // 判断交点情况
        if(intersects.length < 2) {
            return false;
        } else if(intersects.length >= 2) {
            intersects.sort(this.sortByPointDistance(point));
            // 返回离当前鼠标位置最近的两个交点
            const newpos = new Point(intersects[0].x()/2 + intersects[1].x() /2 , intersects[0].y() /2 + intersects[1].y() /2 );
            this.setPosition(newpos);
            this.setLength(intersects[0].distanceTo(intersects[1]));

        }*/


        return false;
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <GirderFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below
        this.thickness_ = rightval.thickness_;
        ///
    }
}



//单开门
/**
 * 离地⾼高度：0
宽度：930
⾼高度：210
厚度：45

 */
export class OneDoorFlag extends Doors {
    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId = true)  {
        super(width,length,height,distancefromground,withNewId);
        this.openingType_ = OpeningType.ONE_DOOR;

    }

    showEntityInfo(){
        return 'OneDoorFlag';
    }

    showType() {
        return 'door';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <OneDoorFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

//双开门
/**
 * 离地⾼高度：0
宽度：1600
⾼高度：2100
厚度：45
 */
export class TwoDoorsFlag extends Doors {
    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId=true)  {
        super(width,length,height,distancefromground,withNewId);
        this.openingType_ = OpeningType.TWO_DOOR;
    }


     showEntityInfo(){
        return 'TwoDoorsFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <TwoDoorsFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }

    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP,
            FlipStatus.OPPOSITE_FLIP];

        const statusAfterFlip = [ 
            FlipStatus.OPPOSITE_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    }    
}




//推拉门
/**
 * 离地⾼高度：0
宽度：1600
⾼高度：2100
厚度：45
 */
export class SlidingDoorsFlag extends Doors {
    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId=true)  {
        super(width,length,height,distancefromground,withNewId);
        this.openingType_ = OpeningType.SLIDING_DOOR;
    }



    showEntityInfo(){
        return 'SlidingDoorsFlag';
    }

    showType(){
        return 'door';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <SlidingDoorsFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }

    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP,
            FlipStatus.OPPOSITE_FLIP];

        const statusAfterFlip = [ 
            FlipStatus.OPPOSITE_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    } 
}

//固定窗
/**
 * 离地⾼高度：800
宽度：1200
⾼高度：1200
厚度：45

 */
export class FixedWindowFlag extends Windows {
    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId = true)  {
        super(width,length,height,distancefromground);
        this.openingType_ = OpeningType.FIXED_WINDOW;
    }



    showEntityInfo() {
        return 'FixedWindowFlag';
    }



    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <FixedWindowFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }

    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP,
            FlipStatus.OPPOSITE_FLIP];

        const statusAfterFlip = [ 
            FlipStatus.OPPOSITE_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    }    
}


// 落地窗
/**
 * 离地⾼高度：220
宽度：2800
⾼高度：2300
厚度：45
 */
export class FloorWindowFlag extends Windows {
    constructor(width:number,length:number,height: number, distancefromground?: number,withNewId = true)  {
        super(width,length,height,distancefromground,withNewId);
        this.openingType_ = OpeningType.FLOOR_WINDOW;
    }

    showEntityInfo() {
        return 'FloorWindowFlag';
    }



    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <FloorWindowFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }

    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP,
            FlipStatus.OPPOSITE_FLIP];

        const statusAfterFlip = [ 
            FlipStatus.OPPOSITE_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    }     
}




//飘窗
/**
 * 离地⾼高度：500
宽度：1740
⾼高度：1840
厚度：45
深度：700

 */
export class BayWindowFlag extends Windows {
    protected depth_: number;
    constructor(width:number,length:number,height: number,depth:number, distancefromground?: number,withNewId=true)  {
        super(width,length,height,distancefromground,withNewId);
        this.depth_ = depth;
        this.openingType_ = OpeningType.BAY_WINDOW;
    }

     showEntityInfo() {
        return 'BayWindowFlag';
    }

    toJSON() {
        const result = super.toJSON();
        result.depth_ = this.depth_;
        return result;
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.depth_ = (input.depth_) ? input.depth_ : this.depth_;
        return this;
    }

    depth(){
        return this.depth_;
    }


    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <BayWindowFlag>rights;
        
        // if any new propertys added to this class, pls add shallowCopy of them at below
        //this.depth_ = this.depth();
        ///
    }

    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP,
            FlipStatus.OPPOSITE_FLIP];

        const statusAfterFlip = [ 
            FlipStatus.OPPOSITE_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    }     
}



//地漏
export class FloorDrainlFlag extends RoundLandMark {
    constructor(radius: number, ratationZ: number,withNewId = true)  {
        super(radius, ratationZ,withNewId);
        this.flagType_ = FlagType.FLAG_FLOORDRAINFLAG;
    }





     showEntityInfo() {
        return 'FloorDrainlFlag';
    }



    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <FloorDrainlFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below
        this.radius_ = rightval.radius();
        ///
    }
}


//上下水口
export class UphillFlag extends RoundLandMark {
    constructor(radius: number, rotationZ: number,withNewId=true) {
        super(radius, rotationZ ,withNewId);
        this.flagType_ = FlagType.FLAG_UPHILLFLAG;
    }

    showEntityInfo(){
        return 'UphillFlag';
    }


    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <UphillFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }

}

//管道
export class PipelienFlag extends LandMark {
    constructor(length: number, width: number,rotationZ:number,withNewId) {
        super(length,width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_PIPELIENFLAG;
    }

    showEntityInfo() {
        return 'PipelienFlag';
    }



    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <PipelienFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}


//强电箱

export class StrongElectricBoxFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId = true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_STRONGELECTRICBOXFLAG;
    }

    showEntityInfo() {
        return 'StrongElectricBoxFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <StrongElectricBoxFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}




// 弱电箱
export class WeakBoxFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_WEAKBOXFLAG;
    }

    showEntityInfo() {
        return 'WeakBoxFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <WeakBoxFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

// 空调口
export class KtFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_KTFLAG;
    }

    showEntityInfo() {
        return 'KtFlag';
    }



    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <KtFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}



// 暖气片
export class RadiatorFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_RADIATORFLAG;
    }

    showEntityInfo() {
        return 'RadiatorFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <RadiatorFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}



// 挂壁炉
export class HangingFireplaceFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_HANGINGFIREPACE ;
    }

    showEntityInfo() {
        return 'HangingFireplaceFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <HangingFireplaceFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

//燃气表
export class GasMeterFlag extends WallMark {
    constructor(distancefromground:number,length: number, width: number , rotationZ:number,withNewId=true) {
        super(distancefromground,length, width,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_GASMETERFLAG ;
    }

    showEntityInfo(){
        return 'GasMeterFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <GasMeterFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

//水表

export class WaterMeterFlag extends RoundWallMark {
    constructor(distancefromground,radius,rotationZ,withNewId=true) {
        super(distancefromground,radius ,rotationZ,withNewId);
        this.flagType_ = FlagType.FLAG_NONE;
    }

     showEntityInfo() {
        return 'WaterMeterFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <WaterMeterFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }


}


// 强电箱(平面)
export class StrongElectricBox2DFlag extends HouseLayoutFlag {
    constructor(length:number,width:number,withNewId=true) {
        super(withNewId);
        this.width_ = width;
        this.length_ = length;


    }

     showEntityInfo() {
        return 'StrongElectricBox2DFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <StrongElectricBox2DFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}


// 弱电箱(平面)
export class WeakBox2DFlag extends HouseLayoutFlag {
    constructor(length:number,width:number,withNewId=true) {
        super(withNewId);
        this.width_ = width;
        this.length_ = length;

    }

    showEntityInfo() {
        return 'WeakBox2DFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <WeakBox2DFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

// 空调(平面)
export class Kt2DFlag extends HouseLayoutFlag {
    constructor(length:number,width:number,withNewid = true) {
        super(withNewid);
        this.width_ = width;
        this.length_ = length;



    }


    showEntityInfo() {
        return 'Kt2DFlag';
    }

    // must be
    shallowCopy(rights: any) {
        super.shallowCopy(rights); // must be
        const rightval = <Kt2DFlag>rights;
        // if any new propertys added to this class, pls add shallowCopy of them at below

        ///
    }
}

export class FlagFactory  {

   static  createFlag(objectName:string, withNewId = true): HouseLayoutDragEntity{
        let result: HouseLayoutDragEntity = null;

       /* if(objectName === 'FlueFlag') {
            result = new  FlueFlag(350,350);
        } */

        switch (objectName) {
           case  'DoorwayFlag':
            result =  new DoorwayFlag(24, 60, 220,0,withNewId);
            break;

            case  'PillarFlag':
            result = new  PillarFlag(50,50,280,0,withNewId);
            break;

            case  'FlueFlag':
            result = new  FlueFlag(65,65,280,0,withNewId);
            break;

            case  'GirderFlag': // 'GirderFlag':
            result = new GirderFlag(300,40,40,0,withNewId);
            break;

            case  'OneDoorFlag':
            // 填null代表不指定离地高度
            result = new OneDoorFlag(24,90,210,null,withNewId);
            break;

            case  'TwoDoorsFlag':
            result = new TwoDoorsFlag(24,150,210,null,withNewId);
            break;

            case  'SlidingDoorsFlag':
            result = new SlidingDoorsFlag(24,150,210,null,withNewId);
            break;

            case  'FixedWindowFlag':
            result = new FixedWindowFlag(24,80,120,null,withNewId);
            break;

            case  'FloorWindowFlag':
            result = new  FloorWindowFlag(24,150,230,null,withNewId);
            break;

            case  'BayWindowFlag':
            result = new  BayWindowFlag(24,160,184,70,null,withNewId);
            break;

            case  'FloorDrainlFlag':
            result = new  FloorDrainlFlag(10,0,withNewId);
            break;

            case  'UphillFlag':
            result = new  UphillFlag(5,0,withNewId);
            break;

            case  'PipelienFlag':
            result = new  PipelienFlag(300,70,0,withNewId);
            break;

            case  'StrongElectricBoxFlag':
            result = new  StrongElectricBoxFlag(0,30,11.2,0,withNewId);
            break;


            case  'WeakBoxFlag':
            result = new  WeakBoxFlag(0,37,15,0,withNewId);
            break;

            case  'KtFlag':
            result = new  KtFlag(0,100,15,0,withNewId);
            break;

            case  'RadiatorFlag':
            result = new  RadiatorFlag(0,90,49.6,0,withNewId);
            break;

            case  'HangingFireplaceFlag':
            result = new  HangingFireplaceFlag(0,45,67,0,withNewId);
            break;

            case  'GasMeterFlag':
            result = new  GasMeterFlag(0,26.7,11,0,withNewId);
            break;


            case  'WaterMeterFlag':
            result = new  WaterMeterFlag(0,20,0,withNewId);
            break;


            case  'StrongElectricBox2DFlag':
            result = new  StrongElectricBox2DFlag(30.1,11.6,withNewId);
            break;


            case  'WeakBox2DFlag':
            result = new  WeakBox2DFlag(30.1,11.6,withNewId);
            break;

            default:
                break;
        }

        return result;
    }

}


