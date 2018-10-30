
import { Vector2, Vector3 } from "three";
import { WallEntities } from './entity'
import { Polygon, Segment, GeometryType, Arc, Line } from '../geometry/geometry'
import { WallEntity, ComponentEntity } from './entity'
import * as MathUtil from '../../math/math'


// room entity
export class RoomEntity {


  // the original room tag
  private originalRoomTag_: number;
  // new generate uuid
  private uuid_: string;

  // wall entity belong to this room
  private walls_: Array<WallEntity>;

  private components_: Array<ComponentEntity>;

  constructor(wholeWallEntities: WallEntities, originalRoomTag: number, components?: Array<ComponentEntity>) {

    this.uuid_ = 'room_' + MathUtil.uuid();

    this.originalRoomTag_ = originalRoomTag;

    this.walls_ = new Array<WallEntity>();

    const totalWallNumber = wholeWallEntities.walls().length;
    const tmpString1 = originalRoomTag.toString();
    for (let i = 0; i < totalWallNumber; ++i) {
      const currentWallEntity = wholeWallEntities.walls()[i].clone();
      const tmpString2 = currentWallEntity.roomTag().toString();
      const isExist = tmpString2.indexOf(tmpString1);
      if (isExist == -1) {
        continue;
      }

      this.walls_.push(currentWallEntity);

      this.components_ = new Array<ComponentEntity>();
      if (components) {
        const componentLength = components.length;
        for (let i = 0; i < componentLength; ++i) {
          this.components_.push(components[i]);
        }
      }
    }
    this.adjustWallEntities();

  }

  // swap the inner wall and outer wall
  adjustWallEntities() {
    const axisSegments = new Array<Segment>();
    const wallEntityNumber = this.walls_.length;
    for (let i = 0; i < wallEntityNumber; ++i) {
      axisSegments.push(this.walls_[i].axisWall());
    }
    MathUtil.sortSegmentArray(axisSegments);

    // if inner wall is out of the axis segment, swap them
    for (let i = 0; i < wallEntityNumber; ++i) {
      const innerWall =this.walls_[i].innerWall();
      const startPoint = innerWall.startPoint();
      if(!MathUtil.isPointInPolygon(startPoint, axisSegments)) {
        this.walls_[i].swap();
      }
    }
  }
  uuid(): string {
    return this.uuid_;
  }

  originalRoomTag(): number {
    return this.originalRoomTag_;
  }

  walls(): Array<WallEntity> {
    return this.walls_;
  }

  components(): Array<ComponentEntity> {
    return this.components_;
  }
  pushComponent(component: ComponentEntity) {
    this.components_.push(component);
  }

  removeComponent(componentId: number) {
    const componentNumber = this.components_.length;
    for (let i = 0; i < componentNumber; ++i) {
      if (this.components_[i].originalId() === componentId) {
        this.components_.splice(i, 1);
      }
    }
  }

  private getAxisWalls(): Array<Segment> {
    const axisWalls = new Array<Segment>();
    const wallNumber = this.walls_.length;
    for (let i = 0; i < wallNumber; ++i) {
      const currentAxisWall = this.walls_[i].axisWall();
      axisWalls.push(currentAxisWall.clone());
    }
    MathUtil.sortSegmentArray(axisWalls);
    return axisWalls;
  }

  private getInnerWalls(): Map<string, Segment> {
    const innerWallMaps = new Map<string, Segment>();
    const axisWalls = this.getAxisWalls();


    const axisWallNumber = axisWalls.length;
    for (let i = 0; i < axisWallNumber; ++i) {

      // replace one arc with two lines, else there exist failure in isPointInPolygon
      if (axisWalls[i].type() == GeometryType.GEO_ARC) {
        const startPoint = axisWalls[i].startPoint();
        const endPoint = axisWalls[i].endPoint();
        const middlePoint = (<Arc>axisWalls[i]).arcThroughPoint();
        const line1 = new Line(startPoint, middlePoint);
        const line2 = new Line(middlePoint, endPoint);
        axisWalls.splice(i, 1)
        axisWalls.splice(i, 0, line2);
        axisWalls.splice(i, 0, line1);

      }
    }
    const wallNumber = this.walls_.length;
    for (let i = 0; i < wallNumber; ++i) {
      const currentWallEntity = this.walls_[i];
      const testPoint = currentWallEntity.innerWall().startPoint();
      if (MathUtil.isPointInPolygon(testPoint, axisWalls)) {
        innerWallMaps.set(currentWallEntity.uuid(), currentWallEntity.innerWall());
      } else {
        innerWallMaps.set(currentWallEntity.uuid(), currentWallEntity.outerWall());
      }
    }

    //////////////////////////////////////////


    return innerWallMaps;
  }
  public dumpRoomInfo(): any {
    let roomInfo = {};

    roomInfo['fId'] = this.originalRoomTag_.toString();

    let innerWallInfos = new Array();

    const innerWallMaps = this.getInnerWalls();
    innerWallMaps.forEach((value: Segment, key: string) => {
      let innerWallInfo = {};
      innerWallInfo['wId'] = key;

      const innerWall = value;
      let wallData = {};
      let innerWallData = {};
      if (innerWall.type() == GeometryType.GEO_LINE) {
        innerWallData['type'] = 'line';

      } else {
        innerWallData['type'] = 'arc';
        let centerPointPosition = new Array<number>();
        centerPointPosition.push((<Arc>innerWall).center().x(), (<Arc>innerWall).center().y());
        innerWallData['center'] = centerPointPosition;
        innerWallData['clockwise'] = (<Arc>innerWall).isClockwise();
      }

      let startPointPosition = new Array<number>();
      startPointPosition.push(innerWall.startPoint().x(), innerWall.startPoint().y());
      innerWallData['startPoint'] = startPointPosition;

      let endPointPosition = new Array<number>();
      endPointPosition.push(innerWall.endPoint().x(), innerWall.endPoint().y());
      innerWallData['endPoint'] = endPointPosition;

      innerWallInfo['data'] = innerWallData;
      innerWallInfos.push(innerWallInfo);
    });

    roomInfo['walls'] = innerWallInfos;
    return roomInfo;
  }
}

