import { HouseLayout } from './house-layout';
import {BaseEntity, Room} from './entity'
import {Segment, Line, GeometryType, Point,Arc} from '../geometry/geometry'
import {Opening} from './opening'

/**
 * 内墙类型
 */
export enum InnerWallType{
    INNERWALL_UNHANDLED = 0, // 异常
    INNERWALL_DEFAULT,  // 普通墙体
    INNERWALL_LOADBEARING,  // 承重墙
    INNERWALL_SHORT,   // 矮墙
    // INNERWALL_C,
    // INNERWALL_D,
    // INNERWALL_E
};

/**
 * 内墙
 */
export class InnerWall extends BaseEntity {

    protected static maxId = 0;
    protected static idMaxrange = 10000;

    /// Begin: 墙实体需要记录的信息
    // 墙厚度
    protected wallthickness_:number;
    protected wallType_: InnerWallType;
    // 所属房间， 
    protected withinRoom_: Room;
    // End

  

    protected static GenerateId(): number {
        InnerWall.maxId = InnerWall.maxId + 1;
        InnerWall.maxId = (InnerWall.maxId) % InnerWall.idMaxrange;
        return InnerWall.maxId;
    }

    /** */
    constructor(segment: Segment,bGeneratedNewId = true,roomInfo?: Room) {
        super();
        if (bGeneratedNewId) {
            this.setId(InnerWall.GenerateId());
        }

        this.geos_['segment'] = segment;
        this.isTmp_ = true;
        // 墙体刚绘制时,还没有形成房间,没有实际类型概念,也无法设置墙类型
        // 因此类型初始化为unhandled
        this.wallType_ = InnerWallType.INNERWALL_UNHANDLED;

        if(roomInfo) {
            this.withinRoom_ = roomInfo;
        } else {
            this.withinRoom_ = null;
        }

        this.height_ = 280; // 墙默认高度2800
        this.wallthickness_ = 24; //墙默认厚度240
    }

    // it cannot be moved!!!!!
    moveTo(newPosition: Point) {

    }

    /**
     * 将相接，方向一致的inner wall 合并成一个inner wall
     *
     *
     */
    static GroupInnerWalls(innerWalls: Array<InnerWall>): InnerWall {
        if (innerWalls.length < 2) {
            return null;
        }

        const firstSegment = innerWalls[0].segment();
        const secondSegment = innerWalls[1].segment();
        const lastSegment = innerWalls[innerWalls.length - 1].segment();

        let bReverse = false;
        if (! firstSegment.endPoint().equal(secondSegment.startPoint())) {
            bReverse = true;
        }

        const startPoint = bReverse? firstSegment.endPoint() : firstSegment.startPoint();
        const endPoint = bReverse? lastSegment.startPoint() : lastSegment.endPoint();

        const segment = new Line(startPoint, endPoint);
        const newWall = new InnerWall(segment);

        for (let i = 0 ; i < innerWalls.length; i++) {
            const name = 'subWall' + i.toString();
            newWall.subObjects_[name] = innerWalls[i];
        }

        return newWall;
    }

    attachToRoom(room: Room) {
        this.withinRoom_ = room;
    }

    getThickNess() {
        return this.wallthickness_;
    }

    getRoom(): Room {
        return this.withinRoom_;
    }

    getWallType(): InnerWallType{
        return this.wallType_;
    }

    setWallType(wallType: InnerWallType){
        this.wallType_ = wallType;
    }



    shallowCopy(rightval: any) {
        super.shallowCopy(rightval);
        this.wallType_ = rightval.wallType_;
        this.wallthickness_ = rightval.wallthickness_;
        this.withinRoom_ = rightval.withinRoom_;
      }

    //返回一个可以JSON.stringify的Object
    toJSON() {
        const result = {} as any ; 
        result.id_ = this.id_;  
        result.wallthickness_ = this.wallthickness_;
        result.wallType_ = this.wallType_;
        result.showEntityInfo = this.showEntityInfo(); 
        result.withinRoom_ = this.withinRoom_.showEntityInfo()+this.withinRoom_.id().toString();
        const segment = {} as any ;
        const startPoint = {} as any;
        startPoint.x = this.segment().startPoint().x();
        startPoint.y = this.segment().startPoint().y();
        segment.startPoint = startPoint;
        const endPoint = {} as any;
        endPoint.x = this.segment().endPoint().x();
        endPoint.y = this.segment().endPoint().y();
        segment.endPoint = endPoint;
        if(this.segment().type() ===  GeometryType.GEO_ARC ) {
            const arc = <Arc>this.segment();
            const center = {} as any;
            center.x = arc.center().x();
            center.y = arc.center().y();
            segment.center = center;
            segment.isClockwise = arc.isClockwise();
        }
        segment.type = this.segment().type();
        
        result.segment = segment;
        return result;
    }

    //传入参数为JSON.Parse后的数据
    fromJSON(input) {
        super.fromJSON(input);

        // this.id_ = (input.id_) ? input.id_ : this.id_;
        const idinfo = InnerWall.maintainID(input.id_);

        
        this.wallthickness_ = (input.wallthickness_) ? input.wallthickness_ : this.wallthickness_;
        this.wallType_ = (input.wallType_) ? input.wallType_ : this.wallType_;
        return this;
      
    }

    /**
     * 
     * @param idinfo 
     */
    protected static  maintainID(idinfo: number): number {
        let result = null;
        
            if(idinfo && idinfo < InnerWall.idMaxrange) {
                result = idinfo;
            } else {
                console.log('[HouseLayoutFlag]---[warning]: ID is not accepted from input val');
                return result;
            }
    
            if(InnerWall.maxId < result) {
                InnerWall.maxId = result;
            }       
    
            return result;  
    }   
    fillingIndexValue(index,rooms) {     
            const idString = index.replace(/[^0-9]/ig,"");
            const idNum  = parseInt(idString); 
            const room = this.getIndexRooms(idNum,rooms);
            this.withinRoom_ = room ;                                                            
    }

    getIndexRooms(id,rooms) {
        for(let i = 0; i < rooms.length; i++){
            if(id  === rooms[i].id()) {
                return rooms[i];
            }                   
        } 
    }

    /**
     * 获取内墙对应的几何数据
     */
    segment(): Segment{
        return this.geos_['segment'];
    }



    /**
     * 如果该内墙是几个内墙group 而来，那么将返回这些内墙数据
     * 返回的数据中按照group时的顺序
     */
    explodeInnerWalls(): Array<InnerWall> {


        let  maxIndex = -1;
        for (const name in this.subObjects_) {
            if (name === null || name === undefined) {
                continue;
            }

            const object = this.subObjects_[name];
            if (object === null || object === undefined) {
                continue;
            }

            const str = <string> name;
            if (!str.startsWith("subWall")) {
                continue;
            }

            const index = Number.parseInt(str.split('subWall')[1]);
            if (maxIndex > index ){
                maxIndex = index;
            }
        }

        const innerWalls = maxIndex >= 0? new Array<InnerWall>(maxIndex + 1) : new Array<InnerWall>();
        for (const name in this.subObjects_) {
            if (name === null || name === undefined) {
                continue;
            }

            const object = this.subObjects_[name];
            if (object === null || object === undefined) {
                continue;
            }

            const str = <string> name;
            if (!str.startsWith("subWall")) {
                continue;
            }

            const index = Number.parseInt(str.split('subWall')[1]);
            innerWalls[index] = this.subObjects_[name];
        }

        return innerWalls;
    }

    shallowclone(): any{
        const segment = (<Segment>this.geos_['segment']).clone();
        const newInnerWall = new InnerWall(segment, false);
        newInnerWall.shallowCopy(this);
        return newInnerWall;
    }

    showEntityInfo(): string{
        if (this.segment().type() === GeometryType.GEO_ARC) {
            return 'arcline'
        } else if (this.segment().type() === GeometryType.GEO_LINE) {
            return 'directeline';
        }

        return 'InnerWall';
    }

    autoAdapt(houselayout: HouseLayout, point: Point): boolean {
        return false;
    }

    /**
     * 检查该内墙是否包含这个opening
     * 目前弧形墙不支持包含洞
     * @param opening 
     */
    doContainOpening(opening: Opening): boolean {
        const segment = this.segment();
        if (segment instanceof Arc) {
            return false;
        }

        const line = <Line> segment;
        const pos = opening.position();
        const distance = line.distanceFromPoint(pos);
        const halfWidth = opening.width() / 2.0;
        if (Math.abs(distance - halfWidth) < 0.1) {
            return true;
        } else {
            return false;
        }        
    }
}
