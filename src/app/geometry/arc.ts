import { GeometryType } from './base'
import {Segment} from './segment'
import { Point } from './point'
import { Line } from './line'
import {Path, Point as PaperPoint} from 'paper'
import { Vector2 as Vec2} from 'three'
import * as MathUtil from '../math/math'
import {ArcPath} from '../path/path'


export class Arc extends Segment {
    protected center_: Point;
    protected isClockwise_: boolean;
    protected isAutoCenter_: boolean;

    /**
     *
     * @param startPoint 开始点
     * @param endPoint 结束点
     * @param center 弧线圆心
     * @param isClockwise 是否是顺时针
     * @param doInitPath 是否构建path，用于渲染
     */
    constructor(startPoint: Point, endPoint: Point, center: Point, isClockwise ?: boolean) {
        super(startPoint, endPoint);
        this.center_ = center;
        this.isClockwise_ = true;
        if (isClockwise !== undefined && isClockwise !== null) {
            this.isClockwise_ = isClockwise;
        }
        this.type_ = GeometryType.GEO_ARC;
        this.isAutoCenter_ = true;

    }



    deserialize(input) {
      // 先画 segment
      super.deserialize(input);

      this.center_ = new Point(0, 0).deserialize(input.center_);
      this.isClockwise_ = input.isClockwise_;
      this.isAutoCenter_ = input.isAutoCenter_;
      return this;
    }

    center(): Point {
        return this.center_;
    }

    setCenter(point: Point) {
        this.center_ = point;
    }

    isClockwise(): boolean {
        return this.isClockwise_;
    }

    setIsClockwise(isClockwise: boolean) {
        if (this.isClockwise_ === isClockwise) {
          return;
        }

        this.isClockwise_ = isClockwise;
        const tmpX = (this.startPoint().x() + this.endPoint().x());
        const tmpY = (this.startPoint().y() + this.endPoint().y());
        const newCenterX = tmpX - this.center().x();
        const newCenterY = tmpY - this.center().y();
        this.center_.setX(newCenterX);
        this.center_.setY(newCenterY);
    }


    getBBox(): Array<Point> {
      let leftX, rightX, bottomY, topY;

      const radius = this.radius();

      leftX = this.center_.x() - radius;
      rightX = this.center_.x() + radius;
      bottomY = this.center_.y() + radius;
      topY = this.center_.y() - radius;

      const box = new Array<Point>();
      const leftTopPoint = new Point(leftX, topY);
      const rightBottomPoint = new Point(rightX, bottomY);

      box.push(leftTopPoint);
      box.push(rightBottomPoint);

      return box;
    }

    // get the directional angel of two points
    private getAngel(point1: Point, point2: Point) : number {
      const vec1 = point1.subtraction(this.center_);
      const vec2 = point2.subtraction(this.center_);

      const vec1Lenth = vec1.length();
      const vec2Lenth = vec2.length();

      // invalid because point1 and point2 not in the arc
      if(!MathUtil.isZero(vec1Lenth - vec2Lenth)) {
        return -1;
      }

      const crossVec =MathUtil.CrossProduction(vec1, vec2);
      const dotVec = MathUtil.vec2ddot(vec1, vec2);
      let angel = Math.acos(dotVec / vec1Lenth / vec2Lenth);

      // Our coordinates belongs to left-handed coordinate(x to right and y downward),
      // so the relationship between the signal of cross production and clockwise is opposite with the right-handed coordinate.
      if ((this.isClockwise_ == true && crossVec < 0) || (this.isClockwise_ == false && crossVec > 0)){
        angel = 2 * Math.PI - angel;
      }
      return angel;
    }

    // 增加弧线的PointAtX实现
    pointAtX(x: number): Point {
      let result = null;
      const val1 = this.startPoint().x() - x;
      const val2 = x - this.endPoint().x();
      //圆外
      if(Math.abs(x - this.center().x()) > this.radius()) {
        return result;
      }
      // if(val1 * val2 < 0 ) {
      //   return result;
      // }

      const yminuscenter = Math.sqrt(Math.pow(this.radius() ,2 ) - Math.pow((x - this.center().x()) , 2));
      const pointchoice1 = new Point(x, this.center().y() + yminuscenter);
      const pointchoice2 = new Point(x, this.center().y() - yminuscenter);
      const distance1 = pointchoice1.distanceTo(this.arcThroughPoint());
      const distance2 = pointchoice2.distanceTo(this.arcThroughPoint());
      const directlength = this.radius() * 2;
      if(distance1 > directlength && distance2 > directlength) {
        return null;
      }

      // result = (pointchoice1.distanceTo(this.arcThroughPoint()) >= pointchoice2.distanceTo(this.arcThroughPoint()))?
      // pointchoice2 : pointchoice1;
      // 圆弧自身和X坐标对应垂直线相交两次
      if(Math.abs(distance1 - distance2) < 0.1) {
        if(distance2 < this.radius() * Math.sqrt(2.0)){
            return pointchoice2;
        } else {
           return null;
        }
      }

      result = (distance1 >= distance2) ? pointchoice2 : pointchoice1;

      return result;
  }

    getDistance(point1: Point, point2: Point) : number {
      const angel = this.getAngel(point1, point2);
      const radius = this.radius();
      return angel * radius;
    }
    // get distanceto to start point
    getDistanceToStartPoint(point: Point) : number {

      return this.getDistance(this.startPoint_, point);
    }


    getSegmentDistance() : number {
      const length = this.getDistance(this.startPoint_, this.endPoint_);
      return length;
    }

    setStartPoint(point: Point) {
        super.setStartPoint(point);
        this.autoComputeCenter();
    }

    setEndPoint(point: Point) {
        super.setEndPoint(point);
        this.autoComputeCenter();
    }

    protected autoComputeCenter() {
        if (this.isAutoCenter_) {
            this.center_.setX((this.startPoint_.x() + this.endPoint_.x()) / 2.0);
            this.center_.setY((this.startPoint_.y() + this.endPoint_.y()) / 2.0);
        }
    }
    isSame(otherSegment: Segment): boolean {
      if (otherSegment.type() != GeometryType.GEO_ARC) {
        return false;
      }

      const startPoint1 = this.startPoint();
      const endPoint1 = this.endPoint();
      const center1 = this.center();
      const clockWise1 = this.isClockwise();

      let startPoint2 = otherSegment.startPoint();
      let endPoint2 = otherSegment.endPoint();
      let center2 = (<Arc>otherSegment).center();
      let clockWise2 = (<Arc>otherSegment).isClockwise()
      let otherArc = new Arc(startPoint2, endPoint2, center2, clockWise2);

      if (clockWise2 != clockWise1) {
        otherArc.swapPoints();
        startPoint2 = otherArc.startPoint();
        endPoint2 = otherArc.endPoint();
        center2 = otherArc.center();
        clockWise2 = otherArc.isClockwise();
      }

      if (MathUtil.isZero(startPoint2.subtraction(startPoint1).length()) &&
          MathUtil.isZero(endPoint2.subtraction(endPoint1).length()) &&
          MathUtil.isZero(center2.subtraction(center1).length())) {
        return true
      } else {
        return false;
      }
    }
    setIsAutoCenter(isAuto: boolean) {
        this.isAutoCenter_ = isAuto;
    }

    radius(): number {
      const startVec = this.startPoint_.subtraction(this.center_);
      const radius = startVec.length();
      return radius;
    }

    arcThroughPoint(): Point {
      let vec = this.toVector();
      if ( !this.isClockwise() ) {
          vec = vec.multiplyScalar(-1.0);
      }

      const radius = this.radius();
      let tmpVec = new Vec2(vec.y, -vec.x);
      tmpVec = tmpVec.normalize();
      tmpVec.multiplyScalar(radius);
      const point = new Point(this.center().x(), this.center().y());
      point.add(tmpVec);
      return point;
    }

    distanceFromPoint(point: Point) : number {
      const line = new Line(this.center_, point);

      const intersectedPoints = MathUtil.lineSegmentIntersectArc(line, this);

      if (intersectedPoints.length == 0) {
        return -1;
      } else {
        let minDistance = 1.0e+6;
        for (let i = 0; i < intersectedPoints.length; i++) {
          const distance = point.subtraction(intersectedPoints[i]).length();
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
        return minDistance;
      }

    }
    contains(point: Point): boolean {
      const angel1 = this.getAngel(this.startPoint_, this.endPoint_);
      const angel2 = this.getAngel(this.startPoint_, point);

      if(angel2 > angel1) {
        return false;
      } else {
        return true;
      }
    }

    clone(): any {
        return new Arc(this.startPoint_.clone(), this.endPoint_.clone(), this.center_.clone(), this.isClockwise_);
    }

    swapPoints() {
        super.swapPoints();
        this.isClockwise_ = !this.isClockwise_;
        //this.setIsClockwise(!this.isClockwise());
    }

    /**
     * 生成geometry的凸点集合，用于进行计算
     * 这些信息足够绝大多数 几何判断
     */
    generateOuterPoints(): Array<PaperPoint> {
       const returnArray = new Array<PaperPoint>();
       returnArray.push(this.startPoint_.toPaperPoint());
       returnArray.push(this.arcThroughPoint().toPaperPoint());
       returnArray.push(this.endPoint_.toPaperPoint());

       return returnArray;
    }

    /**
     * 圆弧的开始的弧度
     */
    startAngle(): number{
      const vec2 = this.startPoint_.subtraction(this.center_);
      return MathUtil.Vec2ToRadian(vec2);
    }

    /**
     * 圆弧结束的弧度
     */
    endAngle(): number{
      const vec2 = this.endPoint_.subtraction(this.center_);
      return MathUtil.Vec2ToRadian(vec2);
    }



}
