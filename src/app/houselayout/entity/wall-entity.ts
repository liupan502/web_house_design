import { InnerWall } from './inner-wall';

import { Vector2, Vector3 } from "three";
import { Point, Segment, Line, Polygon, Arc, GeometryType, Rect } from '../geometry/geometry'
import { CubeHoleEntity } from './entity'
import * as MathUtil from '../../math/math'
// a wall entity which includes the inner wall, outer wall and axis wall
// all vector 3 member viariable should resotred with coordinate of three.js!! (Y axis up, X to right and Z point to yourself)
export class WallEntity {

  private innerWall_: Segment;
  private outerWall_: Segment;
  private axisWall_: Segment;
  private isNorwall_: boolean;
  private uuid_: string;
  private wallNormal_: Vector3;
  private roomTag_: Array<number>;
  private holes_: Array<CubeHoleEntity>;
  private abnormalPolygon_: Polygon;
  private height_: number;

  //
  protected InnerWallEntity_: InnerWall;

  constructor(innerWall: Segment, outerWall: Segment, height: number, roomTag: Array<number>) {
    const axisStartPoint = new Point((innerWall.startPoint().x() + outerWall.startPoint().x()) / 2,
      (innerWall.startPoint().y() + outerWall.startPoint().y()) / 2);

    const axisEndPoint = new Point((innerWall.endPoint().x() + outerWall.endPoint().x()) / 2,
      (innerWall.endPoint().y() + outerWall.endPoint().y()) / 2);
    if (innerWall.type() == GeometryType.GEO_ARC) {
      const Center = (<Arc>innerWall).center();
      const clockWise = (<Arc>innerWall).isClockwise();

      this.innerWall_ = new Arc(innerWall.startPoint(), innerWall.endPoint(), Center, clockWise);
      this.outerWall_ = new Arc(outerWall.startPoint(), outerWall.endPoint(), Center, clockWise);
      this.axisWall_ = new Arc(axisStartPoint, axisEndPoint, Center, clockWise);
    } else {
      this.innerWall_ = new Line(innerWall.startPoint(), innerWall.endPoint());
      this.outerWall_ = new Line(outerWall.startPoint(), outerWall.endPoint());
      this.axisWall_ = new Line(axisStartPoint, axisEndPoint);
    }

    this.height_ = height;

    this.isNorwall_ = true;
    this.roomTag_ = new Array();

    for (let i = 0; i < roomTag.length; ++i) {
      this.roomTag_.push(roomTag[i]);
    }

    this.uuid_ = 'wallEntiy_' + MathUtil.uuid();

    // wallNormal is used to show/hide in EasyPreview
    const startPoint = new Vector2(innerWall.startPoint().x(), innerWall.startPoint().y());
    const endPoint = new Vector2(innerWall.endPoint().x(), innerWall.endPoint().y());

    const direction = MathUtil.CreateVecBySubtraction(endPoint, startPoint);
    direction.normalize();
    let perpenDir = new Vector2(-direction.y, direction.x);

    // left-hand coordinate
    if (MathUtil.CrossProduction(perpenDir, direction) > 0) {
      perpenDir = MathUtil.CreateVecByMultiply(perpenDir, -1);
    }
    this.wallNormal_ = new Vector3(perpenDir.x, 0, perpenDir.y);



    ///////////////////////
    // holes
    this.holes_ = new Array<CubeHoleEntity>();
  }

  clone() {
    let cloneWallEntity =  new WallEntity(this.innerWall_, this.outerWall_, this.height_, this.roomTag_);
    cloneWallEntity.setWallEntity(this);
    return cloneWallEntity;
  }
  //////////////////////
  innerWall(): Segment {
    return this.innerWall_;
  }

  outerWall(): Segment {
    return this.outerWall_;
  }

  // swap inner and outer
  swap() {
    const tempWall = this.outerWall_.clone();
    this.outerWall_ = this.innerWall_.clone();
    this.innerWall_ = tempWall;
  }

  axisWall(): Segment {
    return this.axisWall_;
  }

  setAxisWall(axisWall: Segment) {
    this.axisWall_ = axisWall;
  }

  isNorwall(): boolean {
    return this.isNorwall_;
  }

  uuid(): string {
    return this.uuid_;
  }

  height(): number {
    return this.height_;
  }

  setHeight(height: number) {
    this.height_ = height;
  }

  setWallNormal(newWallNormal: Vector3) {
    this.wallNormal_.set(newWallNormal.x, newWallNormal.y, newWallNormal.z);
  }

  wallNormal(): Vector3 {
    return this.wallNormal_;
  }

  roomTag(): Array<number> {
    return this.roomTag_;
  }

  holes(): Array<CubeHoleEntity> {
    return this.holes_;
  }

  abnormalPolygon(): Polygon {
    return this.abnormalPolygon_;
  }

  // push hole property
  pushHole(hole: CubeHoleEntity) {
    this.holes_.push(hole);
  }

  getWallRect(): Polygon{
    const wallRectSegments = new Array<Segment>();
    wallRectSegments.push(this.outerWall_);

    let segment = new Line(this.outerWall_.endPoint(), this.axisWall_.endPoint());
    wallRectSegments.push(segment);

    segment = new Line(this.axisWall_.endPoint(), this.innerWall_.endPoint());
    wallRectSegments.push(segment);

    segment = new Line(this.innerWall_.endPoint(), this.innerWall_.startPoint());
    wallRectSegments.push(segment);

    segment = new Line(this.innerWall_.startPoint(), this.axisWall_.startPoint());
    wallRectSegments.push(segment);

    segment = new Line(this.axisWall_.startPoint(), this.outerWall_.startPoint());
    wallRectSegments.push(segment);

    const polygon = new Polygon(wallRectSegments);
    return polygon;

  }

  // actually this is remove opening along with the hole
  removeHole(openingId: number) {

    const holeNumber = this.holes_.length;
    for (let i = 0; i < holeNumber; ++i) {
      if (this.holes_[i].attachedOpeningEntity() && this.holes_[i].attachedOpeningEntity().originalId() === openingId) {
        this.holes_.splice(i, 1);
      }
    }
  }
  setAbnormalPolygon(abnormalPolygon: Polygon) {
    this.abnormalPolygon_ = abnormalPolygon.clone();
    this.isNorwall_ = false;
  }

  setWallEntity(otherWallEntity: WallEntity): void {
    this.innerWall_ = otherWallEntity.innerWall_.clone();
    this.outerWall_ = otherWallEntity.outerWall_.clone();
    this.axisWall_ = otherWallEntity.axisWall_.clone();
    this.isNorwall_ = otherWallEntity.isNorwall_;

    this.height_ = otherWallEntity.height_;

    this.uuid_ = otherWallEntity.uuid_;
    this.wallNormal_ = otherWallEntity.wallNormal_.clone();

    this.roomTag_.length = 0;
    const otherRoomTagLength = otherWallEntity.roomTag_.length;
    for (let i = 0; i < otherRoomTagLength; ++i) {
      this.roomTag_.push(otherWallEntity.roomTag_[i]);
    }

    this.holes_.length = 0;
    const openingLength = otherWallEntity.holes_.length;
    for (let i = 0; i < openingLength; ++i) {
      this.holes_.push(otherWallEntity.holes_[i]);
    }

    if (otherWallEntity.abnormalPolygon_ && otherWallEntity.abnormalPolygon_.segments().length > 0) {
      this.abnormalPolygon_ = otherWallEntity.abnormalPolygon_.clone();
    }


  }

  setRoomTag(roomTag: Array<number>) {
    this.roomTag_.length = 0;
    for (let i = 0; i < roomTag.length; ++i) {
      this.roomTag_.push(roomTag[i]);
    }
  }

  containHoleRect(holeRect: Rect): boolean {
    let isContain = false;
    const holeBounderPoint = holeRect.getRectBounderPoint();

    const bounderLenth = holeBounderPoint.length;
    if (bounderLenth != 4) {
      return false;
    }

    if (this.innerWall_.contains(holeBounderPoint[0]) && this.innerWall_.contains(holeBounderPoint[3])) {
      if (this.outerWall_.contains(holeBounderPoint[1]) && this.outerWall_.contains(holeBounderPoint[2])) {
        isContain = true;
      }
    } else if (this.innerWall_.contains(holeBounderPoint[1]) && this.innerWall_.contains(holeBounderPoint[2])) {
      if (this.outerWall_.contains(holeBounderPoint[0]) && this.outerWall_.contains(holeBounderPoint[3])) {
        isContain = true;
      }
    }
    return isContain;
  }
}

