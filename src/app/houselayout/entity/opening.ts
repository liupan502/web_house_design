import { FlagFactory } from './houselayout-flag';
import {BaseEntity,InnerWall} from './entity'
import {HouseLayoutDragEntity} from './base-drag-entity'
import {CompoundPath, Path, Point as PaperPoint, MouseEvent, Matrix} from 'paper'
import {Segment, GeometryType, Line, Point, Rect} from '../../geometry/geometry'
import {Vector2 as Vec2} from 'three'
import * as MathUtil from '../../math/math'
import {Room} from './room'
import { HouseLayout} from './house-layout'



export enum OpeningType {
    BaseOpening = 0,
    ONE_DOOR = 1,
    TWO_DOOR = 2,
    SLIDING_DOOR = 3,
    FIXED_WINDOW = 4,
    FLOOR_WINDOW = 5,
    BAY_WINDOW = 6
}

export enum FlipStatus {
    NO_FLIP,
    VERTICAL_FLIP,
    OPPOSITE_FLIP,
    HORIZON_FLIP,    
}

export class Opening extends HouseLayoutDragEntity {
    protected static maxId = 0;
    protected static idmaxRange = 100;


    protected openingType_: OpeningType;

    // protected connectedRooms_: Array<Room>;
    protected connectedRooms_: Set<Room>;

    public rect_: Rect;

    public line_: Line;

    protected flipStatus_: FlipStatus;

    protected static GenerateId(): number {
        Opening.maxId = Opening.maxId + 1;
        Opening.maxId = (Opening.maxId) % Opening.idmaxRange;
        return Opening.maxId;
    }

    /**
     * 传入一个待序列化的对象，维护本地的id信息
     * 返回 维护后的ID
     * @param input 
     */
    protected static  maintainID(idinfo: number): number {
        let result = null;
    
        if(idinfo !== null && idinfo < Opening.idmaxRange) {
            result = idinfo;
        } else {
            console.log('[AuxilaryRect]---[warning]: ID is not accepted from input val');
            return result;
        }

        if(Opening.maxId < result) {
            Opening.maxId = result;
        }       

        return result;
    }     

    openingType(): OpeningType {
      return this.openingType_;
    }

    // 平面视图中，高度是不直接指定的
    constructor(width: number, length: number, height?: number,withNewId = true ) {
        super();
        if(withNewId) {
            this.id_ = Opening.GenerateId();
        } else {
            this.id_ = 0;
        }
        this.isAttachedTowall_ = true;
        this.openingType_ = OpeningType.BaseOpening ;
        this.connectedRooms_ = new Set<Room>();
        this.width_ = width;
        this.length_ = length;
        this.height_ = height;
        this.flipStatus_ = FlipStatus.NO_FLIP;

        this.isDirty_ = true;
    }

    toJSON() {
        const result = super.toJSON();
        result.id_ = this.id_;
        result.flipStatus_ = this.flipStatus_;
        result.showEntityInfo = this.showEntityInfo();  
        // result.openingType_ = this.openingType_; 
        const connectedRoomsArry = new Array();
        for(let i = 0 ; i < this.connectedRooms_.size;i++) {
            connectedRoomsArry.push(this.connectedRooms()[i].showEntityInfo()+this.connectedRooms()[i].id().toString());
        }
        result.connectedRooms_  = connectedRoomsArry;
        return result;
    }
    getFlipStatus(): FlipStatus {
        return this.flipStatus_;
    }
    /**
     * 实现翻转, 如果实体本身水平或者垂直方向对称，则要重载该函数
     */
    flip(){
        const oriStatus = [  FlipStatus.NO_FLIP, FlipStatus.VERTICAL_FLIP,
            FlipStatus.OPPOSITE_FLIP,
            FlipStatus.HORIZON_FLIP];

        const statusAfterFlip = [  FlipStatus.VERTICAL_FLIP,
            FlipStatus.OPPOSITE_FLIP,
            FlipStatus.HORIZON_FLIP,FlipStatus.NO_FLIP];

        for(let i = 0; i < oriStatus.length; i++) {
            if(this.flipStatus_ === oriStatus[i]) {
                this.flipStatus_ = statusAfterFlip[i];
                return;
            }
        }
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.flipStatus_ = (input.flipStatus_) ? input.flipStatus_ : this.flipStatus_;
        //维护id信息
        const maintainID = Opening.maintainID(input.id_);
        this.id_ = (maintainID !== null && maintainID !== undefined) ? maintainID : this.id_;

        // this.openingType_ = (input.openingType_) ? input.openingType_ : this.openingType_;
        this.connectedRooms_.clear();
        return this;
    }
    

    //传入 opengs的conneRooms的索引数组 和 所有的rooms，解析索引值，拿到id，遍历rooms里面的room，找到对应的room,然后将room填充进去
    fillingIndexValue(indexs,rooms) {     
        for(let i = 0; i < indexs.length; i++){
            const idString = indexs[i].replace(/[^0-9]/ig,"");
            const idNum  = parseInt(idString); 
            const room = this.getIndexRooms(idNum,rooms);
            this.connectedRooms_.add(room);                    
        }                                   
    }

    getIndexRooms(id,rooms) {
        for(let i = 0; i < rooms.length; i++){
            if(id  === rooms[i].id()) {
                return rooms[i];
            }                   
        } 
    }
    


    attachToWall(wall: Segment, distance: number): boolean {
        if (wall.type() !== GeometryType.GEO_LINE) {
            return false;
        }

        const line = <Line>wall;
        const val = line.pointValue(this.position());
        const vec = line.toVector();
        const vec1 = vec.multiplyScalar(val);
        const vec2 = vec1.normalize();
        const normalVec = new Vec2(-vec2.y, vec2.x);
        const scale = val > 0 ? -1 : 1;
        const step = distance + scale * this.width() / 2.0;

        this.translate(normalVec.multiplyScalar(step));
        this.rotationZ_ = MathUtil.radianToAngle(MathUtil.Vec2ToRadian(line.toVector())) ;

        return true;
    }
  
    attachToRoom(room: Room) {
        let bFind = false;
        for (let i = 0; i < this.connectedRooms_.size; i++) {
            if (this.connectedRooms_[i] === room) {
                bFind = true;
                break;
            }
        }
        if (!bFind) {
            this.connectedRooms_.add(room);
        }
    }

    /**
     * 检查当前的关联房间信息是否已经过期
     */
    protected checkCurrentAttach() {
        const pos = this.position();
        // 厚度 ，用于比较当前离墙的距离
        const thickness = this.width_;
        const roominfo = this.connectedRooms_;
        const baseopen = this;
        this.connectedRooms_.forEach(function(roomvalue) {
            // 检查距离墙壁距离
            const info = roomvalue.getNearestWall(pos);
            if(info && info[1] && info[1] > thickness) {
                // 解除相互关联
                roomvalue.removeOpening(baseopen);
                roominfo.delete(roomvalue);
            }
        });
    }

    connectedRooms() : Array<Room>{
        return Array.from(this.connectedRooms_);
    }
    
    /**
     * 添加到画布，是opening参与画布数据组成的入口
     * opening需要保证此时自己的数据是最新的
     * @param houseLayout 
     */
    addToHouseLayout(houseLayout: HouseLayout): boolean {
        const array = houseLayout.getNearestWall(this.position());
        if (array[0] === null) {
            return true;
        }

        const wall = <InnerWall>array[0];
        const segment = wall.segment();
        const result = houseLayout.addOpening(this, segment);
        
        this.setIsTmp(false);
        return true;
    }

    removeFromHouseLayout(houseLayout: HouseLayout): boolean {
        this.destoryPath();
        return houseLayout.removeOpening(this);
    }

    connectedRoomsNum(): number {
        return this.connectedRooms_.size;
    }

    outerPoints(): Array<Point> {
        const outerPoints = new Array<Point>();
        const halfWidth = this.width() / 2.0;
        const halfLength = this.length() / 2.0;
        const point1 = new PaperPoint( halfLength,  - halfWidth);
        const point2 = new PaperPoint( - halfLength,  - halfWidth);
        const matrix: Matrix = this.getPathMatrix();
        // matrix.transform(point1);
        // matrix.transform(point2);
        const point3 = point1.transform(matrix);
        const point4 = point2.transform(matrix);
        outerPoints.push(Point.fromPaperPoint(point3));
        outerPoints.push(Point.fromPaperPoint(point4));
        return outerPoints;
    }

    showEntityInfo(){
        return "Opening";
    }

    updateGeometry() {
        const rect = <Rect>this.geos_['rect'];
        rect.setWidth(this.width_);
        rect.setLength(this.length_);
        const line = <Line>this.geos_['line'];
        line.setStartPoint(new Point(-this.length_/ 2.0, 0));
        line.setEndPoint(new Point(this.length_ / 2.0, 0));
        const rect1 = <Rect>this.geos_['rect1'];
        rect1.setCenter(new Point(this.length_/2,-this.width_/2));
        rect1.setWidth(10);
        rect1.setLength(10);
        const rect2 = <Rect>this.geos_['rect2'];
        rect2.setCenter(new Point(-this.length_/2,-this.width_/2));
        rect2.setWidth(10);
        rect2.setLength(10);
        const tmpRect = <Rect>this.geos_['tmpRect'];
        tmpRect.setWidth(this.width_);
        tmpRect.setLength(this.length_);
    }

  // 根据实体自身处理逻辑和当前画布状态自适应实体的新位置、高度等信息
  // Opening 实体需要根据在画布中所贴近的墙体自适应厚度信息           
  autoAdapt(houselayout: HouseLayout, point: Point): boolean {
    // 获取当前选择实体的顶点信息
    const array = houselayout.getNearestWall(point);
    const wall = array[0];
    if (wall !== null && (array[1] < (this.width() / 2.0 + 30))) {
        const wallseg = (<InnerWall>wall);
        //门窗厚度自适应
        let wallWidth = 24;
        // 厚度自适应通过内墙厚度数据直接获取
        wallWidth = wallseg.getThickNess();

        this.setWidth(wallWidth);
        this.setAllowToAdded(true);
        this.attachToWall(wallseg.segment(), array[1]);
        return true;
    }

  }

  //门只能吸附在门洞上 并自适应大小
  attachToOpening(houselayout: HouseLayout, point: Point): boolean {
    // 获取当前选择实体的顶点信息
    const array = houselayout.getNearestWall(point);
    const wall = array[0];
    if (wall !== null && (array[1] < (this.width() / 2.0 + 30))) {
        const wallseg = (<Segment>wall);
        const attachedOpening = houselayout.getRoomByWall(wallseg).getOpeningByWall(wallseg);
        if (attachedOpening !== null) {
            if (attachedOpening.showEntityInfo() === 'Opening') {
                const position = attachedOpening.position();
                this.moveTo(position);
                this.setLength(attachedOpening.length());
            }

            return true;
        }  else {
            return false;
        }
    }
  }





    /**
     * 从外部获取基础数据更新后， opening需要维护内部关联信息的更新
     * @param rights 
     */
    shallowCopy(rights: any) {
        super.shallowCopy(rights);
        const rightval = <Opening>rights;
        this.openingType_ =  rightval.openingType_;
        this.flipStatus_ = rightval.flipStatus_;
        const connectedRooms = Array.from(rightval.connectedRooms_);
        this.connectedRooms_.clear();
        for(let i = 0; i < connectedRooms.length;i++) {
            this.connectedRooms_.add(connectedRooms[i]);
        }

        // 检查数据更新后， 关联房间信息是否已过期
        this.checkCurrentAttach();        
        //  this.connectedRooms_ = Array.from(rightval.connectedRooms_);
    }

    /**
     * @function 从当前Opening中取消对某一房屋的关联
     */
    removeFromRoom(room: Room) {
        //const tempArray = new Array<Room>();
        // for (let i = 0; i < this.connectedRooms_.size; i++) {
        //     const tmpRoom = this.connectedRooms_[i];
        //     if (tmpRoom.id() !== room.id()) {
        //         tempArray.push(tmpRoom);
        //     }
        // }

        // this.connectedRooms_ = tempArray;
        this.connectedRooms_.delete(room);
    }


    /**基类不实现，交给子类判断 */
    CheckTypeTransform(): Opening {
       let result = null;
       return result;
    }    
}

export class Window extends Opening {
    protected static maxId = 0;
    static GenerateId(): number {
        Window.maxId = (Window.maxId++) % 1000;
        return Window.maxId;
    }

    updateView() {
        if (!this.isDirty()) {
            return;
        }
    }

         
}

export class Door extends Opening {
    protected static maxId = 0;
    static GenerateId(): number {
        Door.maxId = (Door.maxId++) % 1000;
        return Door.maxId;
    }

    updateView() {
        if (!this.isDirty()) {
            return ;
        }
    }

    

       
}
