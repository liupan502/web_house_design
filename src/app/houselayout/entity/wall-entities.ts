
import { WallEntity, OpeningType, CubeHoleEntity, OpeningEntity} from './entity'

import { Point, Segment, Line, LineType, Polygon, Arc, GeometryType, Rect } from '../geometry/geometry'
import * as MathUtil from '../../math/math'
import { Vector2 as Vec2, Vector3 } from 'three'

export class WallEntities {
  private walls_: Array<WallEntity>;

  // wall entities index and room maps
  // notice that because one wall entity could belong to two rooms, so there exist duplicate index in this varaible.
  private wallEntitiesIndexOfRoom_: Map<number, Array<number>>;

  // same logic as above while store the uuid of the wall entities
  private wallEntitiesUuidOfRooms_: Map<number, Array<string>>;
  // merge the straight wall entity with the same direction and join the end point of axis line

  clone() {
    const wallNumber = this.walls_.length;
    for(let i = 0; i < wallNumber; ++i) {

    }
  }
  walls(): Array<WallEntity> {
    return this.walls_;
  }

  wallEntitiesIndexOfRoom(): Map<number, Array<number>> {
    return this.wallEntitiesIndexOfRoom_;
  }

  wallEntitiesUuidOfRooms(): Map<number, Array<string>> {
    return this.wallEntitiesUuidOfRooms_;
  }
  getWallEntitiesIndexByRoomTag(roomTag: number): Array<number> {
    return this.wallEntitiesIndexOfRoom_.get(roomTag);
  }

  getWallEntitiesUuidByRoomTag(roomTag: number): Array<string> {
    return this.wallEntitiesUuidOfRooms_.get(roomTag);
  }
  /////////////////////////////////////////////
  // merge the straight wall entity with the same direction and join the end point of axis line
  private MergeWallEntity() {
    let wallEntityLength = this.walls_.length;
    for (let i = 0; i < wallEntityLength; ++i) {
      const currentWall = this.walls_[i];

      const currentAxisWall = currentWall.axisWall();
      const currentInnerWall = currentWall.innerWall();
      const currentOuterWall = currentWall.outerWall();
      // only handle line case
      if (currentAxisWall.type() !== GeometryType.GEO_LINE) {
        continue;
      }
      const currentWallDirection = currentWall.axisWall().toVector().normalize();
      for (let j = i + 1; j < wallEntityLength; ++j) {
        const nextWall = this.walls_[j];
        const nextAxisWall = nextWall.axisWall();
        const nextInnerWall = nextWall.innerWall();

        const nextOuterWall = nextWall.outerWall();
        if (nextAxisWall.type() !== GeometryType.GEO_LINE) {
          continue;
        }

        const nextWallDirection = nextWall.axisWall().toVector().normalize();

        const mergedAxisWall = MathUtil.mergeStraightLine(<Line>currentAxisWall, <Line>nextAxisWall);
        if (mergedAxisWall) {
          currentAxisWall.setStartPoint(mergedAxisWall.startPoint());
          currentAxisWall.setEndPoint(mergedAxisWall.endPoint());
          ///////////////////////////////
          // merge inner wall and outer wall
          // notice that inner wall could be merged with outer wall and outer wall could be merged with inner wall
          const currentInnerWallCopy = currentInnerWall.clone();
          (<Line>currentInnerWallCopy).setLineType(LineType.LINE);
          const currentOuterWallCopy = currentOuterWall.clone();
          (<Line>currentOuterWallCopy).setLineType(LineType.LINE);
          const innerToInner = (<Line>currentInnerWallCopy).contains(nextInnerWall.startPoint());
          let mergedInnerWall: Line;
          let mergedOuterWall: Line;
          if (innerToInner) {
            // inner to inner
            mergedInnerWall = MathUtil.mergeStraightLine(<Line>currentInnerWallCopy, <Line>nextInnerWall);
            mergedOuterWall = MathUtil.mergeStraightLine(<Line>currentOuterWallCopy, <Line>nextOuterWall);
          } else {
            // inner to outer
            mergedInnerWall = MathUtil.mergeStraightLine(<Line>currentInnerWallCopy, <Line>nextOuterWall);
            mergedOuterWall = MathUtil.mergeStraightLine(<Line>currentOuterWallCopy, <Line>nextInnerWall);
          }

          if (!mergedAxisWall || !mergedInnerWall || !mergedOuterWall) {
            continue;
          }
          // change the direction so that axis wall, inner wall and outer wall have the same direction
          const axisWallDirection = mergedAxisWall.toVector().normalize();
          const innerWallDirection = mergedInnerWall.toVector().normalize();
          const outerWallDirection = mergedOuterWall.toVector().normalize();

          let subVec: boolean;
          subVec = MathUtil.vec2RoundToZero(MathUtil.CreateVecBySubtraction(innerWallDirection, axisWallDirection));
          if (!subVec) {
            mergedInnerWall.swapPoints();
          }

          subVec = MathUtil.vec2RoundToZero(MathUtil.CreateVecBySubtraction(outerWallDirection, axisWallDirection));
          if (!subVec) {
            mergedOuterWall.swapPoints();
          }

          currentInnerWall.setStartPoint(mergedInnerWall.startPoint());
          currentInnerWall.setEndPoint(mergedInnerWall.endPoint());

          currentOuterWall.setStartPoint(mergedOuterWall.startPoint());
          currentOuterWall.setEndPoint(mergedOuterWall.endPoint());

          // merge room tag
          const currentRoomTag = this.walls_[i].roomTag();
          const nextRoomTag = this.walls_[j].roomTag();
          for (let k = 0; k < nextRoomTag.length; ++k) {
            currentRoomTag.push(nextRoomTag[k]);
          }
          this.walls_.splice(j, 1);
          j--;
          wallEntityLength--;
        }
      }
    }
  }

  private lineIntersectLine(line1: Line, line2: Line, intersectedPoint: Vec2): boolean {

    const startPoint1 = (<Line>line1).startPoint();
    const startPoint2 = (<Line>line2).startPoint();

    const endPoint1 = (<Line>line1).endPoint();
    const endPoint2 = (<Line>line2).endPoint();

    const p1 = new Vec2(startPoint1.x(), startPoint1.y());
    const q1 = new Vec2(startPoint2.x(), startPoint2.y());
    const v = line1.toVector();
    const w = line2.toVector();
    const isParallel = MathUtil.AreVectorsParallel(v, w);
    if (isParallel) {
      // parallel case
      if (line1.contains(startPoint2)) {
        intersectedPoint.set(startPoint2.x(), startPoint2.y());
        return true;
      } else if (line1.contains(endPoint2)) {
        intersectedPoint.set(endPoint2.x(), endPoint2.y());
        return true;
      } else {
        // for this case, if overlap we treat them unintersect
        return false;
      }
    } else {
      return MathUtil.lineIntersectLine(p1, v, q1, w, intersectedPoint);
    }

  }

  // handle case1, wall1 intersect with wall2, the intersection point is end point of both wall1 and wall2
  // input argument: two wall entities
  // output arguments: two wall entities that are modification version of both wall1 and wall2
  private handleEndToEndIntersection(wall1: WallEntity, wall2: WallEntity, intersectAxisPoint: Vec2): Array<WallEntity> {
    const allWalls = new Array<WallEntity>();

    let modifiedWall1 = new WallEntity(wall1.innerWall().clone(), wall1.outerWall().clone(), wall1.height(), wall1.roomTag());
    let modifiedWall2 = new WallEntity(wall2.innerWall().clone(), wall2.outerWall().clone(), wall2.height(), wall2.roomTag());
    modifiedWall1.setAxisWall(wall1.axisWall().clone());
    modifiedWall2.setAxisWall(wall2.axisWall().clone());

    const axisWall1 = modifiedWall1.axisWall();
    const innerWall1 = modifiedWall1.innerWall();
    const outerWall1 = modifiedWall1.outerWall();

    const axisWall2 = modifiedWall2.axisWall();
    const innerWall2 = modifiedWall2.innerWall();
    const outerWall2 = modifiedWall2.outerWall();

    const startPoint1 = (<Line>axisWall1).startPoint();
    const endPoint1 = (<Line>axisWall1).endPoint();

    const startPoint2 = (<Line>axisWall2).startPoint();
    const endPoint2 = (<Line>axisWall2).endPoint();

    let dist1, dist2;

    // judge if corner is inner wall or outer wall
    // there exist 4 case:
    // inner and inner in the corner
    // inner and outer in the corner
    // outer and inner in the corner
    // outer and outer in the corner
    let cornerWall1: Segment;
    let farawayWall1: Segment;
    let cornerWall2: Segment;
    let farawayWall2: Segment;

    // if corner is start point of wall to start point of wall2
    // if 0, start point of wall1 and start point of wall2 are far away from the corner
    // if 1, start point of wall1 is far away from the corner and start point of wall2 is near the corner
    // if 2, start point of wall1 is near the corner and start point of wall2 is far away from the corner
    // if 3, start point of both wall1 and wall2 are near the corner
    let startPosition;

    let point1: Point;
    let point2: Point;
    let intersectedPoint1 = new Vec2(0.0, 0.0);
    let intersectedPoint2 = new Vec2(0.0, 0.0);

    const direction1 = axisWall1.toVector().normalize();
    const direction2 = axisWall2.toVector().normalize();
    const isParallel = MathUtil.AreVectorsParallel(direction1, direction2);
    if (isParallel) {
      // do nothing
      allWalls.push(modifiedWall1);
      allWalls.push(modifiedWall2);
      return allWalls;
    }


    this.lineIntersectLine(<Line>axisWall1, <Line>innerWall2, intersectedPoint1);
    this.lineIntersectLine(<Line>axisWall2, <Line>innerWall1, intersectedPoint2);

    point1 = new Point(intersectedPoint1.x, intersectedPoint1.y);
    point2 = new Point(intersectedPoint2.x, intersectedPoint2.y);
    const axisPoint = new Point(intersectAxisPoint.x, intersectAxisPoint.y);
    if ((<Line>axisWall1).contains(point1) && (<Line>axisWall2).contains(point2)) {
      cornerWall1 = innerWall1;
      farawayWall1 = outerWall1;
      cornerWall2 = innerWall2;
      farawayWall2 = outerWall2;
    } else if (!(<Line>axisWall1).contains(point1) && (<Line>axisWall2).contains(point2)) {
      cornerWall1 = innerWall1;
      farawayWall1 = outerWall1;
      cornerWall2 = outerWall2;
      farawayWall2 = innerWall2;
    } else if ((<Line>axisWall1).contains(point1) && !(<Line>axisWall2).contains(point2)) {
      cornerWall1 = outerWall1;
      farawayWall1 = innerWall1;
      cornerWall2 = innerWall2;
      farawayWall2 = outerWall2;
    } else {
      cornerWall1 = outerWall1;
      farawayWall1 = innerWall1;
      cornerWall2 = outerWall2;
      farawayWall2 = innerWall2;
    }

    dist1 = (<Line>axisWall1).getDistanceToStartPoint(axisPoint);
    dist2 = (<Line>axisWall2).getDistanceToStartPoint(axisPoint);

    if (!MathUtil.isZero(dist1) && !MathUtil.isZero(dist2)) {
      startPosition = 0;
    } else if (!MathUtil.isZero(dist1) && MathUtil.isZero(dist2)) {
      startPosition = 1;
    } else if (MathUtil.isZero(dist1) && !MathUtil.isZero(dist2)) {
      startPosition = 2;
    } else {
      startPosition = 3;
    }

    // only get two intersection that is corner with corner, farway with faray.
    this.lineIntersectLine(<Line>cornerWall1, <Line>cornerWall2, intersectedPoint1);
    this.lineIntersectLine(<Line>farawayWall1, <Line>farawayWall2, intersectedPoint2);


    point2 = new Point(intersectedPoint2.x, intersectedPoint2.y);
    const isContainInWall1 = (<Line>farawayWall1).contains(point2);
    const isContainInWall2 = (<Line>farawayWall2).contains(point2);

    point1 = new Point(intersectedPoint1.x, intersectedPoint1.y);
    point2 = new Point(intersectedPoint2.x, intersectedPoint2.y);

    if (startPosition == 0) {
      cornerWall1.setEndPoint(point1);
      cornerWall2.setEndPoint(point1);

      if (isContainInWall1) {
        farawayWall1.setEndPoint(point2);
      }
      if (isContainInWall2) {
        farawayWall2.setEndPoint(point2);
      }


    } else if (startPosition == 1) {
      cornerWall1.setEndPoint(point1);
      cornerWall2.setStartPoint(point1);
      if (isContainInWall1) {
        farawayWall1.setEndPoint(point2);
      }
      if (isContainInWall2) {
        farawayWall2.setStartPoint(point2);
      }
    } else if (startPosition == 2) {
      cornerWall1.setStartPoint(point1);
      cornerWall2.setEndPoint(point1);
      if (isContainInWall1) {
        farawayWall1.setStartPoint(point2);
      }
      if (isContainInWall2) {
        farawayWall2.setEndPoint(point2);
      }
    } else {
      cornerWall1.setStartPoint(point1);
      cornerWall2.setStartPoint(point1);
      if (isContainInWall1) {
        farawayWall1.setStartPoint(point2);
      }
      if (isContainInWall2) {
        farawayWall2.setStartPoint(point2);
      }
    }

    allWalls.push(modifiedWall1);
    allWalls.push(modifiedWall2);

    return allWalls;
  }

  // skip index is use to skip the wall that do not need to split room tag
  // For T join such as A Join B, A do not need to be splitted.
  // For cross shape join, both A and B do need to be splitted.
  splitRoomTags(allWalls: Array<WallEntity>, skipIndex: number) {
    if (allWalls.length < 3) {
      return;
    }

    const wall1 = allWalls[0].axisWall();
    const wall2 = allWalls[2].axisWall();
    // split room tags
    const wallLength = allWalls.length;
    for (let k = skipIndex; k < wallLength; ++k) {
      const originRoomTags = allWalls[k].roomTag();
      let roomTagsLength = originRoomTags.length;

      const currentAxisWall = allWalls[k].axisWall();
      for (let i = 0; i < roomTagsLength; ++i) {

        const tmpString1 = originRoomTags[i].toString();

        let belongToThisRoom = false;
        for (let j = 0; j < this.walls_.length; ++j) {
          const tmpString2 = this.walls_[j].roomTag().toString();
          const isExist = tmpString2.indexOf(tmpString1);
          if (isExist == -1) {
            continue;
          }

          const otherAxisWall = this.walls_[j].axisWall();
          if (otherAxisWall.contains(wall1.startPoint()) && otherAxisWall.contains(wall1.endPoint())) {
            continue;
          }

          if (otherAxisWall.contains(wall2.startPoint()) && otherAxisWall.contains(wall2.endPoint())) {
            continue;
          }

          const isConnect = MathUtil.isSegmentIntersectSegment(currentAxisWall, otherAxisWall);
          if (isConnect) {
            belongToThisRoom = true;
            break;
          }
        }

        if (belongToThisRoom == false) {
          originRoomTags.splice(i, 1);
          roomTagsLength--;
          i--;
        }
      }
    }
  }
  // handle case2, wall1 intersect with wall2, the intersection point is end point of wall1 and middle point of wall2
  // input argument: two wall entities
  // output arguments: three wall entities that the first one is modification version of wall1
  // and the last two are the splitted wall entities.
  private handleEndToMiddleIntersection(wall1: WallEntity, wall2: WallEntity, intersectAxisPoint: Vec2): Array<WallEntity> {

    const axisWall1 = wall1.axisWall();
    const innerWall1 = wall1.innerWall();
    const outerWall1 = wall1.outerWall();

    const axisWall2 = wall2.axisWall();
    const innerWall2 = wall2.innerWall();
    const outerWall2 = wall2.outerWall();

    const startPoint1 = (<Line>axisWall1).startPoint();
    const endPoint1 = (<Line>axisWall1).endPoint();

    const startPoint2 = (<Line>axisWall2).startPoint();
    const endPoint2 = (<Line>axisWall2).endPoint();


    const allWalls = new Array<WallEntity>();
    let modifiedWall1 = new WallEntity(innerWall1.clone(), outerWall1.clone(), wall1.height(), wall1.roomTag());
    let splitWall1 = new WallEntity(innerWall2.clone(), outerWall2.clone(), wall2.height(), wall2.roomTag()); // split wall1 is from start to middle
    let splitWall2 = new WallEntity(innerWall2.clone(), outerWall2.clone(), wall2.height(), wall2.roomTag()); // split wall2 is from middle to end

    modifiedWall1.setAxisWall(wall1.axisWall().clone());
    splitWall1.setAxisWall(wall2.axisWall().clone());
    splitWall2.setAxisWall(wall2.axisWall().clone());
    let targetPoint;
    let farStartOfWall1;
    let targetWall: Segment;
    let intersectWithInner;

    //judge which wall is outer wall
    const isIntersect = MathUtil.isSegmentIntersectSegment(axisWall1, innerWall2);
    if (isIntersect) {
      targetWall = outerWall2.clone(); // use out wall as target
      intersectWithInner = true;
    } else {
      targetWall = innerWall2.clone(); // use inner wall as target
      intersectWithInner = false;
    }

    const axisPoint = new Point(intersectAxisPoint.x, intersectAxisPoint.y);
    const dist = (<Line>axisWall1).getDistanceToStartPoint(axisPoint);
    if (!MathUtil.isZero(dist)) {
      farStartOfWall1 = true;
    } else {
      farStartOfWall1 = false;
    }

    let intersectedPoint1 = new Vec2(0.0, 0.0);
    let intersectedPoint2 = new Vec2(0.0, 0.0);

    if (intersectWithInner) {
      // inlineSegmentIntersectLineSegmentr wall
      this.lineIntersectLine(<Line>innerWall1, <Line>innerWall2, intersectedPoint1);
      this.lineIntersectLine(<Line>outerWall1, <Line>innerWall2, intersectedPoint2);
    } else {
      // inlineSegmentIntersectLineSegmentr wall
      this.lineIntersectLine(<Line>innerWall1, <Line>outerWall2, intersectedPoint1);
      this.lineIntersectLine(<Line>outerWall1, <Line>outerWall2, intersectedPoint2);
    }
    const point1 = new Point(intersectedPoint1.x, intersectedPoint1.y);
    const point2 = new Point(intersectedPoint2.x, intersectedPoint2.y);

    // set wall1
    if (farStartOfWall1) {
      modifiedWall1.innerWall().setEndPoint(point1);
      modifiedWall1.outerWall().setEndPoint(point2);
    } else {
      modifiedWall1.innerWall().setStartPoint(point1);
      modifiedWall1.outerWall().setStartPoint(point2);
    }

    // split wall2
    const targetWallStartPoint = new Vec2(targetWall.startPoint().x(), targetWall.startPoint().y());
    const targetDirection = targetWall.toVector().normalize();
    let perpenDirection = new Vec2(-1 * targetDirection.y, targetDirection.x);
    const perpenStartPoint = intersectAxisPoint.clone();
    let intersectedPoint = new Vec2(0.0, 0.0);
    MathUtil.lineIntersectLine(perpenStartPoint, perpenDirection, targetWallStartPoint, targetDirection, intersectedPoint);

    // set axis wall
    splitWall1.axisWall().setEndPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));
    splitWall2.axisWall().setStartPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));

    // set outer wall
    if (intersectWithInner) {
      splitWall1.outerWall().setEndPoint(new Point(intersectedPoint.x, intersectedPoint.y));
      splitWall2.outerWall().setStartPoint(new Point(intersectedPoint.x, intersectedPoint.y));
      targetWall = innerWall2;
    } else {
      splitWall1.innerWall().setEndPoint(new Point(intersectedPoint.x, intersectedPoint.y));
      splitWall2.innerWall().setStartPoint(new Point(intersectedPoint.x, intersectedPoint.y));
      targetWall = outerWall2;
    }

    // sort start point, point1, point2 and end point
    const dist1 = targetWall.getDistanceToStartPoint(point1);
    const dist2 = targetWall.getDistanceToStartPoint(point2);
    let firstPoint: Point, secondPoint: Point;
    if (dist1 < dist2) {
      firstPoint = point1.clone();
      secondPoint = point2.clone();
    } else {
      firstPoint = point2.clone();
      secondPoint = point1.clone();
    }

    // set inner wall
    if (intersectWithInner) {
      splitWall1.innerWall().setEndPoint(firstPoint);
      splitWall2.innerWall().setStartPoint(secondPoint);
    } else {
      splitWall1.outerWall().setEndPoint(firstPoint);
      splitWall2.outerWall().setStartPoint(secondPoint);
    }


    allWalls.push(modifiedWall1);
    allWalls.push(splitWall1);
    allWalls.push(splitWall2);


    this.splitRoomTags(allWalls, 1);
    return allWalls;
  }

  // handle case3, wall1 intersect with wall2, the intersection point is middle point of wall1 and middle point of wall2
  // input argument: two wall entities
  // output arguments: four wall entities that the first two splitted walls of wall1
  // and the last two are the splitted wall entities.
  private handleMiddleToMiddleIntersection(wall1: WallEntity, wall2: WallEntity, intersectAxisPoint: Vec2): Array<WallEntity> {
    const axisWall1 = wall1.axisWall();
    const innerWall1 = wall1.innerWall();
    const outerWall1 = wall1.outerWall();

    const axisWall2 = wall2.axisWall();
    const innerWall2 = wall2.innerWall();
    const outerWall2 = wall2.outerWall();

    const startPoint1 = (<Line>axisWall1).startPoint();
    const endPoint1 = (<Line>axisWall1).endPoint();

    const startPoint2 = (<Line>axisWall2).startPoint();
    const endPoint2 = (<Line>axisWall2).endPoint();


    const allWalls = new Array<WallEntity>();
    let splitWall1 = new WallEntity(innerWall1.clone(), outerWall1.clone(), wall1.height(), wall1.roomTag()); // split wall1 is from start to middle of wall1
    let splitWall2 = new WallEntity(innerWall1.clone(), outerWall1.clone(), wall1.height(), wall1.roomTag()); // split wall2 is from middle to end of wall1

    let splitWall3 = new WallEntity(innerWall2.clone(), outerWall2.clone(), wall2.height(), wall2.roomTag()); // split wall3 is from start to middle of wall2
    let splitWall4 = new WallEntity(innerWall2.clone(), outerWall2.clone(), wall2.height(), wall2.roomTag()); // split wall4 is from middle to end of wall2

    splitWall1.setAxisWall(wall1.axisWall().clone());
    splitWall2.setAxisWall(wall1.axisWall().clone());
    splitWall3.setAxisWall(wall2.axisWall().clone());
    splitWall4.setAxisWall(wall2.axisWall().clone());

    let dist1, dist2;
    let targetWall: Segment;
    let UseInner;   // if the inner wall of wall2 is near to start point of wall1

    let interPoint1 = new Point(0, 0);
    let interPoint2 = new Point(0, 0);
    const startToInnerDist = MathUtil.getDistanceFromPointToLine(<Line>innerWall2, startPoint1, interPoint1);
    const startToOuterDist = MathUtil.getDistanceFromPointToLine(<Line>outerWall2, startPoint1, interPoint2);
    if (startToInnerDist < startToOuterDist) {
      targetWall = innerWall2;
      UseInner = true; // inner wall of wall2 is near to start point of wall1
    } else {
      targetWall = outerWall2;
      UseInner = false; // outer wall of wall2 is near to start point of wall1
    }

    let intersectedPoint1 = new Vec2(0.0, 0.0);
    let intersectedPoint2 = new Vec2(0.0, 0.0);

    let intersectedPoint3 = new Vec2(0.0, 0.0);
    let intersectedPoint4 = new Vec2(0.0, 0.0);

    if (UseInner) {
      this.lineIntersectLine(<Line>innerWall1, <Line>innerWall2, intersectedPoint1);
      this.lineIntersectLine(<Line>outerWall1, <Line>innerWall2, intersectedPoint2);
      this.lineIntersectLine(<Line>innerWall1, <Line>outerWall2, intersectedPoint3);
      this.lineIntersectLine(<Line>outerWall1, <Line>outerWall2, intersectedPoint4);


    } else {
      this.lineIntersectLine(<Line>innerWall1, <Line>outerWall2, intersectedPoint1);
      this.lineIntersectLine(<Line>outerWall1, <Line>outerWall2, intersectedPoint2);
      this.lineIntersectLine(<Line>innerWall1, <Line>innerWall2, intersectedPoint3);
      this.lineIntersectLine(<Line>outerWall1, <Line>innerWall2, intersectedPoint4);

    }
    const point1 = new Point(intersectedPoint1.x, intersectedPoint1.y);
    const point2 = new Point(intersectedPoint2.x, intersectedPoint2.y);
    const point3 = new Point(intersectedPoint3.x, intersectedPoint3.y);
    const point4 = new Point(intersectedPoint4.x, intersectedPoint4.y);

    // split wall1 to two walls
    splitWall1.axisWall().setEndPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));
    splitWall1.innerWall().setEndPoint(point1);
    splitWall1.outerWall().setEndPoint(point2);

    splitWall2.axisWall().setStartPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));
    splitWall2.innerWall().setStartPoint(point3);
    splitWall2.outerWall().setStartPoint(point4);

    //////////////////////////////////////
    // split wall2 to two walls
    // sort start point, point1, point2 and end point
    dist1 = targetWall.getDistanceToStartPoint(point1);
    dist2 = targetWall.getDistanceToStartPoint(point2);
    let firstPoint1: Point, secondPoint1: Point, firstPoint2: Point, secondPoint2: Point;
    if (dist1 < dist2) {
      firstPoint1 = point1.clone();
      secondPoint1 = point2.clone();
      firstPoint2 = point3.clone();
      secondPoint2 = point4.clone();
    } else {
      firstPoint1 = point2.clone();
      secondPoint1 = point1.clone();
      firstPoint2 = point4.clone();
      secondPoint2 = point3.clone();
    }

    splitWall3.axisWall().setEndPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));
    splitWall4.axisWall().setStartPoint(new Point(intersectAxisPoint.x, intersectAxisPoint.y));
    if (UseInner) {
      splitWall3.innerWall().setEndPoint(firstPoint1);
      splitWall3.outerWall().setEndPoint(firstPoint2);


      splitWall4.innerWall().setStartPoint(secondPoint1);
      splitWall4.outerWall().setStartPoint(secondPoint2);
    } else {
      splitWall3.outerWall().setEndPoint(firstPoint1);
      splitWall3.innerWall().setEndPoint(firstPoint2);


      splitWall4.outerWall().setStartPoint(secondPoint1);
      splitWall4.innerWall().setStartPoint(secondPoint2);
    }

    ////////////////////////////////////////
    allWalls.push(splitWall1);
    allWalls.push(splitWall2);
    allWalls.push(splitWall3);
    allWalls.push(splitWall4);

    this.splitRoomTags(allWalls, 0);
    return allWalls;
  }

  // handle case: more than two walls intersect at the same point.
  // input argument: all wall entities
  // output arguments: all modified wall entities
  private handleYShapeIntersection(yShapeWalls: Array<WallEntity>, intersectAxisPoint: Vec2): Array<WallEntity> {

    const allWalls = new Array<WallEntity>();
    const wallLenth = yShapeWalls.length;
    for (let i = 0; i < wallLenth; ++i) {
      let modifiedWall = new WallEntity(yShapeWalls[i].innerWall().clone(), yShapeWalls[i].outerWall().clone(), yShapeWalls[i].height(), yShapeWalls[i].roomTag());
      allWalls.push(modifiedWall);
    }

    const allSideWalls = new Array<Segment>();
    for (let i = 0; i < wallLenth; ++i) {
      allSideWalls.push(allWalls[i].innerWall());
      allSideWalls.push(allWalls[i].outerWall());
    }

    const allSideWallsLength = allSideWalls.length;
    let targetWall: Segment;
    for (let i = 0; i < allSideWallsLength; ++i) {
      for (let j = 0; j < allSideWallsLength; ++j) {
        let intersectedPoint = new Vec2(0.0, 0.0);
        const isIntersect = this.lineIntersectLine(<Line>allSideWalls[i], <Line>allSideWalls[j], intersectedPoint);
        const point = new Point(intersectedPoint.x, intersectedPoint.y);
        if (isIntersect && (<Line>allSideWalls[i]).contains(point) && (<Line>allSideWalls[j]).contains(point)) {
          let dist1, dist2;
          let startPoint, endPoint;
          let value;
          let residence;
          let otherWallIndex;
          let interPoint1 = new Point(0, 0);
          let interPoint2 = new Point(0, 0);
          let startDist, endDist;
          //set i
          value = Math.floor(j / 2);
          residence = 1;
          if ((j - 2 * value) == 1) {
            residence = 0;
          }
          otherWallIndex = value * 2 + residence;
          startPoint = allSideWalls[i].startPoint();
          endPoint = allSideWalls[i].endPoint();

          startDist = MathUtil.getDistanceFromPointToLine(<Line>allSideWalls[otherWallIndex], startPoint, interPoint1);
          endDist = MathUtil.getDistanceFromPointToLine(<Line>allSideWalls[otherWallIndex], endPoint, interPoint2);
          if (startDist < endDist) {
            allSideWalls[i].setStartPoint(point);
          } else {
            allSideWalls[i].setEndPoint(point);
          }
          //////////////////////////
          // set j
          value = Math.floor(i / 2);
          residence = 1;
          if ((i - 2 * value) == 1) {
            residence = 0;
          }
          otherWallIndex = value * 2 + residence;
          startPoint = allSideWalls[j].startPoint();
          endPoint = allSideWalls[j].endPoint();


          startDist = MathUtil.getDistanceFromPointToLine(<Line>allSideWalls[otherWallIndex], startPoint, interPoint1);
          endDist = MathUtil.getDistanceFromPointToLine(<Line>allSideWalls[otherWallIndex], endPoint, interPoint2);
          if (startDist < endDist) {
            allSideWalls[j].setStartPoint(point);
          } else {
            allSideWalls[j].setEndPoint(point);
          }
        }
      }
    }
    return allWalls;
  }
  // judge if current wall is already calculate before, that is to say, all the id alreay exist in intersectWallIndex
  private isExist(wholeArray: Array<number>, currentArray: Array<number>): boolean {
    wholeArray.sort();
    currentArray.sort();
    const currentLength = currentArray.length;
    const wholeLength = wholeArray.length;
    if (currentLength > currentLength) {
      return false;
    }

  }

  // merge intersection point, that is to say,the intersection point allreay exist in array of intersection point array that we already calculated.
  // if current intersection point is same as existing points, return 1.
  // if cuurent intersection point is very near the existing point, return 2.
  // else return 0
  private wallIntersectionExistIngroup(currentIntersectionPoint: Point, allIntersectionPoints: Array<Array<Point>>): Array<number> {
    let existIndex = -1;
    const groupLength = allIntersectionPoints.length;
    for (let i = 0; i < groupLength; ++i) {
      const pointLength = allIntersectionPoints[i].length;
      for (let j = 0; j < pointLength; ++j) {
        const diff = currentIntersectionPoint.subtraction(allIntersectionPoints[i][j]).length();
        if (MathUtil.isZero(diff)) {
          existIndex = i;
          return [1, existIndex];
        } else if (diff < 24) {
          existIndex = i;
          return [2, existIndex];
        }
      }
    }

    existIndex = -1;
    return [0, existIndex];
  }

  // judge if current wall is already calculate before, that is to say, all the id alreay exist in mergedGroupedIndexs
  private wallIndexExistIngroup(currentIndexs: Array<number>, mergedGroupedIndexs: Array<Array<number>>): boolean {

    const groupLength = mergedGroupedIndexs.length;
    if (groupLength < 1) {
      return false;
    }
    // sort the number array and transfer to string, then check if sub string.
    currentIndexs.sort();
    const currentIndexsString = currentIndexs.toString();

    let mergedGroupedIndexsString: Array<string>;
    mergedGroupedIndexsString = new Array();
    for (let i = 0; i < groupLength; ++i) {
      mergedGroupedIndexs[i].sort();
      const tmpString = mergedGroupedIndexs[i].toString();
      mergedGroupedIndexsString.push(tmpString);
    }

    for (let i = 0; i < groupLength; ++i) {
      // if current two indexs already exist in group
      const isExist = mergedGroupedIndexsString[i].indexOf(currentIndexsString);
      if (isExist != -1) {
        // exsit
        return true;
      }
    }
    return false;
  }


  private removeDuplicate(indexs: Array<number>) {
    indexs.sort();
    const length = indexs.length;
    for (let i = 0; i < length - 1; ++i) {
      if (MathUtil.isZero(indexs[i] - indexs[i + 1])) {
        indexs.splice(i, 1);
      }
    }
  }
  // originGroupIndexs:the origin array of the index of wall that has intersection
  // For example: if the array is as this:<<<0,1>>,<<0,2>>, <<1,2>, <1,3>>>
  // this means that wall 0 has intersection with wall 1,wall0 has intersection with wall2.
  // wall 1 has intersection with both wall 2 and wall3, and the intersection point is the same point or
  // very near(NOTICE: same point and very near(less than thickeness of wall) are very different case)
  // group tag will diff the different situation.
  // mergedGroupedNormalWallsTag: generally, all data will be true, if two intersection points will be near, mark relate position of mergedGroupedIndexs as false.

  // mergedGroupedIndexs: similar to originGroupIndexs while merge the walls have same or nearintersection,
  // for example for above case, it is as this: <<0,1>>,<<0,2>>, <<1,2,3>>.
  // intersectionPoints array restore the intersecion of wall i and wall j, correspond index is alreay eixst in originGroupIndexs
  private groupWallEntitiesByIntersection(mergedGroupedIndexs: Array<Array<number>>, mergedGroupedNormalWallsTag: Array<boolean>,
    originGroupIndexs: Array<Array<Array<number>>>, allIntersectionPoints: Array<Array<Point>>) {
    let wallEntityLength = this.walls_.length;
    for (let i = 0; i < wallEntityLength; ++i) {
      let currentWall = this.walls_[i];
      let currentAxisWall = currentWall.axisWall();
      const currentWallDirection = currentWall.axisWall().toVector().normalize();
      for (let j = i + 1; j < wallEntityLength; ++j) {
        const nextWall = this.walls_[j];
        const nextAxisWall = nextWall.axisWall();
        const tmpArray = new Array<number>();
        tmpArray.push(i);
        tmpArray.push(j);
        if (this.wallIndexExistIngroup(tmpArray, mergedGroupedIndexs)) {
          continue;
        }

        const intersectionPoints = MathUtil.segmentIntersectSegment(currentAxisWall, nextAxisWall);
        if (intersectionPoints.length != 1) {
          // CURRENTLY DO NOT handle case that eixst two intersection points for axis
          continue;
        }

        const currentIntersectionPoint = intersectionPoints[0];
        let existIndex = -1;
        const intersects = this.wallIntersectionExistIngroup(currentIntersectionPoint, allIntersectionPoints);
        existIndex = intersects[1];
        const wallIntersectType = intersects[0];
        let currentWallIndexs: Array<number>;
        currentWallIndexs = new Array();
        currentWallIndexs.push(i);
        currentWallIndexs.push(j);
        if (wallIntersectType == 0) {
          // simply add data to the group, and ad tag mark as true.
          let tmpArray: Array<Array<number>>;
          tmpArray = new Array();
          tmpArray.push(currentWallIndexs);
          originGroupIndexs.push(tmpArray);
          mergedGroupedIndexs.push(currentWallIndexs);

          let tmpPoints: Array<Point>;
          tmpPoints = new Array();
          tmpPoints.push(currentIntersectionPoint);
          allIntersectionPoints.push(tmpPoints);
          mergedGroupedNormalWallsTag.push(true);
        } else {
          originGroupIndexs[existIndex].push(currentWallIndexs);
          mergedGroupedIndexs[existIndex] = mergedGroupedIndexs[existIndex].concat(currentWallIndexs);
          this.removeDuplicate(mergedGroupedIndexs[existIndex]);
          allIntersectionPoints[existIndex].push(currentIntersectionPoint);
          if (wallIntersectType == 2) {
            // set to abnormal wall
            mergedGroupedNormalWallsTag[existIndex] = false;
          }
        }

      }
    }
  }

  // when thre exist T shape walls, we split one wall int two, this means that the number of wall increase by one.
  // we need to update the index which is restored in the group index:
  // for the index that is less than the split index, do nothing.
  // for the index that is equal to the split index, use one wall index after splitting(use the wall that contain the intersection point)
  // For the index that is more than the split index, increase the offset.
  private updateIndex(originalSplitIndexs: Array<number>, splittedWallEntities: Array<WallEntity>,
    mergedGroupedIndexs: Array<Array<number>>, originGroupIndexs: Array<Array<Array<number>>>, allIntersectionPoints: Array<Array<Point>>) {
    if (originalSplitIndexs.length != 2 || splittedWallEntities.length > 4 || splittedWallEntities.length < 3) {
      // invalid input
      return;
    }
    let increaseOffset = 0;
    if (splittedWallEntities.length == 4) {
      increaseOffset = 2;
    } else {
      increaseOffset = 1;
    }

    // update indexs with offset
    const groupLength = originGroupIndexs.length;
    if (increaseOffset === 1) {
      let splitIndex = originalSplitIndexs[0];
      for (let i = 0; i < groupLength; ++i) {
        const indexPairLenth = originGroupIndexs[i].length;
        let tmpMergedArray: Array<number>;
        tmpMergedArray = new Array();
        for (let j = 0; j < indexPairLenth; ++j) {
          const indexNumber = originGroupIndexs[i][j].length;
          if (originGroupIndexs[i][j].sort().toString() === originalSplitIndexs.sort().toString()) {

            let tmpOriginArray: Array<Array<number>>;
            tmpOriginArray = new Array();
            let currentWallIndexs: Array<number>;
            currentWallIndexs = new Array();

            let tmpPoints = allIntersectionPoints[i];
            if (originalSplitIndexs[0] < originalSplitIndexs[1]) {
              currentWallIndexs.push(originalSplitIndexs[0]);
              currentWallIndexs.push(originalSplitIndexs[1] + 1);
              tmpOriginArray.push(currentWallIndexs);

              currentWallIndexs = new Array();
              currentWallIndexs.push(originalSplitIndexs[0] + 1);
              currentWallIndexs.push(originalSplitIndexs[1] + 1);
              tmpOriginArray.push(currentWallIndexs);

              tmpMergedArray.push(originalSplitIndexs[0], originalSplitIndexs[0] + 1, originalSplitIndexs[1] + 1);
            } else {
              currentWallIndexs.push(originalSplitIndexs[1]);
              currentWallIndexs.push(originalSplitIndexs[0]);
              tmpOriginArray.push(currentWallIndexs);

              currentWallIndexs = new Array();
              currentWallIndexs.push(originalSplitIndexs[1]);
              currentWallIndexs.push(originalSplitIndexs[0] + 1);
              tmpOriginArray.push(currentWallIndexs);

              tmpMergedArray.push(originalSplitIndexs[1], originalSplitIndexs[0], originalSplitIndexs[0] + 1);
            }
            originGroupIndexs.splice(i, 1);
            originGroupIndexs.splice(i, 0, tmpOriginArray);
            tmpPoints.push(tmpPoints[0]);
          } else {
            for (let k = 0; k < indexNumber; ++k) {
              if (originGroupIndexs[i][j][k] < splitIndex) {
                originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k];
              } else if (originGroupIndexs[i][j][k] == splitIndex) {
                const intPoint = allIntersectionPoints[i][j];
                if (splittedWallEntities[0].axisWall().contains(intPoint)) {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k];
                } else {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 1;
                }
              } else {
                originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 1;
              }
              tmpMergedArray.push(originGroupIndexs[i][j][k]);
            }
          }
        }

        mergedGroupedIndexs.splice(i, 1);
        this.removeDuplicate(tmpMergedArray);
        mergedGroupedIndexs.splice(i, 0, tmpMergedArray);
      }
    } else {
      let splitIndex1 = originalSplitIndexs[0];
      let splitIndex2 = originalSplitIndexs[1];
      for (let i = 0; i < groupLength; ++i) {
        const indexPairLenth = originGroupIndexs[i].length;
        let tmpMergedArray: Array<number>;
        tmpMergedArray = new Array();
        for (let j = 0; j < indexPairLenth; ++j) {
          const indexNumber = originGroupIndexs[i][j].length;
          if (originGroupIndexs[i][j].sort().toString() === originalSplitIndexs.sort().toString()) {

            let tmpOriginArray: Array<Array<number>>;
            tmpOriginArray = new Array();



            let currentWallIndexs: Array<number>;
            currentWallIndexs = new Array();

            let tmpPoints = allIntersectionPoints[i];

            currentWallIndexs.push(originalSplitIndexs[0]);
            currentWallIndexs.push(originalSplitIndexs[1] + 1);
            tmpOriginArray.push(currentWallIndexs);

            currentWallIndexs = new Array();
            currentWallIndexs.push(originalSplitIndexs[0] + 1);
            currentWallIndexs.push(originalSplitIndexs[1] + 2);
            tmpOriginArray.push(currentWallIndexs);

            tmpMergedArray.push(originalSplitIndexs[0], originalSplitIndexs[0] + 1, originalSplitIndexs[1] + 1, originalSplitIndexs[1] + 2);

            originGroupIndexs.splice(i, 1);
            originGroupIndexs.splice(i, 0, tmpOriginArray);

            tmpPoints.push(tmpPoints[0]);
          } else {
            for (let k = 0; k < indexNumber; ++k) {
              if (originGroupIndexs[i][j][k] < splitIndex1) {
                originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k];
              } else if (originGroupIndexs[i][j][k] == splitIndex1) {
                const intPoint = allIntersectionPoints[i][j];
                if (splittedWallEntities[0].axisWall().contains(intPoint)) {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k];
                } else {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 1;
                }
              } else if (originGroupIndexs[i][j][k] > splitIndex1 && originGroupIndexs[i][j][k] < splitIndex2) {
                originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 1;
              } else if (originGroupIndexs[i][j][k] == splitIndex2) {
                const intPoint = allIntersectionPoints[i][j];
                if (splittedWallEntities[2].axisWall().contains(intPoint)) {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 1;
                } else {
                  originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 2;
                }
              } else {
                originGroupIndexs[i][j][k] = originGroupIndexs[i][j][k] + 2;
              }
              tmpMergedArray.push(originGroupIndexs[i][j][k]);
            }
          }
        }
        mergedGroupedIndexs.splice(i, 1);
        this.removeDuplicate(tmpMergedArray);
        mergedGroupedIndexs.splice(i, 0, tmpMergedArray);
      }
    }
  }
  // recalculate the start point and end point of each wall line base on intersection of axis lines.
  // case1: If two axis lines connect on the end point(start point),we only need to calculate the intersection point and update information
  // case2: If two axis lines connect on the middle point of the first line and end point of the second line, we will split the first line to two lines
  // case3: If two axis lines connect on the middle points of both lines, we will split each line to two lines for both of them.
  private UpdateWallEntity() {
    let wallEntityLength = this.walls_.length;

    let intersectPointGroup: Array<Array<Point>>;
    let intersectWallIndex: Array<Array<number>>;

    intersectPointGroup = new Array();
    intersectWallIndex = new Array();
    let mergedGroupedIndexs: Array<Array<number>>;
    let mergedGroupedNormalWallsTag: Array<boolean>;
    let originGroupIndexs: Array<Array<Array<number>>>;
    let allIntersectionPoints: Array<Array<Point>>;

    let originalSplitIndexs: Array<number>;
    originalSplitIndexs = new Array();
    let splittedWallEntities: Array<WallEntity>;
    splittedWallEntities = new Array();

    mergedGroupedIndexs = new Array();
    mergedGroupedNormalWallsTag = new Array();
    originGroupIndexs = new Array();
    allIntersectionPoints = new Array();
    this.groupWallEntitiesByIntersection(mergedGroupedIndexs, mergedGroupedNormalWallsTag, originGroupIndexs, allIntersectionPoints);


    // base on group to check intersection
    const groupLength = mergedGroupedNormalWallsTag.length;
    for (let i = 0; i < groupLength; ++i) {
      if (mergedGroupedNormalWallsTag[i] == true) {
        // normal wall
        const joinWallsNumber = mergedGroupedIndexs[i].length;
        if (joinWallsNumber == 2) {
          // general case, end intersection, T shape,cross shape
          const index1 = mergedGroupedIndexs[i][0];
          const index2 = mergedGroupedIndexs[i][1];

          let currentWall = this.walls_[index1];

          let currentAxisWall = currentWall.axisWall();
          let currentInnerWall = currentWall.innerWall();
          let currentOuterWall = currentWall.outerWall();

          const nextWall = this.walls_[index2];
          const nextAxisWall = nextWall.axisWall();
          const nextInnerWall = nextWall.innerWall();
          const nextOuterWall = nextWall.outerWall();
          if (currentAxisWall.type() != GeometryType.GEO_LINE || nextAxisWall.type() != GeometryType.GEO_LINE) {
            continue;
          }

          const startPoint1 = (<Line>currentAxisWall).startPoint();
          const startPoint2 = (<Line>nextAxisWall).startPoint();

          const endPoint1 = (<Line>currentAxisWall).endPoint();
          const endPoint2 = (<Line>nextAxisWall).endPoint();

          const p1 = new Vec2(startPoint1.x(), startPoint1.y());
          const p2 = new Vec2(endPoint1.x(), endPoint1.y());
          const q1 = new Vec2(startPoint2.x(), startPoint2.y());
          const q2 = new Vec2(endPoint2.x(), endPoint2.y());

          let intersectedPoint = new Vec2(allIntersectionPoints[i][0].x(), allIntersectionPoints[i][0].y());
          const distToStart1 = MathUtil.CreateVecBySubtraction(intersectedPoint, p1).length();
          const distToEnd1 = MathUtil.CreateVecBySubtraction(intersectedPoint, p2).length();
          const distToStart2 = MathUtil.CreateVecBySubtraction(intersectedPoint, q1).length()
          const distToEnd2 = MathUtil.CreateVecBySubtraction(intersectedPoint, q2).length();

          const isIntersectCurrentEndPoint = MathUtil.isZero(distToStart1) || MathUtil.isZero(distToEnd1);
          const isIntersectNextEndPoint = MathUtil.isZero(distToStart2) || MathUtil.isZero(distToEnd2);


          if (isIntersectCurrentEndPoint && isIntersectNextEndPoint) {
            // case1
            const outWallEntities = this.handleEndToEndIntersection(this.walls_[index1], this.walls_[index2], intersectedPoint);
            this.walls_[index1].setWallEntity(outWallEntities[0]);
            this.walls_[index2].setWallEntity(outWallEntities[1]);
          } else if (isIntersectCurrentEndPoint && !isIntersectNextEndPoint) {
            // case2, split next
            const outWallEntities = this.handleEndToMiddleIntersection(this.walls_[index1], this.walls_[index2], intersectedPoint);
            if (outWallEntities.length == 3) {
              this.walls_[index1].setWallEntity(outWallEntities[0]);
              this.walls_.splice(index2, 1);
              this.walls_.splice(index2, 0, outWallEntities[2]);
              this.walls_.splice(index2, 0, outWallEntities[1]);

              originalSplitIndexs.length = 0;
              splittedWallEntities.length = 0;
              originalSplitIndexs.push(index2, index1);
              splittedWallEntities.push(outWallEntities[1], outWallEntities[2], outWallEntities[0]);
              this.updateIndex(originalSplitIndexs, splittedWallEntities, mergedGroupedIndexs, originGroupIndexs, allIntersectionPoints);
            }
          } else if (!isIntersectCurrentEndPoint && isIntersectNextEndPoint) {
            // case2, split current
            const outWallEntities = this.handleEndToMiddleIntersection(this.walls_[index2], this.walls_[index1], intersectedPoint);
            if (outWallEntities.length == 3) {
              this.walls_[index2].setWallEntity(outWallEntities[0]);
              this.walls_.splice(index1, 1);
              this.walls_.splice(index1, 0, outWallEntities[2]);
              this.walls_.splice(index1, 0, outWallEntities[1]);

              originalSplitIndexs.length = 0;
              splittedWallEntities.length = 0;
              originalSplitIndexs.push(index1, index2);
              splittedWallEntities.push(outWallEntities[1], outWallEntities[2], outWallEntities[0]);
              this.updateIndex(originalSplitIndexs, splittedWallEntities, mergedGroupedIndexs, originGroupIndexs, allIntersectionPoints);
            }
          } else {
            // case3, split both
            const outWallEntities = this.handleMiddleToMiddleIntersection(this.walls_[index1], this.walls_[index2], intersectedPoint);
            if (outWallEntities.length == 4) {
              this.walls_.splice(index2, 1);
              this.walls_.splice(index2, 0, outWallEntities[3]);
              this.walls_.splice(index2, 0, outWallEntities[2]);
              this.walls_.splice(index1, 1);
              this.walls_.splice(index1, 0, outWallEntities[1]);
              this.walls_.splice(index1, 0, outWallEntities[0]);

              originalSplitIndexs.length = 0;
              splittedWallEntities.length = 0;
              originalSplitIndexs.push(index1, index2);
              splittedWallEntities.push(outWallEntities[0], outWallEntities[1], outWallEntities[2], outWallEntities[3]);
              this.updateIndex(originalSplitIndexs, splittedWallEntities, mergedGroupedIndexs, originGroupIndexs, allIntersectionPoints);
            }
          }

        } else {
          // Y shape and more
          const joinWalls = new Array<WallEntity>();
          for (let j = 0; j < joinWallsNumber; ++j) {
            const index = mergedGroupedIndexs[i][j];
            joinWalls.push(this.walls_[index]);
          }
          const axisPoint = allIntersectionPoints[i][0];
          const interaxisPoint = new Vec2(axisPoint.x(), axisPoint.y());
          const outWallEntities = this.handleYShapeIntersection(joinWalls, interaxisPoint);
          for (let j = 0; j < joinWallsNumber; ++j) {
            joinWalls[j].setWallEntity(outWallEntities[j]);
          }
        }
      } else {
        // abnormal wall
      }
    }


    // for (let i = 0; i < wallEntityLength; ++i) {
    //   let currentWall = this.walls_[i];

    //   let currentAxisWall = currentWall.axisWall();
    //   let currentInnerWall = currentWall.innerWall();
    //   let currentOuterWall = currentWall.outerWall();
    //   //only handle line case
    //   if (currentAxisWall.type() != GeometryType.GEO_LINE) {
    //     continue;
    //   }
    //   const currentWallDirection = currentWall.axisWall().toVector().normalize();
    //   for (let j = i + 1; j < wallEntityLength; ++j) {
    //     const nextWall = this.walls_[j];
    //     const nextAxisWall = nextWall.axisWall();
    //     const nextInnerWall = nextWall.innerWall();
    //     const nextOuterWall = nextWall.outerWall();
    //     if (nextAxisWall.type() != GeometryType.GEO_LINE) {
    //       continue;
    //     }

    //     const isIntersection = MathUtil.islineSegmentIntersectLineSegment(<Line>currentAxisWall, <Line>nextAxisWall);
    //     if (isIntersection) {
    //       // normal case
    //       const startPoint1 = (<Line>currentAxisWall).startPoint();
    //       const startPoint2 = (<Line>nextAxisWall).startPoint();

    //       const endPoint1 = (<Line>currentAxisWall).endPoint();
    //       const endPoint2 = (<Line>nextAxisWall).endPoint();

    //       const p1 = new Vec2(startPoint1.x(), startPoint1.y());
    //       const p2 = new Vec2(endPoint1.x(), endPoint1.y());
    //       const q1 = new Vec2(startPoint2.x(), startPoint2.y());
    //       const q2 = new Vec2(endPoint2.x(), endPoint2.y());

    //       let intersectedPoint = new Vec2(0.0, 0.0);
    //       this.lineIntersectLine(<Line>currentAxisWall, <Line>nextAxisWall, intersectedPoint);
    //       const distToStart1 = MathUtil.CreateVecBySubtraction(intersectedPoint, p1).length();
    //       const distToEnd1 = MathUtil.CreateVecBySubtraction(intersectedPoint, p2).length();
    //       const distToStart2 = MathUtil.CreateVecBySubtraction(intersectedPoint, q1).length()
    //       const distToEnd2 = MathUtil.CreateVecBySubtraction(intersectedPoint, q2).length();

    //       if ((!MathUtil.isZero(distToStart1) && distToStart1 < 48) ||
    //         (!MathUtil.isZero(distToEnd1) && distToEnd1 < 48) ||
    //         (!MathUtil.isZero(distToStart2) && distToStart2 < 48) ||
    //         (!MathUtil.isZero(distToEnd2) && distToEnd2 < 48)) {
    //         continue;
    //       }
    //       const isIntersectCurrentEndPoint = MathUtil.isZero(distToStart1) || MathUtil.isZero(distToEnd1);
    //       const isIntersectNextEndPoint = MathUtil.isZero(distToStart2) || MathUtil.isZero(distToEnd2);


    //       if (isIntersectCurrentEndPoint && isIntersectNextEndPoint) {
    //         // case1
    //         const outWallEntities = this.handleEndToEndIntersection(this.walls_[i], this.walls_[j], intersectedPoint);
    //         this.walls_[i].setWallEntity(outWallEntities[0]);
    //         this.walls_[j].setWallEntity(outWallEntities[1]);
    //       } else if (isIntersectCurrentEndPoint && !isIntersectNextEndPoint) {
    //         // case2, split next
    //         const outWallEntities = this.handleEndToMiddleIntersection(this.walls_[i], this.walls_[j], intersectedPoint);
    //         if (outWallEntities.length == 3) {
    //           this.walls_[i].setWallEntity(outWallEntities[0]);
    //           this.walls_.splice(j, 1);
    //           this.walls_.splice(j, 0, outWallEntities[2]);
    //           this.walls_.splice(j, 0, outWallEntities[1]);
    //           wallEntityLength = wallEntityLength + 1;
    //           j = j + 1;

    //           /////////////
    //           currentWall = this.walls_[i];

    //           currentAxisWall = currentWall.axisWall();
    //           currentInnerWall = currentWall.innerWall();
    //           currentOuterWall = currentWall.outerWall();
    //         }
    //       } else if (!isIntersectCurrentEndPoint && isIntersectNextEndPoint) {
    //         // case2, split current
    //         const outWallEntities = this.handleEndToMiddleIntersection(this.walls_[j], this.walls_[i], intersectedPoint);
    //         if (outWallEntities.length == 3) {
    //           this.walls_[j].setWallEntity(outWallEntities[0]);
    //           this.walls_.splice(i, 1);
    //           this.walls_.splice(i, 0, outWallEntities[2]);
    //           this.walls_.splice(i, 0, outWallEntities[1]);
    //           wallEntityLength = wallEntityLength + 1;
    //           j = j + 1;

    //           /////////////////
    //           currentWall = this.walls_[i];

    //           currentAxisWall = currentWall.axisWall();
    //           currentInnerWall = currentWall.innerWall();
    //           currentOuterWall = currentWall.outerWall();
    //         }
    //       } else {
    //         // case3, split both
    //         const outWallEntities = this.handleEndToMiddleIntersection(this.walls_[j], this.walls_[i], intersectedPoint);
    //         if (outWallEntities.length == 4) {
    //           this.walls_.splice(j, 1);
    //           this.walls_.splice(j, 0, outWallEntities[3]);
    //           this.walls_.splice(j, 0, outWallEntities[2]);
    //           this.walls_.splice(i, 1);
    //           this.walls_.splice(i, 0, outWallEntities[1]);
    //           this.walls_.splice(i, 0, outWallEntities[0]);
    //           wallEntityLength = wallEntityLength + 2;
    //           j = j + 2;

    //           //////////////
    //           /////////////////
    //           currentWall = this.walls_[i];

    //           currentAxisWall = currentWall.axisWall();
    //           currentInnerWall = currentWall.innerWall();
    //           currentOuterWall = currentWall.outerWall();
    //         }
    //       }
    //     }

    //   }
    // }


  }

  // sort axis walls with order
  private sortAxisWall(wholeAxisWalls: Array<Array<Segment>>) {
    const roomLength = wholeAxisWalls.length;
    for (let i = 0; i < roomLength; ++i) {
      MathUtil.sortSegmentArray(wholeAxisWalls[i]);
    }
  }

  // NOTICE: when new add door/window, there exist no hole id!!
  public pushOpening(holeEntity: CubeHoleEntity): number {
    let index = -1;
    let openingId = undefined;
    if (holeEntity.attachedOpeningEntity && holeEntity.attachedOpeningEntity().originalId() != undefined) {
      openingId = holeEntity.attachedOpeningEntity().originalId();
    }


    const wallEntityLenth = this.walls_.length;
    // find right wall entity and push hole
    for (let i = 0; i < wallEntityLenth; ++i) {
      const currentWallEntity = this.walls_[i];



      const cubeHoleRect = holeEntity.cubeHoleRect();
      if (currentWallEntity.containHoleRect(cubeHoleRect)) {
        //////////////
        // check if alreay exist
        let isExist = false;
        const eixtHoleLength = currentWallEntity.holes().length;
        for (let j = 0; j < eixtHoleLength; ++j) {
          if (currentWallEntity.holes()[j].attachedOpeningEntity() && currentWallEntity.holes()[j].attachedOpeningEntity().originalId() === openingId) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          return index;
        }
        index = i;
        currentWallEntity.pushHole(holeEntity);
        break;
      }
    }
    return index;
  }


  removeOpening(openingId: number): number {
    let index = -1;
    const wallEntityLenth = this.walls_.length;

    if (openingId === undefined) {
      return index;
    }
    // find right wall entity and push hole
    for (let i = 0; i < wallEntityLenth; ++i) {
      const currentWallEntity = this.walls_[i];
      const holeLength = currentWallEntity.holes().length;
      for (let j = 0; j < holeLength; ++j) {
        if (currentWallEntity.holes()[j].attachedOpeningEntity() && currentWallEntity.holes()[j].attachedOpeningEntity().originalId() === openingId) {
          currentWallEntity.removeHole(openingId);
          index = i;
          break;
        }
      }
    }
    return index;
  }

  getOpening(openingId: number): any {
    let index = -1;
    const wallEntityLenth = this.walls_.length;

    if (openingId === undefined) {
      return {};
    }
    // find right opening and return
    for (let i = 0; i < wallEntityLenth; ++i) {
      const currentWallEntity = this.walls_[i];
      const holeLength = currentWallEntity.holes().length;
      for (let j = 0; j < holeLength; ++j) {
        if (currentWallEntity.holes()[j].attachedOpeningEntity() && currentWallEntity.holes()[j].attachedOpeningEntity().originalId() === openingId) {
          return {
            'wallIndex': i,
            'opening':currentWallEntity.holes()[j]
          };
        }
      }
    }
    return {};
  }
  // NOTICE: when the hole between two rooms is created, there exist no door id!!
  private createHoles(holeEntities: Array<CubeHoleEntity>) {
    const wallEntityLenth = this.walls_.length;
    // find right wall entity and push hole
    const holeLength = holeEntities.length;
    for (let i = 0; i < holeLength; ++i) {
      for (let j = 0; j < wallEntityLenth; ++j) {
        const currentWallEntity = this.walls_[j];
        const cubeHoleRect = holeEntities[i].cubeHoleRect();
        if (currentWallEntity.containHoleRect(cubeHoleRect)) {

          const hole = holeEntities[i];
          currentWallEntity.pushHole(hole);
          break;
        }
      }
    }
  }
  // input arguments:
  // innerWalls: all the inner wallstthat are wo dimensions array, first dimension is relate with room.
  // roomTags: all the room tags of the inner walls.
  // roomCenters: room center of each room. room center is used to adjust the wall normal of each wall
  // cubeHoleRects: the rect of each hole.
  // holeHeights: hole heights.
  // distanceFromGroundsOfHole: the distance of the lower of hole to the ground.
  constructor(innerWalls: Array<Array<Segment>>, wallHeights: Array<Array<number>>, roomTags: Array<Array<number>>, roomCenters: Array<Vec2>,
    holeEntities: Array<CubeHoleEntity>) {
    this.walls_ = new Array<WallEntity>();
    const rooms = innerWalls.length;
    for (let i = 0; i < rooms; ++i) {
      const outerWalls = MathUtil.GenerateOffsetCurves(innerWalls[i], 24);
      const wallLength = innerWalls[i].length;
      for (let j = 0; j < wallLength; ++j) {
        const currentRoomTag = new Array<number>();
        currentRoomTag.push(roomTags[i][j]);
        const wall = new WallEntity(innerWalls[i][j], outerWalls[j], wallHeights[i][j], currentRoomTag);
        this.walls_.push(wall);
      }
    }

    this.MergeWallEntity();
    this.UpdateWallEntity();

    const wallEntityLenth = this.walls_.length;
    let roomCenterMap = new Map<number, Vec2>();
    const centerLenth = roomCenters.length;
    for (let i = 0; i < centerLenth; ++i) {
      roomCenterMap.set(roomTags[i][0], roomCenters[i]);
    }

    /////////////////////////////////
    // get all axis wall and arrange by room tag
    // NoTICE: one axis wall could belong to two room, so exist duplicate wall in this array
    let wholeAxisWalls: Array<Array<Segment>>;
    wholeAxisWalls = new Array();

    this.wallEntitiesIndexOfRoom_ = new Map<number, Array<number>>();
    this.wallEntitiesUuidOfRooms_ = new Map<number, Array<string>>();
    const roomLength = roomTags.length;
    for (let i = 0; i < roomLength; ++i) {
      const roomTag = roomTags[i][0];
      const tmpString1 = roomTag.toString();
      wholeAxisWalls[i] = new Array();

      const indexArray = new Array();
      const uuidArray = new Array();
      for (let j = 0; j < wallEntityLenth; ++j) {
        const currentWallEntity = this.walls_[j];
        const tmpString2 = currentWallEntity.roomTag().toString();
        const isExist = tmpString2.indexOf(tmpString1);
        if (isExist == -1) {
          continue;
        }
        wholeAxisWalls[i].push(currentWallEntity.axisWall().clone());
        indexArray.push(j);
        uuidArray.push(currentWallEntity.uuid());
      }
      this.wallEntitiesIndexOfRoom_.set(roomTag, indexArray);
      this.wallEntitiesUuidOfRooms_.set(roomTag, uuidArray);
    }

    this.sortAxisWall(wholeAxisWalls);
    //////////////////////////////////
    //adjust wall normal

    for (let i = 0; i < wallEntityLenth; ++i) {
      const currentWallEntity = this.walls_[i];
      if (currentWallEntity.roomTag().length != 1) {
        continue;
      }
      const currentRoomTag = currentWallEntity.roomTag()[0];
      const tmpString1 = currentRoomTag.toString();
      const currentWallStartPoint = currentWallEntity.axisWall().startPoint();
      const currentWallEndPoint = currentWallEntity.axisWall().endPoint();
      const currentWallCenter = new Vec2(0.5 * (currentWallStartPoint.x() + currentWallEndPoint.x()), 0.5 * (currentWallStartPoint.y() + currentWallEndPoint.y()));
      const currentWallNormal = new Vec2(currentWallEntity.wallNormal().x, currentWallEntity.wallNormal().z);

      let hasIntersection = false;
      for (let j = 0; j < wallEntityLenth; ++j) {
        if (i === j) {
          continue;
        }
        const nextWallEntity = this.walls_[j];
        const tmpString2 = nextWallEntity.roomTag().toString();
        const isExist = tmpString2.indexOf(tmpString1);
        if (isExist == -1) {
          continue;
        }


        let intersectPoint = new Vec2(0, 0);
        const nextStartPoint = new Vec2(nextWallEntity.axisWall().startPoint().x(), nextWallEntity.axisWall().startPoint().y());
        const nextEndPoint = new Vec2(nextWallEntity.axisWall().endPoint().x(), nextWallEntity.axisWall().endPoint().y());
        const nextLength = nextEndPoint.clone().sub(nextStartPoint).length();
        const nextDirection = nextEndPoint.clone().sub(nextStartPoint).normalize();
        // use wall center as start point and wall normal as direction to intersect with other walls
        const isIntersect = MathUtil.lineIntersectLine(currentWallCenter, currentWallNormal, nextStartPoint, nextDirection, intersectPoint);
        if (isIntersect == false) {
          continue;
        }
        const v1 = intersectPoint.clone().sub(currentWallCenter);
        let v = v1.length();
        if (v1.dot(currentWallNormal) < 0) {
          // insect at the contrarary direction
          continue;
        }
        const v2 = intersectPoint.clone().sub(nextStartPoint);
        let w = v2.length();
        if (v2.dot(nextDirection) < 0 || (w > nextLength && !MathUtil.isZero(w - nextLength))) {
          // insect at the contrarary direction or out of the wall interval
          continue;
        }

        const testPoint = new Point(0.5 * (currentWallCenter.x + intersectPoint.x), 0.5 * (currentWallCenter.y + intersectPoint.y));

        let index = 0;
        for (let i = 0; i < roomLength; ++i) {
          const roomTag = roomTags[i][0];
          if (currentRoomTag === roomTag) {
            index = i;
            break;
          }
        }

        // TODO: optimize this check because this check has flaw.          Hong Ouyang(2017.10.19)
        const isInRoom = MathUtil.isPointInPolygon(testPoint, wholeAxisWalls[index]);
        if (isInRoom) {
          hasIntersection = true;
          break;
        }
      }

      if (!hasIntersection) {
        const newWallNormal = new Vector3(-currentWallNormal.x, currentWallEntity.wallNormal().y, -currentWallNormal.y);
        currentWallEntity.setWallNormal(newWallNormal);
      }
    }

    //////////////////////////////////
    // store hole
    this.createHoles(holeEntities);
  }


  private dumpWallInfo(currentWall: Segment): any {
    let wallInfo = {};
    if (currentWall.type() == GeometryType.GEO_LINE) {
      wallInfo['type'] = 'line';

    } else {
      wallInfo['type'] = 'arc';

      let centerPointPosition = new Array<number>();
      centerPointPosition.push((<Arc>currentWall).center().x(), (<Arc>currentWall).center().y());
      wallInfo['center'] = centerPointPosition;
      wallInfo['clockwise'] = (<Arc>currentWall).isClockwise();

    }

    let startPointPosition = new Array<number>();
    startPointPosition.push(currentWall.startPoint().x(), currentWall.startPoint().y());
    wallInfo['startPoint'] = startPointPosition;

    let endPointPosition = new Array<number>();
    endPointPosition.push(currentWall.endPoint().x(), currentWall.endPoint().y());
    wallInfo['endPoint'] = endPointPosition;
    return wallInfo;
  }

  private dumpholeInfo(hole: CubeHoleEntity, hostWallEntityId: string, connectedRoomIds: Array<number>): any {
    let holeInfo = {};

    holeInfo['fId'] = hole.uuid();
    holeInfo['hostId'] = hostWallEntityId;
    holeInfo['connectedRoomIds'] = connectedRoomIds;

    if (hole.attachedOpeningEntity()) {
      holeInfo['atachedItemId'] = hole.attachedOpeningEntity().uuid();
    }

    // cubeHoleRect is from plain view, for dump, we need the section view
    const originBounderPoints = hole.cubeHoleRect().getRectBounderPoint();

    const distanceFromGround = hole.distanceFromGround();
    const height = hole.height();
    const bounderLength = originBounderPoints.length;

    let holeBounderInfos = new Array();

    let point0 = originBounderPoints[0];
    let point1 = originBounderPoints[1];
    let point2 = originBounderPoints[2];
    let direction = point0.subtraction(point1);

    let holeDirection = new Array<number>();
    holeDirection.push(direction.x, 0, direction.y);

    holeInfo['depthDirection'] = holeDirection;

    const newPoint1 = new Vector3(point1.x(), distanceFromGround, point1.y());
    const newPoint2 = new Vector3(point2.x(), distanceFromGround, point2.y());
    const newPoint3 = new Vector3(point2.x(), distanceFromGround + height, point2.y());
    const newPoint4 = new Vector3(point1.x(), distanceFromGround + height, point1.y());

    const newBorderPoint = new Array<Vector3>();
    newBorderPoint.push(newPoint1, newPoint2, newPoint3, newPoint4);
    for (let i = 0; i < bounderLength; ++i) {
      // currently only support line type for opening
      let holeLineInfo = {};
      holeLineInfo['type'] = 'line';

      let startPointPosition = new Array<number>();
      let index1 = i % bounderLength;
      startPointPosition.push(newBorderPoint[index1].x, newBorderPoint[index1].y, newBorderPoint[index1].z);
      holeLineInfo['startPoint'] = startPointPosition;

      let endPointPosition = new Array<number>();
      let index2 = (i + 1) % bounderLength;
      endPointPosition.push(newBorderPoint[index2].x, newBorderPoint[index2].y, newBorderPoint[index2].z);
      holeLineInfo['endPoint'] = endPointPosition;

      holeBounderInfos.push(holeLineInfo);
    }

    holeInfo['profile'] = holeBounderInfos;
    return holeInfo;
  }



  private dumpOpeningInfo(opening: OpeningEntity, hostHoleId: string,
    hostWallEntityId: string, connectedRoomIds: Array<number>): any {
    if (!opening) {
      return;
    }
    let openingInfo = {};
    openingInfo['fId'] = opening.uuid();
    openingInfo['hostId'] = hostHoleId;
    openingInfo['hostWallId'] = hostWallEntityId;
    openingInfo['connectedRoomIds'] = connectedRoomIds;
    let nDirection = new Array<number>();
    nDirection.push(opening.nDirection().x, opening.nDirection().y, opening.nDirection().z);
    let tDirection = new Array<number>();
    tDirection.push(opening.tDirection().x, opening.tDirection().y, opening.tDirection().z);
    openingInfo['nDirection'] = nDirection;

    openingInfo['tDirection'] = tDirection;
    openingInfo['openingType'] = opening.openingType();

    return openingInfo;
  }

  private dumpWallInfos(): any {
    let wallInfos = new Array();
    const wallLength = this.walls_.length;
    for (let i = 0; i < wallLength; ++i) {
      // dump wall info
      let wallInfo = {};
      let axisInfo = {};
      let innerInfo = {};
      let outerInfo = {};

      const currentWallEntity = this.walls_[i];
      const currentAxisWall = currentWallEntity.axisWall();
      const currentInnerWall = currentWallEntity.innerWall();
      const currentOuterWall = currentWallEntity.outerWall();

      axisInfo = this.dumpWallInfo(currentAxisWall);
      innerInfo = this.dumpWallInfo(currentInnerWall);
      outerInfo = this.dumpWallInfo(currentOuterWall);

      wallInfo['location'] = axisInfo;
      wallInfo['positiveLine'] = innerInfo;
      wallInfo['negativeLine'] = outerInfo;
      wallInfo['width'] = 24;
      wallInfo['fId'] = this.walls_[i].uuid();

      let normal = new Array<number>();
      normal.push(currentWallEntity.wallNormal().x, currentWallEntity.wallNormal().y, currentWallEntity.wallNormal().z);
      wallInfo['wallNormal'] = normal;

      let tags = new Array<number>();
      for (let i = 0; i < currentWallEntity.roomTag().length; ++i) {
        tags.push(currentWallEntity.roomTag()[i]);
      }

      wallInfo['roomTag'] = tags;

      wallInfos.push(wallInfo);
    }
    return wallInfos;
  }

  private dumpHoleInfos(): any {
    let holeInfos = new Array();
    const wallLength = this.walls_.length;
    for (let i = 0; i < wallLength; ++i) {

      const currentWallEntity = this.walls_[i];
      const holeLenth = this.walls_[i].holes().length;
      for (let j = 0; j < holeLenth; ++j) {
        let holeInfo = this.dumpholeInfo(currentWallEntity.holes()[j], currentWallEntity.uuid(), currentWallEntity.roomTag());
        holeInfos.push(holeInfo);
      }
    }
    return holeInfos;
  }

  private isDoor(openType: OpeningType) {
    if (openType === 1 || openType === 2 || openType === 3) {
      return true;
    } else {
      return false;
    }
  }
  private dumpOpeningInfos(dumpDoor: boolean): any {
    let openingInfos = new Array();
    const wallLength = this.walls_.length;
    for (let i = 0; i < wallLength; ++i) {

      const currentWallEntity = this.walls_[i];
      const holeLenth = this.walls_[i].holes().length;
      for (let j = 0; j < holeLenth; ++j) {
        if (currentWallEntity.holes()[j].attachedOpeningEntity()) {

          if ((dumpDoor && !this.isDoor(currentWallEntity.holes()[j].attachedOpeningEntity().openingType())) ||
            (!dumpDoor && this.isDoor(currentWallEntity.holes()[j].attachedOpeningEntity().openingType()))) {
            continue;
          }
          let openingInfo = this.dumpOpeningInfo(currentWallEntity.holes()[j].attachedOpeningEntity(), currentWallEntity.holes()[j].uuid(),
            currentWallEntity.uuid(), currentWallEntity.roomTag());
          openingInfos.push(openingInfo);
        }
      }
    }
    return openingInfos;
  }


  // Dump wallEntities along with openings.
  public dumpWallEntities(): any {
    let entitiesInfo = {};

    //////////////////////////
    // dump wall info
    let wallInfos = this.dumpWallInfos();

    ///////////////////////////
    // dump hole info
    let holeInfos = this.dumpHoleInfos();
    ///////////////////////////
    // dump door
    let doorInfo = this.dumpOpeningInfos(true);
    ///////////////////////////
    // dump window
    let windowInfo = this.dumpOpeningInfos(false);

    ////////////////////////////
    entitiesInfo['wall'] = wallInfos;
    entitiesInfo['opening'] = holeInfos;
    entitiesInfo['door'] = doorInfo;
    entitiesInfo['window'] = windowInfo;
    return entitiesInfo;
  }

}
