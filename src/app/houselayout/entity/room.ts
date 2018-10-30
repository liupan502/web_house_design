import { Window, Door } from './opening'
import * as Geo from '../../geometry/geometry'
import { BaseEntity, HouseLayoutFlag, InnerWall, InnerWallType, WallEntity, FlagFactory } from './entity'
import { Opening } from './opening'
import { CompoundPath, PathItem, Path, PointText } from 'paper'
import { Vector2 as Vec2 } from 'three'
import * as MathUtil from '../../math/math'
import { HouseLayoutDragEntity } from './base-drag-entity'
import { HouseLayoutGeometryFactory } from '../entity-geometry/entity-geometry'


import { Arc, Segment, Line, Point, GeometryType } from '../../geometry/geometry'

export class Room extends BaseEntity {
  protected static maxId = 0;
  protected static maxIdRange = 1000;
  protected windows_: Array<Window>;
  protected doors_: Array<Door>;
  // protected walls_: Geo.Polygon;

  protected walls_: Array<InnerWall>;

  // wall entity belong to this room
  protected wallEntities_: Array<WallEntity>;

  protected isTmp_: boolean;
  protected currentWall_: Geo.Segment;
  // 在构造时记录墙构建的方向（是否顺时针），以使得拆房间时能‘恢复’这种方向
  protected isInitWithCloseWise_: boolean;

  // 房屋数据在收到生成外墙请求时，把自身的外墙存在标记设置即可，不需要额外数据
  protected outWallExisted_: boolean;
  protected outWallPolygon_: Geo.Polygon;

  // protected attachedOpenings_: Set<Array<any>>;
  // 房屋和Opening之间是 n <=> m的关系，因此分别关联
  // 此部分数据创建后仍然需要提供增删，因此使用set保存
  protected attachedOpenings_: Set<Opening>;

  protected flags_: Set<HouseLayoutDragEntity>;

  private static GenerateId(): number {
    Room.maxId = Room.maxId + 1;
    Room.maxId = (Room.maxId) % Room.maxIdRange;
    return Room.maxId;
  }

  constructor(tmpWalls: Array<InnerWall>) {
    super();
    this.isTmp_ = true;
    this.currentWall_ = null;
    this.attachedOpenings_ = new Set<Opening>();
    this.flags_ = new Set<HouseLayoutDragEntity>();

    this.windows_ = new Array<Window>();
    this.doors_ = new Array<Door>();

    this.outWallExisted_ = false;
    this.outWallPolygon_ = null;

    this.wallEntities_ = new Array<WallEntity>();

    let segments = new Array<Geo.Segment>();
    for (let i = 0; i < tmpWalls.length; i++) {
      segments.push(tmpWalls[i].segment());
    }

    if (segments.length > 0) {
      // segments = this.formatWalls(segments);
      this.geos_['region'] = new Geo.Polygon(segments);

      // this.geos_['region'].setStrokeColor('#1DA1F2');

      // this.geos_['region'] = this.walls_;
      let needwap = false;
      this.isInitWithCloseWise_ = true;
      if (!this.geos_['region'].isClockwise()) {
        this.geos_['region'].swapSegmentPoints();
        this.isInitWithCloseWise_ = false;
        needwap = true;
      }

      // 确保墙方向为顺时针后，将内墙信息添加到this.walls_
      const polygoninfo = <Geo.Polygon>this.geos_['region'];
      this.walls_ = new Array<InnerWall>();//
      const segs = polygoninfo.segments();
      for (let i = 0; i < segs.length; i++) {
        const indexi = (needwap) ? segs.length - i - 1 : i;
        tmpWalls[indexi].segment().setStartPoint(segs[i].startPoint());
        tmpWalls[indexi].segment().setEndPoint(segs[i].endPoint());
        tmpWalls[indexi].attachToRoom(this);
        tmpWalls[indexi].setWallType(InnerWallType.INNERWALL_DEFAULT);
        this.walls_.push(tmpWalls[indexi]);
      }
      // this.updateText();
    } else {
      this.walls_ = null;
    }

    ////////////////////////////////
    //MathUtil.mergeCurves(this.walls_.segments());
    ////////////////////////////////

    this.id_ = Room.GenerateId();
    this.setIsTmp(false);
  }

  updateInnerWallsWithWallEntities() {
    this.walls_ = [];
    const wallEntitiesNumber = this.wallEntities_.length;

    for (let i = 0; i < wallEntitiesNumber; ++i) {
      const innerWall = new InnerWall(this.wallEntities_[i].innerWall());
      innerWall.attachToRoom(this);
      innerWall.setWallType(InnerWallType.INNERWALL_DEFAULT);
      this.walls_.push(innerWall);
    }
  }

  setWallEntities(wall_entities: Array<WallEntity>) {
    this.wallEntities_ = [];
    const wallEntitiesNumber = wall_entities.length;

    for (let i = 0; i < wallEntitiesNumber; ++i) {
      this.wallEntities_.push(wall_entities[i]);
    }
  }

  wallEntities(): Array<WallEntity> {
    return this.wallEntities_;
  }

  getWallEntityByInnerWall(innerWall: InnerWall): WallEntity {
    const wallEntitiesNumber = this.wallEntities_.length;
    for (let i = 0; i < wallEntitiesNumber; ++i) {
      const innerwallOfWallEntity = this.wallEntities_[i].innerWall();
      const outerWallOfWallEntity = this.wallEntities_[i].outerWall();

      const innerSegment = innerWall.segment();
      if (innerSegment.isSame(innerwallOfWallEntity) || innerSegment.isSame(outerWallOfWallEntity)) {
        return this.wallEntities_[i];
      }
    }
    return null;
  }

  toJSON() {
    //console.error('toJSON not completed');
    const result = super.toJSON();
    result.id_ = this.id_;
    result.showEntityInfo = this.showEntityInfo();
    // walls的序列化

    const innerWalls = this.walls_;
    const wallObject = new Array(Object);
    for (let i = 0; i < innerWalls.length; i++) {
      const innerWall = innerWalls[i].toJSON();
      // const seg = {} as any ;
      // const startPoint = {} as any;
      // startPoint.x = innerWalls[i].segment().startPoint().x();
      // startPoint.y = innerWalls[i].segment().startPoint().y();
      // seg.startPoint = startPoint;
      // const endPoint = {} as any;
      // endPoint.x = innerWalls[i].segment().endPoint().x();
      // endPoint.y = innerWalls[i].segment().endPoint().y();
      // seg.endPoint = endPoint;
      // if(innerWalls[i].segment().type() ===  GeometryType.GEO_ARC ) {
      //     const arc = <Arc>innerWalls[i].segment();
      //     const center = {} as any;
      //     center.x = arc.center().x();
      //     center.y = arc.center().y();
      //     seg.center = center;
      //     seg.isClockwise = arc.isClockwise();
      // }
      // seg.type = innerWalls[i].segment().type();
      wallObject[i] = innerWall;
    }
    result.walls = wallObject;

    //序列化attachedOpenings 的处理 给opening添加showshowEntityInfo+id的索引
    const attachedOpeningsArray = new Array<string>();
    // 将segment对应处理
    //const attachedOpeningSeg = new Array<any>();
    const attachedOpenings = Array.from(this.attachedOpenings_);
    for (let i = 0; i < attachedOpenings.length; i++) {
      attachedOpeningsArray[i] = attachedOpenings[i].showEntityInfo() + attachedOpenings[i].id().toString();
    }
    result.attachedOpenings = attachedOpeningsArray;

    //序列化flags
    const flagsArry = new Array();
    for (let i = 0; i < this.getFlags().length; i++) {
      flagsArry.push(this.getFlags()[i].toJSON());
    }

    result.flags_ = flagsArry;

    return result;
  }



  fromJSON(input) {
    super.fromJSON(input);
    // console.error('fromJSON not completed');
    this.id_ = (input.id_ !== null && input.id_ !== undefined) ? input.id_ : this.id_;
    Room.maxId = (this.id_ > Room.maxId) ? this.id_ : Room.maxId;
    //反序列化walls
    if (input.walls !== null && input.walls !== undefined) {
      const innerWalls = new Array<InnerWall>();
      for (let i = 0; i < input.walls.length; i++) {
        //const innerWall = new InnerWall(new Segment(new Point(0,0),new Point(0,0))).fromJSON(input.walls[i]);
        const seg = input.walls[i].segment;
        if (seg.type === GeometryType.GEO_LINE) {
          const startPoint = new Geo.Point(seg.startPoint.x, seg.startPoint.y);
          const endPoint = new Geo.Point(seg.endPoint.x, seg.endPoint.y);
          const line = new Geo.Line(startPoint, endPoint);
          const lineWall = new InnerWall(line).fromJSON(input.walls[i]);
          innerWalls.push(lineWall);
        }
        if (seg.type === GeometryType.GEO_ARC) {
          const startPoint = new Geo.Point(seg.startPoint.x, seg.startPoint.y);
          const endPoint = new Geo.Point(seg.endPoint.x, seg.endPoint.y);
          const center = new Geo.Point(seg.center.x, seg.center.y);
          const arc = new Geo.Arc(startPoint, endPoint, center, seg.isClockwise);
          const arcWall = new InnerWall(arc).fromJSON(input.walls[i]);
          innerWalls.push(arcWall);
        }
      }
      this.walls_ = innerWalls;
    }


    // 反序列完walls后，填充geo信息（用于生成房屋外墙）
    const polygonsegments = new Array<Segment>();
    for (let i = 0; i < this.walls_.length; i++) {
      polygonsegments.push(this.walls_[i].segment());
    }
    this.geos_['region'] = new Geo.Polygon(polygonsegments);

    let needwap = false;
    this.isInitWithCloseWise_ = true;
    if (!this.geos_['region'].isClockwise()) {
      this.geos_['region'].swapSegmentPoints();
      this.isInitWithCloseWise_ = false;
      needwap = true;
    }

    // 确保墙方向为顺时针后，将内墙信息添加到this.walls_
    const polygoninfo = <Geo.Polygon>this.geos_['region'];
    const segs = polygoninfo.segments();
    for (let i = 0; i < segs.length; i++) {
      const indexi = (needwap) ? segs.length - i - 1 : i;
      this.walls_[indexi].segment().setStartPoint(segs[i].startPoint());
      this.walls_[indexi].segment().setEndPoint(segs[i].endPoint());
      this.walls_[indexi].attachToRoom(this);
      this.walls_[indexi].setWallType(InnerWallType.INNERWALL_DEFAULT);
      ///this.walls_.push(this.walls_[indexi]);
    }
    //反序列化flags
    if (input.flags_ !== null && input.flags_ !== undefined) {
      for (let i = 0; i < input.flags_.length; i++) {
        const infos = input.flags_[i];
        //通过保存的showEntityInfo和工厂创建对应的flag
        const newflag = FlagFactory.createFlag(infos.showEntityInfo, false).fromJSON(infos);
        this.flags_.add(newflag);
      }
    }



    return this;
  }

  //传入 rooms的attachedOpenings的索引数组 和 所有的openings，解析索引值，拿到id，遍历openings里面的opening，找到对应的opening,然后将opening填充进去
  fillingIndexValue(indexs, openings) {
    //const tmpopenings = Array.from(this.attachedOpenings_);

    for (let i = 0; i < indexs.length; i++) {
      const idString = indexs[i].replace(/[^0-9]/ig, "");
      const idNum = parseInt(idString);
      const tmpArray = Array<any>();

      const opening = this.getIndexopenings(idNum, openings);
      // this.attachedOpenings_.;
      // this.attachedOpenings_.add(tmpArray);
      this.attachedOpenings_.add(opening);
    }
  }

  getIndexopenings(id, openings) {
    for (let i = 0; i < openings.length; i++) {
      if (id === openings[i].id()) {
        return openings[i];
      }
    }
  }



  showEntityInfo() {
    return 'room';
  }

  IsOutWallExist(): boolean {
    return this.outWallExisted_;
  }

  setIsOutWallNeeded(isNeed: boolean) {
    this.outWallExisted_ = isNeed;
  }


  /**
   * 获取房间的边界
   */
  region(): Geo.Polygon {
    return this.geos_['region'];
  }

  walls(): Array<InnerWall> {
    return this.walls_;
  }

  getRoomCenter(): Geo.Point {
    const InnerWall = this.region();
    const bBox = InnerWall.getBBox();
    let center = new Geo.Point(0, 0);
    if (bBox && bBox.length == 2) {
      const leftTopPoint = bBox[0];
      const rightBottomPoint = bBox[1];
      center.setX(0.5 * (leftTopPoint.x() + rightBottomPoint.x()));
      center.setY(0.5 * (leftTopPoint.y() + rightBottomPoint.y()));
    }
    return center;
  }


  // 修改attachedOpening 实现，以保证其返回值与之前版本一致
  public attachedOpenings(): Array<any> {
    const result = Array<any>();
    const attachedOpeningsArray = Array.from(this.attachedOpenings_);
    for (let i = 0; i < attachedOpeningsArray.length; i++) {
      result.push(attachedOpeningsArray[i]);

      const attachedWall = this.getNearestWall(attachedOpeningsArray[i].position());
      result.push(attachedWall);
      //result.push(attachedOpeningsArray[i][1]);
    }

    return result;
  }


  /**
   * @update getNearestWall需要返回innerWall对象
   * @param point
   */
  getNearestWall(point: Geo.Point): Array<any> {
    let wall: InnerWall = null;
    let minDistance = 0;

    const innerWalls = this.walls();
    for (let i = 0; i < innerWalls.length; i++) {
      const segment = innerWalls[i].segment();
      if (segment.type() !== Geo.GeometryType.GEO_LINE) {
        continue;
      }

      const tmpDistance = segment.distanceFromPoint(point);
      if (tmpDistance >= 0) {
        if (wall === null || tmpDistance < minDistance) {
          wall = innerWalls[i];
          minDistance = tmpDistance;
        }

      }
    }



    const result = new Array<any>();
    result.push(wall); // it's a inner wall rather than a segment.
    result.push(minDistance);
    return result;

  }

  contains(wall: Geo.Segment): boolean {
    let result = false;
    const segments = this.geos_['region'].segments();
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].isSame(wall)) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * 将与房间关联的窗户添加到房间中，
   * @param opening
   * @param wall

   */
  addOpening(opening: Opening, wall: Geo.Segment): boolean {
    // 判断能否被加入
    if (!this.contains(wall)) {
      return false;
    }


    this.attachedOpenings_.add(opening);
    return true;
  }


  /**
   * generates checkingwall
   */
  generateCheckingOuterWall() {
    const tempSegs = Room.formatWalls(this.geos_['region'].segments());
    const offsetCurves = MathUtil.GenerateOffsetCurves(tempSegs, 23.9);
    const result = new Geo.Polygon(offsetCurves);

    return result;
  }



  // dekete out wall of room
  eliminateOuterWalls(): Boolean {
    this.outWallExisted_ = false;
    this.outWallPolygon_ = null;

    let innerWalls = this.walls_;
    const innerWallLength = innerWalls.length;
    for (let i = 0; i < innerWallLength; i++) {
      innerWalls[i].setIsSelected(false);
      innerWalls[i].setIsDragged(false);
    }
    return true;
  }

  /**
   * 生成房间外墙
   */
  generateOutWalls(): Geo.Polygon {
    if (!this.outWallPolygon_) {
      const tempSegs = Room.formatWalls(this.geos_['region'].segments());
      const offsetCurves = MathUtil.GenerateOffsetCurves(tempSegs, 24);
      const result = new Geo.Polygon(offsetCurves);
      this.outWallExisted_ = true;
      this.outWallPolygon_ = result;
      return result;
    } else {
      return this.outWallPolygon_;
    }

  }

  getVTLines(point: Geo.Point, vtlines: Array<Geo.Segment>) {
    const segements = this.geos_['region'].segments();
    for (let i = 0; i < segements.length; i++) {
      if (segements[i].type() !== Geo.GeometryType.GEO_LINE) {
        continue;
      }

      // judge whether the point is on the line
      const seg = segements[i];
      const startpoint = seg.startPoint();
      const endpoint = seg.endPoint();
      // common form of the segment line
      const linevalue = (endpoint.x() - startpoint.x()) * point.y() -
        (endpoint.y() - startpoint.y()) * point.x() + startpoint.x() * endpoint.y() -
        startpoint.y() * endpoint.x();

      const percentage = linevalue / (startpoint.x() * endpoint.y() -
        startpoint.y() * endpoint.x());

      if (Math.abs(percentage) < 0.01) {
        vtlines.push(seg);
      }
    }

  }

  protected JudgeAuxipoint(pnow: Geo.Point, pref: Geo.Point, arrayAuxpoints: Array<Geo.Point>): number {
    const xinfo = Math.abs(pnow.x() - pref.x());
    const yinfo = Math.abs(pnow.y() - pref.y());
    if (Math.sqrt(xinfo * xinfo + yinfo * yinfo) < 7.5) {
      return 0x102;
    }

    if (xinfo < 5 || yinfo < 5) {

      arrayAuxpoints.push(pref);
      if (xinfo <= 1.5 || yinfo <= 1.5) {
        pnow.setSeedType('axis');
        arrayAuxpoints.push(pnow);
      }

      return 0x0;
    } else {
      return 0x101;
    }
  }

  getAuxpoint(availavlePoint: Geo.Point, arrayAuxpoints: Array<Geo.Point>) {
    const segements = this.geos_['region'].segments();

    for (let i = 0; i < segements.length; i++) {
      // judge whether the point is on the line
      const seg = segements[i];
      const startpoint = seg.startPoint();
      const endpoint = seg.endPoint();
      this.JudgeAuxipoint(availavlePoint, startpoint, arrayAuxpoints);
      this.JudgeAuxipoint(availavlePoint, endpoint, arrayAuxpoints);

    }
  }

  getOpeningByWall(segment: Geo.Segment): Opening {
    const tmpAttachedOpenings = this.attachedOpenings();
    const attachedOpeningNum = tmpAttachedOpenings.length / 2;

    for (let i = 0; i < attachedOpeningNum; i++) {
      const wallIndex = i * 2 + 1;
      const tmpWall = tmpAttachedOpenings[wallIndex];
      const opening = tmpAttachedOpenings[wallIndex - 1];
      if (tmpWall === segment) {
        return opening;
      } else if (segment.type() === Geo.GeometryType.GEO_LINE && tmpWall.type() === Geo.GeometryType.GEO_LINE) {
        const tmpLine1 = <Geo.Line>segment;
        if (tmpLine1.contains(tmpWall.startPoint()) && tmpLine1.contains(tmpWall.endPoint())) {
          return opening;
        }
      }
    }
    return null;
  }

  protected drawArcsText(lineinfo: Geo.Segment): Boolean {
    if (lineinfo.type() !== Geo.GeometryType.GEO_ARC) {
      return false;
    }

    // THINGS NEEDED: 圆点，圆弧线中点，
    // text's anchor point： 沿中点向原点方向移动 一个字体大小的距离
    // text's rotate angle: 旋转到两点连线的法线方向（选择角度范围在-90到90内的法线方向）
    // text's value : 圆弧线段的长度
    const startPoint = lineinfo.startPoint();
    const endPoint = lineinfo.endPoint();
    const distx = (startPoint.x() - endPoint.x());
    const disty = (startPoint.y() - endPoint.y());
    const directlength = Math.sqrt(distx * distx + disty * disty);
    const circlelength = directlength * Math.PI / 2.0; // 弧线长度
    const middlePoint = new Geo.Point((startPoint.x() + endPoint.x()) / 2.0, (startPoint.y() + endPoint.y()) / 2.0);
    const texttemp = new PointText(middlePoint.toPaperPoint());
    const info = (Number)(texttemp.fontSize);

    // calculate anchor point of the text
    if (info < (directlength / 2.0)) {
      const directpoint = lineinfo.endPoint();
      const movelength = directlength / 2.0 - info; // 半径减去字体大小
      let alignx = (endPoint.x() - middlePoint.x());
      let aligny = (endPoint.y() - middlePoint.y());
      alignx = alignx / (directlength / 2.0) * movelength;
      aligny = aligny / (directlength / 2.0) * movelength;

      const directx = middlePoint.x() + alignx;
      const directy = middlePoint.y() + aligny;
      const midx = middlePoint.x();
      const midy = middlePoint.y();
      const temproate = Math.PI * 3.0 / 2.0; // 270度对应弧度
      const anchorx = (directx - midx) * Math.cos(temproate) - (directy - midy) * Math.sin(temproate) + midx;
      const anchory = (directx - midx) * Math.sin(temproate) + (directy - midy) * Math.cos(temproate) + midy;

      middlePoint.setX(anchorx);
      middlePoint.setY(anchory);
    }

    const text = new PointText(middlePoint.toPaperPoint());
    const tmpStr = circlelength.toString();
    const index = tmpStr.indexOf('.');
    const content = index >= 0 ? tmpStr.substr(0, index) : tmpStr;
    text.content = content;
    text.strokeColor = 'red';
    text.justification = 'center';
    const vec = lineinfo.toVector();
    const angle = MathUtil.radianToAngle(MathUtil.Vec2ToRadian(vec));

    // the range of angle will always be in (0,360)
    if (90 <= angle && 270 >= angle) {
      text.rotate(angle - 180, middlePoint.toPaperPoint());
    }
    if (90 > angle || 270 < angle) {
      text.rotate(angle, middlePoint.toPaperPoint());
    }

    this.texts_.add(text);
    return true;
  }

  protected drawLineText(lineinfo: Geo.Segment): Boolean {
    if (lineinfo.type() !== Geo.GeometryType.GEO_LINE) {
      return false;
    }
    const vec = lineinfo.toVector();
    const angle = MathUtil.radianToAngle(MathUtil.Vec2ToRadian(vec));
    const startPoint = lineinfo.startPoint();
    const endPoint = lineinfo.endPoint();
    const length = endPoint.subtraction(startPoint).length();
    const middlePoint = (<Geo.Line>lineinfo).middlePoint();
    if (90 > angle || 270 < angle) {
      const alignangle = angle + 90;
      const texttemp = new PointText(middlePoint.toPaperPoint());
      const info = (Number)(texttemp.fontSize);
      let alignx = (endPoint.y() - startPoint.y());
      let aligny = (startPoint.x() - endPoint.x());
      const sqrtnum = Math.sqrt(alignx * alignx + aligny * aligny);
      alignx = alignx / sqrtnum * info;
      aligny = aligny / sqrtnum * info;
      middlePoint.setX(middlePoint.x() + alignx);
      middlePoint.setY(middlePoint.y() + aligny);
      if (!this.geos_['region'].contains(middlePoint)) {
        middlePoint.setX(middlePoint.x() - 2 * alignx);
        middlePoint.setY(middlePoint.y() - 2 * aligny);
      }
    }

    const text = new PointText(middlePoint.toPaperPoint());
    const tmpStr = length.toString();
    const index = tmpStr.indexOf('.');
    const content = index >= 0 ? tmpStr.substr(0, index) : tmpStr;
    text.content = content;
    text.strokeColor = 'red';
    text.justification = 'center';


    // the range of angle will always be in (0,360)
    if (90 <= angle && 270 >= angle) {
      text.rotate(angle - 180, middlePoint.toPaperPoint());
    }
    if (90 > angle || 270 < angle) {
      text.rotate(angle, middlePoint.toPaperPoint());
    }

    this.texts_.add(text);
    return true;
  }

  updateText() {

    this.texts_.clear();
    const segments = this.geos_['region'].segments();
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment.type() === Geo.GeometryType.GEO_LINE) {
        this.drawLineText(segment);
      } else if (segment.type() === Geo.GeometryType.GEO_ARC) {
        this.drawArcsText(segment);
      } else {
        continue;
      }


    }
  }

  /**
   * 添加flag
   * @description 需要避免重复添加（通过判断id）
   * @param flag
   */
  addFlag(flag: HouseLayoutDragEntity): boolean {
    if (flag === null) {
      return false;
    }

    this.flags_.forEach(element => {
      if (element.id() === flag.id()) {
        console.error('add same flag to houselayout !!!!');
      }

      return false;
    });

    // if (this.flags_.has(flag)) {
    //     return false;
    // }

    this.flags_.add(flag);
    this.subObjects_['flag' + flag.id().toString()] = flag;

    // 将已添加的图标添加到已添加实体缓存中
    // this.addEntitiesBuffer_.push(flag.showEntityInfo() + flag.id().toString());
    // this.addEntitiesBuffer_.push(HouseLayoutGeometryFactory.CreateGeometry(flag));
    return true;
  }

  removeFlags() {
    this.flags_.forEach(element => {
      this.removeFlag(element);
    });

    this.flags_.clear();
    return true;
  }

  /**
   * 删除 flag
   * @description 按照id删除
   * @param flag
   */
  removeFlag(flag: HouseLayoutDragEntity): boolean {
    if (flag === null) {
      return true;
    }

    let deleted = false;
    this.flags_.forEach(element => {
      // 判断flag id是否相同
      if (element.id() === flag.id()) {
        deleted = true;

      }
      this.flags_.delete(element);
      this.subObjects_.delete('flag' + element.id().toString());

    });

    if (!deleted) {
      return false;
    }
    return true;
  }

  /**
   * 检查点是否在房间内
   * @param point
   */
  containsPoint(point: Geo.Point, considerOnEdge = true): boolean {


    return this.geos_['region'].contains(point, considerOnEdge);
  }



  /**
   * 删除与之相关联的窗户
   * @param opening
   * @param deleteOpening
   */
  removeOpening(opening: Opening, deleteOpening = true): boolean {
    const tmpArray = Array.from(this.attachedOpenings_);
    let bSuccessed = false;
    for (const tmpObject of tmpArray) {
      if (tmpObject === opening) {
        this.attachedOpenings_.delete(tmpObject);
        bSuccessed = true;
        break;
      }
    }


    if (deleteOpening) {
      opening.setIsDirty(true);
    }

    return bSuccessed;
  }

  /**
   * 格式化墙体，
   * 将墙体中的相互连接，方向一致的墙合并成同一个墙
   */
  static formatWalls(tmpWalls: Array<Geo.Segment>): Array<Geo.Segment> {
    const result = new Array<Geo.Segment>();
    let currentSegment: Geo.Segment = null;
    for (let i = 0; i < tmpWalls.length; i++) {
      const tmpSegment = tmpWalls[i];

      // 弧形墙的处理
      if (tmpSegment.type() === Geo.GeometryType.GEO_ARC) {
        if (currentSegment !== null) {
          result.push(currentSegment);
        }
        result.push(tmpSegment);
        currentSegment = null;
        continue;
      }

      // 直墙的处理
      if (currentSegment === null) {
        currentSegment = tmpSegment.clone();
        continue;
      }

      const v1 = currentSegment.toVector();
      const v2 = tmpSegment.toVector();

      const isParallel = MathUtil.AreVectorsParallel(v1, v2);

      if (isParallel) {
        currentSegment.setEndPoint(tmpSegment.endPoint());
      } else {
        result.push(currentSegment);
        currentSegment = tmpSegment.clone();
      }
    }
    if (currentSegment !== null) {
      result.push(currentSegment);
    }

    // 检查最后一条边和第一条边是否平行，
    const firstWall = result[0];
    const lastWall = result[result.length - 1];
    const v1 = firstWall.toVector();
    const v2 = lastWall.toVector();
    const isParallel = MathUtil.AreVectorsParallel(v1, v2);
    if (isParallel) {
      result.pop();
      firstWall.setStartPoint(lastWall.startPoint());
    }
    return result;
  }


  isInitWithClockWise() {
    return this.isInitWithCloseWise_;
  }

  /**
   * 判断传入实体是否与房间相关实体有重叠
   * @param entity
   */
  entityOverLap(entity: any): boolean {
    const result = false;
    if (entity instanceof Opening) {
      const tmpArray = Array.from(this.attachedOpenings_);
      // 遍历Opening，查询overlap
      for (const openinfo of tmpArray) {
        if (MathUtil.checkBBoxOverLap(entity.getBoundRect(), openinfo[0].getBoundRect())) {
          return true;
        }
      }
    } else if (entity instanceof HouseLayoutDragEntity) {
      const tmpArray = Array.from(this.flags_);
      for (const flaginfo of tmpArray) {
        if (MathUtil.checkBBoxOverLap(entity.getBoundRect(), flaginfo.getBoundRect())) {
          return true;
        }
      }
    }

    return result;
  }

  /**
   * @function 添加额外的销毁处理，使得其包含的文字信息也可以一并清理掉
   */
  destoryPath() {
    super.destoryPath();
    this.texts_.forEach(element => {
      element.remove();
    });
    this.texts_.clear();
  }

  getOpenings() {
    const tmpopenings = Array.from(this.attachedOpenings_);
    const result = new Array<Opening>();
    for (let i = 0; i < tmpopenings.length; i++) {
      result.push(tmpopenings[i]);
    }
    return result;
  }

  getFlags() {
    return Array.from(this.flags_);
  }

  /**
   * 获取跟wall 关联的墙
   */
  getOpeningsByWall(wall: InnerWall): Array<Opening> {
    const openings = new Array<Opening>();
    const attachOpenings = this.attachedOpenings();
    const openingsLength = attachOpenings.length / 2;
    for (let i = 0; i < openingsLength; i++) {
      const opening = attachOpenings[i * 2];
      if (wall.doContainOpening(opening)) {
        openings.push(opening);
      }
    }
    return openings;
  }
}
