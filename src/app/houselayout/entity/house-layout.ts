import { RoomGeometry } from './../entity-geometry/room-geometry';
import * as MathUtil from '../../math/math'
import * as Geo from '../../geometry/geometry'
import { Room } from './room'
import { Corner } from './corner'
import { Wall } from './wall'
import { BaseEntity, DoorwayFlag, InnerWall,InnerWallType, WallEntities, Doors, Windows, OpeningType,
  CubeHoleEntity, FlagFactory, OpeningEntity, RoomEntities, RoomEntity, ComponentEntity, HouseLayoutFlag, FlipStatus, WallEntity } from './entity'
import { Opening } from './opening'
import { HouseLayoutDragEntity } from './base-drag-entity'
import { CompoundPath, PathItem, Point as PaperPoint } from 'paper'
import { HouseLayoutGeometryFactory, BaseEntityGeometry} from '../entity-geometry/entity-geometry'
import { Vector2 as Vec2, Vector3 } from 'three'
import { PolygonPath, BasePath } from '../path/path'

export class HouseLayout extends BaseEntity {
  protected rooms_: Set<Room>;
  protected outerWall_: Geo.Polygon;
  protected tmpRoom_: Array<InnerWall>;
  protected tmpWall_: InnerWall;
  protected name_: string;
  protected openings_: Set<Opening>;
  protected wallEntities_: WallEntities;
  protected roomEntities_: RoomEntities;
  // tmp data for wall entities debugging
  //  protected innerWalls_: Array<Geo.Segment>;
  //  protected outWalls_: Array<Geo.Segment>;
  //  protected axisWalls_: Array<Geo.Segment>;

  constructor() {
    super();
    this.outerWall_ = null;

    this.rooms_ = new Set<Room>();
    this.name_ = '';


    this.openings_ = new Set<Opening>();
    this.subObjects_ = new Map<string, BaseEntity>();
    this.setIsTmp(false);


    this.tmpWall_ = null;
    this.tmpRoom_ = new Array<InnerWall>();
    this.wallEntities_ = null;
    this.roomEntities_ = null;
   }

   wallEntities(): WallEntities {
     return this.wallEntities_;
   }
   roomEntities(): RoomEntities {
     return this.roomEntities_;
   }
    toJSON() {
        const result = super.toJSON();
        //处理openings
        const openingsArray = new Array();
        for (let i = 0 ; i < this.openings().length ; i++) {
            openingsArray.push(this.openings()[i].toJSON());
        }
        result.openings = openingsArray;
        //处理rooms
        const roomsArray = new Array();
        for (let i = 0 ; i < this.rooms().length ; i++) {
            roomsArray.push(this.rooms()[i].toJSON());
        }
        result.rooms = roomsArray;
        result.name = this.name_;
        return result;
    }

    // 后期用hasOwnProperty替换，放到基类中
    fromJSON(input) {
        super.fromJSON(input);
        //反序列化rooms
        if (null !== input.rooms && undefined !== input.rooms ) {
            for (let i = 0; i < input.rooms.length; i++) {
                const roominfo = new Room(new Array<InnerWall>())
                    .fromJSON(input.rooms[i]);

                this.rooms_.add(roominfo);
            }
        }
       this.name_ = input.name;
        //反序列化openings
        if (null !== input.openings && undefined !== input.openings ) {
            for (let i = 0; i < input.openings.length; i++) {
                const infos = input.openings[i];
                //通过保存的showEntityInfo和工厂创建对应的Opening
                const newOpening = FlagFactory.createFlag(infos.showEntityInfo,false).fromJSON(infos);
                const opening = <Opening>newOpening;
                this.openings_.add(opening);
            }
        }

        //给opening的connectedRooms填充数据
        for (let i = 0; i < this.openings().length; i++) {
            const indexs  = input.openings[i].connectedRooms_;
            this.openings()[i].fillingIndexValue(indexs,this.rooms());
         }
        //给room的attachedOpenings填充数据
        for (let i = 0;i<this.rooms().length;i++) {
            const indexs = input.rooms[i].attachedOpenings;
            this.rooms()[i].fillingIndexValue(indexs,this.openings());
            //给room里面的walls的withinRoom填充数据
            const room = this.rooms()[i];
            for(let j = 0;j < room.walls().length;j++) {
              const roomindex = input.rooms[i].walls[j].withinRoom_;
              this.rooms()[i].walls()[j].fillingIndexValue(roomindex,this.rooms())
            }
        }


    return this;
  }


  name(): string {
    return this.name_;
  }

  outerWall(): Geo.Polygon {
    return this.outerWall_;
  }

  rooms(): Array<Room> {
    return Array.from(this.rooms_);
  }

  tmpWall(): InnerWall {

    return this.tmpWall_;
  }

  /**
   * @function 更新临时墙信息
   * @param seg
   */
  setTmpWall(seg: InnerWall) {
    if (this.tmpWall_ !== null) {
      // dont destroy it
      // this.tmpWall_.destoryPath();
      this.tmpWall_ = null;
    }

    this.tmpWall_ = seg;
  }

  tmpRoom(): Array<InnerWall> {
    return this.tmpRoom_;
  }

  protected checkAddExistingWall(wall: InnerWall, opening?: Opening, segment?: Geo.Segment):boolean{
      // 检查相同是否有相同墙壁

      // 绘图状态
      for(let i = 0; i < this.tmpRoom_.length;i++){
          if(this.tmpRoom_[i].id() === wall.id()) {
             const inner = this.tmpRoom_[i];
             inner.shallowCopy(wall);
             return true;
          }
      }

      //
      const rooms = this.rooms();
      for(let i = 0; i < rooms.length;i++) {
         const walls = (<Room>rooms[i]).walls();
         for(let j = 0; j < walls.length;j++) {
             if(walls[j].id() === wall.id()) {
               const inner = walls[j];
               inner.shallowCopy(wall);
               return true;
             }
         }
      }


      // 从传入的wall数据中获取信息
      return false;
  }




  /**
   * 向临时数据中添加墙，
   * 如果添加的不是null， 则将数据添加到临时房间中
   * 如果添加的数据是null,　则将检查数据时候是联通数据，
   * 如果是连通数据，则添加新的房间，清空临时数据，
   * 如果已有墙壁与添加的墙壁的ID相同,则直接根据传入数据修改已有墙壁
   * 反之不添加，清空临时数据
   * 如果添加的墙使临时数据闭合，则构成新的房间，返回新的房间数据
   *     如果添加的墙的终点与房间起点属于与房间关联的门洞，则构成新的房间，返回新的房间数据
   * 反之，
   *
   * 返回值： 被添加到房间的墙壁的数据集合
   * @param wall
   * @modified fangchen 20170925
   * 为适配command pattern做出的必要性修改
   */
  addWall(wall: InnerWall, opening?: Opening, segment?: Geo.Segment): InnerWall[] {
    if (wall === null) {
      console.error('null wall added to action');
      return null;
    }

    if(this.checkAddExistingWall(wall,opening,segment)) {
      // 只有墙被修改,没有新墙添加, 因此返回null

       return null;
    }

    const resultArray = new Array<InnerWall>();

    // 2. 判断当前墙与上一部分墙是否可连接
    if (this.tmpRoom_.length > 0) {

      const lastpoint = this.tmpRoom_[this.tmpRoom_.length - 1].segment().endPoint();
      if (!wall.segment().startPoint().equal(lastpoint)) {
        console.error('current wall doesnt connects to last one!!!!');
        // return false;
      }
    }

    /*wall.initPath();
    wall.updatePath();
    wall.setStrokeColor('red');*/

    // 3. 添加临时墙到临时数据
    this.tmpRoom_.push(wall);
    resultArray.push(wall);

    // 4. 如果判断当前墙壁重点和起点，属于和房间相连的opening。
    if(opening) {
      const lineToEnd = new Geo.Line(wall.segment().endPoint(), this.tmpRoom_[0].segment().startPoint());
      const pointStart = new Geo.Point(0,0);
      const pointEnd = new Geo.Point(0,0);
      const checkAttach = opening.isOnline(lineToEnd,0,pointStart,pointEnd);
      if(checkAttach && (wall.segment().endPoint().distanceTo(pointStart) < 5 || wall.segment().endPoint().distanceTo(pointEnd) < 5)) {
        const lastWall = new InnerWall(lineToEnd);
        this.tmpRoom_.push(lastWall);
        resultArray.push(lastWall);
        this.tmpWall_ = null;
      }
    }

    // 4. 判断临时数据是否已封闭，如果封闭则添加至layout并清空临时数据
    if (this.isTmpRoomConnected()) {
      // 4.1 获取可能的与房间相邻的opening，以及公用墙
      this.addRoom(opening, segment);
      this.tmpWall_ = null;
    }

    return resultArray;

  }


    /**
     *  @function: 按照构建的顺序返回构建房屋的墙壁信息
     */
    protected getInitedWalls(room: Room): Array<InnerWall>{
      const walls = room.walls();
      if(!walls){
          return null;
      }

      if(room.isInitWithClockWise()) {
          return walls;
      }

      const tmpArray = new Array<InnerWall>();
      for(let i = 0; i < walls.length; i++) {
          walls[i].segment().swapPoints();
          const lineseg = new Geo.Line(walls[i].segment().startPoint(),walls[i].segment().endPoint());
          tmpArray.push(new InnerWall(lineseg));
      }

      for(let i = 0; i < walls.length;i++) {
          const resPondStart = tmpArray[walls.length - 1 - i].segment().startPoint();
          const resPondEnd = tmpArray[walls.length - 1 - i].segment().endPoint();

          walls[i].segment().setStartPoint(resPondStart);
          walls[i].segment().setEndPoint(resPondEnd);
      }

      return walls;
  }


  /**
   * 清除上一个被添加的墙,
   * 如果存在临时数据，则从临时数据删除墙
   * 反之，则删除最后以后添加的房间，删除最后一个添加的墙，
   *      如果最后一个添加墙壁属于与房间关联的门洞一部分，则在删除其之后，再删除之前一步添加的墙
   * 将剩余数据放到临时数据中
   * 如果有数据可供清除，则返回 清除的墙， 反之，返回null
   */
  popWall(attachedOpening?: Opening): InnerWall[] {
    // 存在临时数据
    if (this.tmpWall_ !== null) {
      return null;
    }

    const resultArray = new Array<InnerWall>();

    if (this.tmpRoom_.length > 0) {
      const popWall = this.tmpRoom_.pop();
      //popWall.destoryPath();
      const length = this.tmpRoom_.length;
      // this.tmpWall_ = length === 0 ? null : this.tmpRoom_[length - 1];
      resultArray.push(popWall);
      popWall.setWallType(InnerWallType.INNERWALL_UNHANDLED);
      return resultArray;
    }

    // 从最后一个添加添加的房间中清除最后一个添加的墙
    const lastRoom = this.getLastRoom();
    if (lastRoom !== null) {
      // modified： 按照构建的顺序得到房屋内墙信息
      const walls = this.getInitedWalls(lastRoom);
      this.tmpRoom_ = this.tmpRoom_.concat(walls);

      const popWall = this.tmpRoom_.pop();
      popWall.setWallType(InnerWallType.INNERWALL_UNHANDLED);
      resultArray.push(popWall);

      if(attachedOpening) {
          const pointstart = new Geo.Point(0,0);
          const pointend = new Geo.Point(0,0);
          const attached = attachedOpening.isOnline(popWall.segment(),0,pointstart,pointend);
          const attachingLength = pointstart.distanceTo(pointend);

          // 只考虑正好重合的情况，避免多pop出已经被合并的墙
          if( Math.abs( attachingLength - popWall.segment().length()) < 1) {
              const newpopWall = this.tmpRoom_.pop();
              newpopWall.setWallType(InnerWallType.INNERWALL_UNHANDLED);
              resultArray.push(newpopWall);
          }
      }


      this.removeRoom(lastRoom);
      return resultArray;
    }

    return null;
  }

  /**
   * 获取最后添加的房间
   */
  protected getLastRoom(): Room {
    const rooms = this.rooms();
    let maxIndex = -1;
    let lastRoom = null;
    for (let i = 0; i < rooms.length; i++) {
      const tmpRoom = rooms[i];
      const index = tmpRoom.id();
      if (index > maxIndex) {
        maxIndex = index;
        lastRoom = tmpRoom;
      }
    }
    return lastRoom;
  }

  getAuxpoint(availavlePoint: Geo.Point, arrayAuxpoints: Array<Geo.Point>) {
    const rooms = this.rooms();
    for (let i = 0; i < this.roomNum(); i++) {
      rooms[i].getAuxpoint(availavlePoint, arrayAuxpoints);
    }
  }

  getVTLines(point: Geo.Point, linearray: Array<Geo.Segment>) {
    const rooms = this.rooms();
    for (let i = 0; i < this.roomNum(); i++) {
      rooms[i].getVTLines(point, linearray);
    }
  }


  GroupInnerWalls(innerWalls: Array<InnerWall>) {
    const groupedInnerWalls = new Array<InnerWall>();
    let innerWallNumber = innerWalls.length;
    let index  = 0;
    while(index < innerWallNumber) {
      const currentIndex = index;
      const nextIndex = (index + 1) % innerWallNumber;
      const currentInnerSegment = innerWalls[currentIndex].segment();
      const nextInnerSegment = innerWalls[nextIndex].segment();
      if (currentInnerSegment.type() != Geo.GeometryType.GEO_LINE || nextInnerSegment.type() != Geo.GeometryType.GEO_LINE) {
        index++;
        continue;
      }
      const currentDir = (<Geo.Line>currentInnerSegment).direction();
      const nextDir = (<Geo.Line>nextInnerSegment).direction();
      const diff = MathUtil.CreateVecBySubtraction(currentDir, nextDir);
      if(MathUtil.isZero(diff.length())) {
        currentInnerSegment.setEndPoint(nextInnerSegment.endPoint());
        innerWalls.splice(nextIndex, 1);
        innerWallNumber--;
      } else {
        index++;
        continue;
      }
    }

  }


  /**
   * 将临时数据作为房间添加户型数据中
   * 如果临时数据不连通，返回false
   * 反之返回 true
   * @param opening
   * @param segment
   *
   */
  addRoom(opening: Opening, segment: Geo.Segment): boolean {
    if (!this.isTmpRoomConnected()) {
      return false;
    }

    //this.GroupInnerWalls(this.tmpRoom_);
    const newRoom = new Room(this.tmpRoom_);
    if (opening !== null) {
      newRoom.addOpening(opening, segment);
      opening.attachToRoom(newRoom);
    }

    this.rooms_.add(newRoom);
    this.subObjects_['room' + newRoom.id().toString()] = newRoom;
    while (this.tmpRoom_.length !== 0) {
      const tmpSegment = this.tmpRoom_.pop();
      // tmpSegment.destoryPath();
    }
    this.tmpWall_ = null;
    // this.tmpRoom_ = null;
    // this.updateView();
    return true;
  }

  addRooms(newRoom: Room) {
    this.rooms_.add(newRoom);
    this.subObjects_['room' + newRoom.id().toString()] = newRoom;
  }

  roomNum(): number {
    return this.rooms_.size;
  }

  /**
   * getNeareastWall 应该返回InnerWall对象，InnerWall对象中会包含Segment
   * @param point
   */
  getNearestWall(point: Geo.Point): Array<any> {
    let wall: InnerWall = null;
    let minDistance = 0;
    const rooms = this.rooms();
    for (let i = 0; i < rooms.length; i++) {
      const array = rooms[i].getNearestWall(point);
      if (array[0] !== null) {
        if (wall === null || (<number>array[1]) < minDistance) {
          wall = array[0];
          minDistance = array[1];
        }
      }
    }
    const result = new Array<any>();
    result.push(wall);
    result.push(minDistance);
    return result;
  }

  addDragObject(object: BaseEntity) {
    //  switch(object.)
    //  if(instanceof)
  }

  getRoomByPoint(point:Geo.Point): Room {
    let result: Room = null;
    const rooms = this.rooms();

    for(let i = 0; i < rooms.length; i++) {
      if(rooms[i].containsPoint(point)) {
        result = rooms[i];
        break;
      }
    }

    return result;
  }

  getRoomByWall(wall: Geo.Segment): Room {
    let result: Room = null;
    const rooms = this.rooms();
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].contains(wall)) {
        result = rooms[i];
        break;
      }
    }
    return result;
  }

  private createHoleEntity(opening: Opening): CubeHoleEntity {
    let holeEntity: CubeHoleEntity;

    let Id = opening.id();

    const matrix = (<Opening>opening).getPathMatrix();
    let newCenter;

    newCenter = opening.position();
    const halfWidth = opening.width() / 2.0;
    const halfLength = opening.length() / 2.0;
    const point1 = new PaperPoint(-halfLength, 0);
    const point2 = new PaperPoint(halfLength, 0);

    const point3 = point1.transform(matrix);
    const point4 = point2.transform(matrix);

    const newLengthPaperDirection = point4.subtract(point3);
    const newLengthDirection = new Vec2(newLengthPaperDirection.x, newLengthPaperDirection.y);
    newLengthDirection.normalize();
    //////////////////////////////////
    const newCubeHoleRect = new Geo.Rect(newCenter, opening.width(), opening.length(), newLengthDirection);

    let holeHeight = opening.height();
    let distanceFromGroundsOfHole = 1.0e-6;
    if (opening.openingType() != 0) {
      // door or window
      if (opening.openingType() === OpeningType.ONE_DOOR || opening.openingType() === OpeningType.TWO_DOOR || opening.openingType() ===
          OpeningType.SLIDING_DOOR) {
        // door
        distanceFromGroundsOfHole += (<Doors>opening).distancefromground();
      } else {
        // window
        distanceFromGroundsOfHole += (<Windows>opening).distancefromground();
      }

      let openType: OpeningType = opening.openingType();
      const openingId = Id;
      const flipStatus = opening.getFlipStatus();

      // get default status
      let nDirection = new Vector3(-newLengthDirection.y, 0, newLengthDirection.x);
      let perpenDir = new Vec2(-newLengthDirection.y, newLengthDirection.x);
      if (MathUtil.CrossProduction(perpenDir, newLengthDirection) < 0) {
        nDirection = new Vector3(newLengthDirection.y, 0, -newLengthDirection.x);
      }

      let tDirection = new Vector3(newLengthDirection.x, 0, newLengthDirection.y);
      if (openType == OpeningType.ONE_DOOR) {
        if (flipStatus == FlipStatus.VERTICAL_FLIP) {
          nDirection = new Vector3(-nDirection.x, -nDirection.y, -nDirection.z);
        } else if (flipStatus == FlipStatus.OPPOSITE_FLIP) {
          nDirection = new Vector3(-nDirection.x, -nDirection.y, -nDirection.z);
          tDirection = new Vector3(-tDirection.x, -tDirection.y, -tDirection.z);
        } else if (flipStatus == FlipStatus.HORIZON_FLIP) {
          tDirection = new Vector3(-tDirection.x, -tDirection.y, -tDirection.z);
        }
      } else if (openType == OpeningType.TWO_DOOR || openType == OpeningType.BAY_WINDOW) {
        if (flipStatus == FlipStatus.OPPOSITE_FLIP) {
          nDirection = new Vector3(-nDirection.x, -nDirection.y, -nDirection.z);
        }
      }


      const openingEntity =  new OpeningEntity(openType, nDirection, tDirection, openingId);
      holeEntity = new CubeHoleEntity(newCubeHoleRect, holeHeight, distanceFromGroundsOfHole, undefined, openingEntity);
    } else {
      // hole
      //holeHeight = 210;
      //handle accurate error, else hole of shape geometry will have uexpected behavior

      const holeId = Id;
      holeEntity = new CubeHoleEntity(newCubeHoleRect, holeHeight, distanceFromGroundsOfHole, holeId);
    }
    return holeEntity;
  }


  /**检查是否在添加已经存在的房间 */
  protected CheckAddExistingOpening(opening: Opening, wall: Geo.Segment): boolean {
    const openings = this.openings();



    for(let i = 0 ; i < openings.length;i++) {
       const compareopening = openings[i];
       if(compareopening.id() === opening.id()) {
            // 更新Opening
            compareopening.shallowCopy(opening);

            // 更新Opening包含的公共墙信息
            this.getRoomByWall(wall);

            return true;
       }
    }


    return false;
  }


  /**
   * 添加Opening时，如果画布数据内部已有相同id的opening，则对其进行更新
   * @param opening
   * @param wall
   */
  addOpening(opening: Opening, wall: Geo.Segment): boolean {
    let isExist = false;
    let wallEntityIndex = -1;
    if(this.CheckAddExistingOpening(opening, wall)) {
      isExist = true;
    }

    if (!isExist) {
      const room = this.getRoomByWall(wall);
      if (room === null) {
        return false;
      }

      opening.attachToRoom(room);
      room.addOpening(opening, wall);


      this.openings_.add(opening);
      this.subObjects_['opening' + opening.id().toString()] = opening;
      opening.setIsTmp(false);

      if (opening.openingType() != 0 && this.wallEntities_) {
        //////////////////////////////////////////////////
        // add hole data to wall entitie and update 3D
        const holeEntity = this.createHoleEntity(opening);
        wallEntityIndex = this.wallEntities_.pushOpening(holeEntity);
      }
    } else {
      // same opening with different property, need to update

      //////////////////////////////////
      // get the opening and simply update property of old one by new one
      const newHoleEntity = this.createHoleEntity(opening);
      let openingId = opening.id();
      let ret = this.wallEntities_.getOpening(openingId);
      if (ret.hasOwnProperty('wallIndex') && ret.hasOwnProperty('opening')) {
        wallEntityIndex = ret['wallIndex'];
        let oldHoleEntity = ret['opening'];
        oldHoleEntity.setHoleEntityProperty(newHoleEntity);
      }


    }
    if (wallEntityIndex != -1) {
      // update 3D data
      const wallInfos = this.wallEntities_.dumpWallEntities();
      const roomInfos = this.roomEntities_.dumpRoomInfos();
      //update3DHole(this.wallEntities_.walls()[wallEntityIndex]);
    }

    return true;
  }

  removeOpening(opening: Opening): boolean {
    let delrslt = false;

    this.openings_.forEach(element => {
      if (opening.id() === element.id()) {
        this.openings_.delete(element);
        element.destoryPath();
        delrslt = true;

        const rooms = this.rooms();
        let bSuccessed = false;
        for (const room of rooms) {
          if (room.removeOpening(element)) {
            bSuccessed = true;
          }
        }

        element.setIsDirty(true);
        element.destoryPath();
        element.updateView();
      }

    });

    if (!delrslt) {
      return false;
    }

    if (this.wallEntities_) {
      let openingId = opening.id();
      //////////////////////////////////
      // remove hole data from wall entitie and update 3D
      const wallEntityIndex = this.wallEntities_.removeOpening(openingId);
      if (wallEntityIndex != -1) {
        //update3DHole(this.wallEntities_.walls()[wallEntityIndex]);
      }
    }



    return delrslt;
  }

  /**
   * @function 删除指定的房间
   * @param room
   */
  removeRoom(room: Room): boolean {
    const openings = this.openings();
    for (const opening of openings) {
      // 如果门洞至于该房间关联， 则删除掉
      if (opening.connectedRoomsNum() === 1) {
        this.removeOpening(opening);
        continue;
      }

      // 如果门洞和多个房间关联，则取消room和该opening的相互关联
      room.removeOpening(opening, false);

      opening.removeFromRoom(room);
    }

    if (!this.rooms_.delete(room)) {
      return false;
    }

    room.setIsDirty(true);
    return true;
  }

  openings(): Array<Opening> {
    return Array.from(this.openings_);
  }

  eliminateOuterWalls(): Boolean {
    const rooms = this.rooms();
    if (rooms.length === 0 || this.outerWall_ === null) {
      return false;
    }
    for(let i = 0; i < rooms.length;i++) {
      rooms[i].eliminateOuterWalls();
      rooms[i].setIsOutWallNeeded(false);
    }

    // 1. 清空外墙

    delete this.outerWall_;
    this.outerWall_ = null;
    this.geos_.delete('outerWall');

    ////////////////////////////
    delete this.wallEntities_;
    this.wallEntities_ = null;

    delete this.roomEntities_;
    this.roomEntities_ = null;
    return true;
  }

  outwallGenerated(): Boolean {
    return (this.outerWall_ !== null);
  }


  // create the wall entities and push the hole and door/window properties
  createWallEntities() {
    let innerWalls: Array<Array<Geo.Segment>>;
    innerWalls = new Array();

    let wallHeights: Array<Array<number>>;
    wallHeights = new Array();

    let roomCenters: Array<Vec2>;
    roomCenters = new Array();

    let roomTags: Array<Array<number>>;
    roomTags = new Array();
    const allRooms = this.rooms();
    const roomLength = allRooms.length;

    const holeEntities = new Array<CubeHoleEntity>();


    for (let i = 0; i < roomLength; i++) {
      const tmpSegmentInfo = allRooms[i].region().segments();
      const tmpSegments = Room.formatWalls(tmpSegmentInfo);


      innerWalls[i] = new Array();
      const tag = allRooms[i].id();
      roomTags[i] = new Array();
      wallHeights[i] = new Array();

      const roomCenter = allRooms[i].getRoomCenter();
      roomCenters.push(new Vec2(roomCenter.x(), roomCenter.y()));
      const holes = allRooms[i].attachedOpenings();
      if (holes.length > 1) {
        const holeLength = holes.length / 2;
        for (let j = 0; j < holeLength; ++j) {
          const hole = holes[2 * j];

          const holeEntity = this.createHoleEntity(hole);
          holeEntities.push(holeEntity);
        }
      }

      for (let j = 0; j < tmpSegments.length; j++) {
        innerWalls[i].push(tmpSegments[j].clone());
        wallHeights[i].push(280);
        // wallHeights[i].push(walls[j].height());
        roomTags[i].push(tag);
      }

      ///////////////////
    }

    //const allOpenings = this.openings();
    this.wallEntities_ = new WallEntities(innerWalls, wallHeights, roomTags, roomCenters, holeEntities);
  }

  // create room entities and push the component properties
  createRoomEntities() {
    if (this.wallEntities_) {
      const rooms = this.rooms();
      const roomEntites = new Array<RoomEntity>();
      let components = new Array<HouseLayoutFlag>();
      let componentRoomTags = new Array<number>();


      for (let i = 0; i < rooms.length; i++) {
        const roomTag = rooms[i].id();
        const roomEntity = new RoomEntity(this.wallEntities_, roomTag);
        roomEntites.push(roomEntity);

        // component
        const flags = rooms[i].getFlags();
        const flagNumber = flags.length;
        for(let j = 0; j < flagNumber; ++j) {
          const flag = flags[j];
          if (flag instanceof HouseLayoutFlag) {
            components.push(flag);
            componentRoomTags.push(roomTag);
          }
        }
      }


      this.roomEntities_ = new RoomEntities(roomEntites);
      const componentNumber = components.length;
      for(let i = 0; i < componentNumber; ++i) {
        const component = components[i];
        const roomTag = componentRoomTags[i];
        const componentEntity = this.createComponentEntity(component);
        this.roomEntities_.pushComponent(componentEntity, roomTag);
      }

      for (let i = 0; i < rooms.length; ++i) {
        const room = rooms[i];
        const wallEntities =roomEntites[i].walls();
        const walls = new Array<WallEntity>();
        const wallLength = wallEntities.length;
        for (let j = 0; j < wallLength; ++j) {
          const wallEntity = wallEntities[j].clone();
          walls.push(wallEntity);
        }
        room.setWallEntities(walls);
        room.updateInnerWallsWithWallEntities();
      }
    }
  }



  generateOuterWalls(): Geo.Polygon {
    /////////////////////////////
    // storage data
    /////////////////////////////
    const rooms = this.rooms();
    const roomLength = rooms.length;
    if (rooms.length === 0) {
      return null;
    }

    const openings = this.openings();
    let polygon = rooms[0].generateOutWalls();

    for (let i = 1; i < rooms.length; i++) {
      const tmpPolygon = rooms[i].generateOutWalls();
      polygon = Geo.Polygon.BooleanOperationForPolygon(polygon, tmpPolygon, 'unite');
    }

    this.outerWall_ = new Geo.Polygon(polygon.segments());
    this.geos_['outerWall'] = this.outerWall_;

    ///////////////////////////////////
    let innerWalls: Array<Array<Geo.Segment>>;
    innerWalls = new Array();
    for (let i = 0; i < roomLength; i++) {
      const tmpSegments = rooms[i].region().segments();
      innerWalls[i] = new Array();
      for (let j = 0; j < tmpSegments.length; j++) {
        innerWalls[i].push(tmpSegments[j].clone());
      }
    }

    this.createWallEntities();
    this.createRoomEntities();

    const wallInfos = this.wallEntities_.dumpWallEntities();

    const roomInfos = this.roomEntities_.dumpRoomInfos();

    ////////////////////////
    ///////////////////////////////
    // create 3D Wall
    // house center
    let roomCenters: Array<Vec2>;
    roomCenters = new Array();
    for (let i = 0; i < roomLength; i++) {
      const roomCenter = rooms[i].getRoomCenter();
      roomCenters.push(new Vec2(roomCenter.x(), roomCenter.y()));
    }
    let houseCenter2D = new Vec2(0, 0);
    for(let i = 0; i < roomLength; ++i) {
      houseCenter2D.add(roomCenters[i]);
    }

    houseCenter2D.divideScalar(roomLength);
    const houseCenter = new Vector3(houseCenter2D.x, 0, houseCenter2D.y);
    //create3DWalls(this.wallEntities_, innerWalls, houseCenter);
    //create3DComponents(this.roomEntities_);
    ////////////////////////////////////

    return this.outerWall_;
  }

  private createComponentEntity(component: HouseLayoutFlag): ComponentEntity {
    let componentEntity: ComponentEntity;

    let Id = component.id();

    const matrix = component.getPathMatrix();
    let newCenter;

    newCenter = component.position();
    const halfWidth = component.width() / 2.0;
    const halfLength = component.length() / 2.0;
    const point1 = new PaperPoint(-halfLength, 0);
    const point2 = new PaperPoint(halfLength, 0);

    const point3 = point1.transform(matrix);
    const point4 = point2.transform(matrix);

    const newLengthPaperDirection = point4.subtract(point3);
    const newLengthDirection = new Vec2(newLengthPaperDirection.x, newLengthPaperDirection.y);
    newLengthDirection.normalize();
    //////////////////////////////////
    const newCubeHoleRect = new Geo.Rect(newCenter, component.width(), component.length(), newLengthDirection);


    let componentHeight = component.height();
    let distanceFromGroundsOfHole = 1.0e-6;

    const componentType =component.flagType();
    const height = component.height();
    componentEntity = new ComponentEntity(componentType, newCubeHoleRect, height, distanceFromGroundsOfHole, Id);
    return componentEntity;
  }

  protected checkAddExistingFlag(flag: HouseLayoutDragEntity): boolean {
       let result = false;
       // 查找有无相同id的flag
       let sameflag = null;
       const rooms = this.rooms();
       for(let i = 0; i < rooms.length; i++) {
          const flags = (<Room>rooms[i]).getFlags();
          for(let j = 0; j < flags.length; j++) {
            const flaginfo = flags[j];
            if(flaginfo.id() === flag.id()) {
              sameflag = flaginfo;
            }
          }
       }

       if(sameflag === null ) {
         return false;
       }

       // 如果有则
       // 先将自己removeFromHouseLayout
       (<HouseLayoutDragEntity>sameflag).removeFromHouseLayout(this);

       // 接收新版数据,
       (<HouseLayoutDragEntity>sameflag).shallowCopy(flag);
       // 再把自己放回去
       (<HouseLayoutDragEntity>sameflag).addToHouseLayout(this);

       return result;
  }

  /**
   * 向户型中添加flag,
   * 如果flag在某个房间中，且该房间中不存在该flag，则添加成功
   * 反之，添加失败
   * 添加成功后， 为flag创建底层信息
   * 如果有相同id的flag，则将从houselayout暂时取出，将add进来的flag的数据赋给这个已有的flag，然后
   * 将这个原有的flag放置回houselayout
   * @param flag
   * @param objinfo
   */
  addFlag(flag: HouseLayoutDragEntity, objinfo?: any): boolean {
    const rooms = this.rooms();

    if(this.checkAddExistingFlag(flag)) {
      return true;
    }

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].containsPoint(flag.position())) {
        if (rooms[i].addFlag(flag)) {
          if (flag instanceof HouseLayoutFlag && this.roomEntities_) {
            const componentEntity = this.createComponentEntity(flag);
            const index = this.roomEntities_.pushComponent(componentEntity, rooms[i].id());
            if (index != -1) {
              //create3DComponent(componentEntity);
            }
          }


        }
      }
    }

    /////////////////////////////////////


    return false;
  }

  removeFlag(flag: HouseLayoutDragEntity): boolean {
    let componentUuid;
    const rooms = this.rooms();
    for (let i = 0; i < rooms.length; i++) {

        const  canRemove = rooms[i].removeFlag(flag);
        if (canRemove && this.roomEntities_) {
          componentUuid = this.roomEntities_.removeComponent(flag.id());
          // remove 3D component
          //remove3DComponent(componentUuid);
        }

        // if(canRemove) {
        //   return canRemove;
        // }

    }

    flag.setIsDirty(true);



    return false;
  }

  /**
   * 查找未连接的Opening
   */
  findSingleOpening(): Opening {
      const openings = this.openings();
      for(let i = 0; i < openings.length; i++){
          if(openings[i].connectedRoomsNum() === 1 && openings[i] instanceof DoorwayFlag){
            return openings[i];
          }
      }

      return null;
  }

  /**
   * 临时数据是否连通
   */
  isTmpRoomConnected(): boolean {
    if (this.tmpRoom_ === null) {
      return false;
    }

    if (this.tmpRoom_.length <= 2) {
      return false;
    }

    const firstSegment = this.tmpRoom_[0];
    // 房间实质为点的情况
    if(firstSegment.segment().length() < 1) {
        return false;
    }

    const lastSegment = this.tmpWall_ !== null?
        this.tmpWall_ : this.tmpRoom_[this.tmpRoom_.length - 1];
    if (!firstSegment || !lastSegment) {
      return false;
    }
    if (firstSegment.segment().startPoint().equal(lastSegment.segment().endPoint())) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 找到跟wall 相关联的opening
   * @param wall
   */
  getOpeningByWall(wall: InnerWall): Array<Opening> {
    // const openings = new Array<Opening>();
    const room = this.getRoomByWall(wall.segment());
    if (room === null) {
      return new Array<Opening>();
    } else {
      return room.getOpeningsByWall(wall);
    }
  }

  /**负责根据自己内部输出输出EntityGeometry */
  /**updating */
  generateEntityGeometries(): Map<string, BaseEntityGeometry>{
      const geometryArray = new Map<string,BaseEntityGeometry>();

      // 1. 生成外墙。 （内墙在room中构建)
      const polygon = this.generateOuterWalls();
      if(polygon) {
        const geo = new BaseEntityGeometry(null);
        const geoPath = new PolygonPath(polygon);
        geoPath.style.strokeColor = '#333843';
        const geoMap = new Map<string, BasePath>();
        geoMap['polygon'] = geoPath;
        geo.setGeos(geoMap);
        geometryArray.set('outerWall', geo);
      }

/**
 *     const openings = this.openings();
    for (const opening of openings) {
 */

      // 2. 生成Room
      const roomEntityArray = new Array<RoomGeometry>(); //
      const rooms = this.rooms();
      for(const roominfo of rooms){
          // 2.1 RoomEntityGeomerty
          const roomGentityGeo = HouseLayoutGeometryFactory.CreateGeometry(roominfo);
          roomEntityArray.push(<RoomGeometry>roomGentityGeo);
          const strname = roomGentityGeo.refEntity().showEntityInfo() + roomGentityGeo.refEntity().id().toString();
          geometryArray.set(strname , roomGentityGeo);

          // 2.2 生成InnerWallEntityGeometry
          const walls = roominfo.walls();

          for(let i = 0 ; i < walls.length; i++) {
             const innerWallEntityGeometry =  HouseLayoutGeometryFactory.CreateGeometry(walls[i]);
             const strname = innerWallEntityGeometry.refEntity().showEntityInfo() + innerWallEntityGeometry.refEntity().id().toString();
             geometryArray.set(strname , innerWallEntityGeometry);

          }
      }

      // if(rooms) {
      //   return geometryArray;
      // }



      // 3. 填充entityGeometry属性
      // this.roomEntities_ = new RoomEntities(this.rooms());
      // protected wallEntities_: WallEntities;
      // protected roomEntities_: RoomEntities;

      // 4. 生成Opening
      const openings = this.openings();
      for(let i = 0; i < this.openings().length; i++) {
         const openingEntityGeo = HouseLayoutGeometryFactory.CreateGeometry(openings[i]);
         const strname = openingEntityGeo.refEntity().showEntityInfo() + openingEntityGeo.refEntity().id().toString();
         geometryArray.set(strname, openingEntityGeo);
      }

      // 5. 生成flag
      const roomsinfo = this.rooms();
      for(let roomIndex = 0; roomIndex < roomsinfo.length ; roomIndex++) {
         const room = roomsinfo[roomIndex];
         const flags = room.getFlags();
         for(let flagIndex = 0; flagIndex < flags.length; flagIndex++) {
           const flagInfo = HouseLayoutGeometryFactory.CreateGeometry(flags[flagIndex]);
           const strname = flags[flagIndex].showEntityInfo() + flags[flagIndex].id().toString();
           geometryArray.set(strname, flagInfo);
         }
      }




      return geometryArray;
  }

}


