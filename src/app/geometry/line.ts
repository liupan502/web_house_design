import {Point} from './point'
import {Polygon} from './polygon'
import {BaseGeometry, GeometryType} from './base'
import {Segment} from './segment'
import {Vector2 as Vec2} from 'three'
import * as MathUtil from '../math/math'
import {Path, Point as PaperPoint} from 'paper'
import {LinePath} from '../path/path'

export enum LineType {
    LINE = 0,
    LINE_RAY = 1,
    LINE_SEGMENT,
}

export class Line extends Segment {
    protected a_: number;
    protected b_: number;
    protected c_: number;
    protected lineType_: LineType;



    static DoIntersectWith(l1: Line, l2: Line, intersectedPoint: Point): boolean {
        if (l1.isNull() || l2.isNull() ) {
            return false;
        }

        if (l1.isParallel(l2)) {
            if (l2.contains(l1.startPoint())) {
                intersectedPoint.setX(l1.startPoint().x());
                intersectedPoint.setY(l1.startPoint().y());
                // console.log('line connected line');
                return true;
            }

            if (l2.contains(l1.endPoint())) {
                intersectedPoint.setX(l1.endPoint().x());
                intersectedPoint.setY(l1.endPoint().y());
                // console.log('line connected line');
                return true;
            }
            return false;
        }

        let result = true;

        const scale = -1.0 / (l1.a_ * l2.b_ - l1.b_ * l2.a_);

        const x = scale * (l2.b_ * l1.c_ - l1.b_ * l2.c_);
        const y = scale * (-l2.a_ * l1.c_ + l1.a_ * l2.c_);
        const tmpPoint = new Point(x, y);
        if (!l1.contains(tmpPoint) || !l2.contains(tmpPoint)) {
            return false;
        }
        intersectedPoint.setX(tmpPoint.x());
        intersectedPoint.setY(tmpPoint.y());
        return true;
    }

    deserialize(input) {
        // 先画 segment
        super.deserialize(input);

        this.lineType_ = input.lineType_;
        this.a_ = input.a_;
        this.b_ = input.b_;
        this.c_ = input.c_;

        return this;
    }



    constructor(startPoint_: Point,  endPoint_: Point) {
        super(startPoint_, endPoint_);
        this.type_ = GeometryType.GEO_LINE;
        const pointsValidation = true;
        if (pointsValidation) {
            this.updateLine();
        }

        this.lineType_ = LineType.LINE_SEGMENT;
    }


    protected updateLine() {
            const offset = this.endPoint_.subtraction(this.startPoint_);

            // 起点和终点相同
            if (MathUtil.isZero(offset.length())) {
             this.isNull_ = true;
            } else {
                let xOffset = this.endPoint_.x() - this.startPoint_.x();
                if (MathUtil.isZero(xOffset)) {
                    xOffset = 0.0;
                }

                let yOffset = this.endPoint_.y() - this.startPoint_.y();
                if (MathUtil.isZero(yOffset)) {
                    yOffset = 0.0;
                }

                this.a_ = yOffset;
                this.b_ = -xOffset;
                this.c_ = -(this.a_ * this.startPoint().x() + this.b_ * this.startPoint().y());
                this.isNull_ = false;
            }
    }


    direction(): Vec2 {
        return this.startPoint_.subtraction(this.endPoint_).normalize();
    }


    isParallel(line: Line): boolean {
        const direction1 = this.direction();
        const direction2 = line.direction();

        return MathUtil.AreVectorsParallel(direction1, direction2);
    }

    isPerpendicular(line: Line): boolean {
        const direction1 = this.direction();
        const direction2 = line.direction();
        return MathUtil.AreVectorsPerpendicular(direction1, direction2);
    }

    contains(point: Point): boolean {
        if (point.isNull() || this.isNull()) {
            // return false;
        }

        if (point.equal(this.startPoint_) || point.equal(this.endPoint_)) {
            return true;
        }

        const val = this.a_ * point.x() + this.b_ * point.y();

        // 点不不满足直线表达式
        if (!MathUtil.isZero(this.c_ +  val)) {
            return false;
        }
        let result = false;
        switch (this.lineType_) {
            case LineType.LINE_SEGMENT:
                result =  this.segmentContains(point);
                break;
            case LineType.LINE_RAY:
                result = this.rayContains(point);
                break;
            case LineType.LINE:
                result = true;
                break;
            default:
                break;
        }

        return result;
    }

    getBBox(): Array<Point> {
      let leftX, rightX,bottomY, topY;
      if (this.startPoint_.x() < this.endPoint_.x()) {
        leftX = this.startPoint_.x();
        rightX = this.endPoint_.x();
      } else {
        leftX = this.endPoint_.x();
        rightX = this.startPoint_.x();
      }

      if (this.startPoint_.y() < this.endPoint_.y()) {
        bottomY = this.endPoint_.y();
        topY = this.startPoint_.y();
      } else {
        bottomY = this.startPoint_.y();
        topY = this.endPoint_.y();
      }

      const box = new Array<Point>();
      const leftTopPoint = new Point(leftX, topY);
      const rightBottomPoint = new Point(rightX, bottomY);

      box.push(leftTopPoint);
      box.push(rightBottomPoint);

      return box;

    }

    isSame(otherSegment: Segment): boolean {
      if (otherSegment === undefined || otherSegment === null) {
        return false;
      }

      if (otherSegment.type() !== GeometryType.GEO_LINE) {
        return false;
      }

      const startPoint1 = this.startPoint();
      const endPoint1 = this.endPoint();
      const direction1 = this.direction();
      direction1.normalize();
      const startPoint2 = otherSegment.startPoint();
      const endPoint2 = otherSegment.endPoint();

      const otherLine = new Line(startPoint2, endPoint2);
      const direction2 = otherLine.direction();
      direction2.normalize();

      const diffDirection1 = MathUtil.CreateVecBySubtraction(direction1, direction2);
      const diffDirection2 = MathUtil.CreateVecByAdd(direction1, direction2);
      if (!MathUtil.isZero(diffDirection1.length()) && !MathUtil.isZero(diffDirection2.length())) {
        return false;
      }

      if (MathUtil.isZero(startPoint2.subtraction(startPoint1).length()) && MathUtil.isZero(endPoint2.subtraction(endPoint1).length())) {
        return true;
      } else if (MathUtil.isZero(startPoint2.subtraction(endPoint1).length()) && MathUtil.isZero(endPoint2.subtraction(startPoint1).length())) {
        return true;
      } else {
        return false;
      }
    }

    getDistanceToStartPoint(point: Point) : number {
      const distance = point.subtraction(this.startPoint()).length();
      return distance;
    }

    getSegmentDistance() : number {
      const length = this.endPoint_.subtraction(this.startPoint_).length();
      return length;
    }
    addToPath(path: Path) {
        if (path.segments.length === 0) {
            path.moveTo(this.startPoint_.toPaperPoint());
        }

        path.lineTo(this.endPoint_.toPaperPoint());
    }

    distanceFromPoint(point: Point) : number {
        const val1 = this.a_ * point.x() + this.b_ * point.y() + this.c_;
        const val2 = Math.sqrt(Math.pow(this.a_, 2.0) + Math.pow(this.b_, 2.0));
        const tmpDistance = Math.abs(val1) / val2;

        const vec = this.toVector();
        const vec1 = vec.multiplyScalar(-val1);

        const vec2 = vec1.normalize();
        const normalVec = new Vec2(-vec2.y, vec2.x);

        const tmp = new Array<Line>();
        const point1 = new Point(this.endPoint().x() + normalVec.x * tmpDistance * 1.2,
                                 this.endPoint().y() + normalVec.y * tmpDistance * 1.2);
        const point2 = new Point(point1.x() - this.toVector().x, point1.y() - this.toVector().y);
        tmp.push(this);
        const line1 = new Line(this.endPoint(), point1);

        tmp.push(line1);
        //tmp[1].destoryPath();
        const line2 = new Line(point1, point2);

        tmp.push(line2);
        const line3 = new Line(point2, this.startPoint());

        tmp.push(line3);
        //tmp[3].destoryPath();

        const tmpPolygon = new Polygon(tmp);

        if (tmpPolygon.contains(point)) {
            return tmpDistance;
        } else {
            return -1;
        }
        //return tmpDistance;
    }

    pointAtX(x: number): Point {
        if ( this.b_ === 0) {
            return null;
        }

        const val1 = this.startPoint().x() - x;
        const val2 = x -  this.endPoint().x();

        if ( val1 * val2 < 0) {
            return null;
        }

        const y = -(this.a_ * x + this.c_) / this.b_;
        const point = new Point(x, y);
        if ( this.contains(point)) {
            return point;
        } else {
            return null;
        }
    }

    pointAtY(y: number): Point {
        if(this.a_ === 0) {
            return null;
        }

        const val1 = this.startPoint().y() - y;
        const val2 = y - this.endPoint().y();
        if( val1 * val2 < 0) {
            return null;
        }

        const x = - (this.b_ * y + this.c_) / this.a_;
        const point = new Point(x,y);
        if(this.contains(point)) {
            return point;
        } else {
            return null;
        }

    }

    lineType(): LineType {
      return this.lineType_;
  }

    pointValue(point: Point): number {
        return this.a_ * point.x() + this.b_ * point.y() + this.c_;
    }

    setStartPoint(point: Point) {
        super.setStartPoint(point);
        this.updateLine();
    }

    setEndPoint(point: Point) {
        super.setEndPoint(point);
        this.updateLine();
    }

    setLineType(lineType: LineType) {
        this.lineType_ = lineType;
    }

    protected segmentContains(point: Point): boolean {
        const tmpPoint = new Point(point.x(), point.y());
        const vec2 = this.endPoint_.subtraction(tmpPoint).normalize();
        const vec1 = tmpPoint.subtraction(this.startPoint_).normalize();

        const value = vec1.dot(vec2);
        if (MathUtil.isZero(1 - vec1.dot(vec2))) {
            return true;
        } else {
            return false;
        }
    }

    protected rayContains(point: Point): boolean {
        const tmpPoint = new Point(point.x(), point.y());
        const vec1 = this.toVector();
        vec1.normalize();
        const vec2 = tmpPoint.subtraction(this.startPoint());
        vec2.normalize();
        if (MathUtil.isZero(1 - vec1.dot(vec2))) {
            return true;
        } else {
            return false;
        }
    }

    middlePoint(): Point {
        return new Point((this.startPoint_.x() + this.endPoint_.x()) / 2.0 ,
                        (this.startPoint_.y() + this.endPoint_.y()) / 2.0);
    }

    clone(): any {
        const result = new Line(this.startPoint_, this.endPoint_);
        result.setLineType(this.lineType_);
        return result;
    }

    swapPoints() {
        super.swapPoints();
        this.updateLine();
    }

    /**
     * 生成geometry的凸点集合，用于进行计算
     * 这些信息足够绝大多数 几何判断
     */
    generateOuterPoints(): Array<PaperPoint> {
        const result = new Array<PaperPoint>();
        result.push(this.startPoint_.toPaperPoint());
        result.push(this.endPoint_.toPaperPoint());

        return result;
    }

    /**
     * 将point 投影到线上，如果投影点不在线中，返回null
     * @param point
     */
    projectPoint(point: Point): Point {
        const pointVal = this.pointValue(point);
        if (pointVal === 0 ) {
            if (this.contains(point)) {
                return point.clone();
            } else {
                return null;
            }
        }
        const tmpVal1 = Math.sqrt(this.a_ * this.a_ + this.b_ * this.b_);
        const distance = Math.abs(pointVal / tmpVal1);
        const vec = this.toVector();
        vec.normalize();
        let normalVec: Vec2 = null;
        if (pointVal > 0) {
            normalVec = new Vec2(-vec.y, vec.x);
        }else {
            normalVec = new Vec2(vec.y, -vec.x);
        }
        normalVec.multiplyScalar(distance);
        const newPoint = <Point>point.clone();
        newPoint.add(normalVec);
        if (this.contains(newPoint)) {
            return newPoint;
        }
        return null;
    }

    /**
     * 线段沿两端向外延伸
     * @author Angus Lee
     * @param length
     */
    static extends(line:Line, length:number):Line{
        const mp = line.middlePoint();
        const v_s = new Vec2(line.startPoint_.x() - mp.x(), line.startPoint_.y() - mp.y());
        const v_e = new Vec2(line.endPoint_.x() - mp.x(), line.endPoint_.y() - mp.y());
        const scalar = 1 + length / line.getDistanceToStartPoint(mp);
        v_s.multiplyScalar(scalar);
        v_e.multiplyScalar(scalar);

        const sp = new Point(mp.x() + v_s.x, mp.y() + v_s.y);
        const ep = new Point(mp.x() + v_e.x, mp.y() + v_e.y);

        return new Line(sp, ep);
    }

    /**
     * 射线与直线组的碰撞检测
     *
     * @return Point?
     */
    rayIntersect(lines:Array<Line>):Point {
        if(this.lineType_ != LineType.LINE_RAY) return null;
        const ep = this.startPoint().clone();
        let isIntersect = false;
        for(let i = 0, il = lines.length; i < il; ++i) {
            const line = lines[i];
            isIntersect = Line.DoIntersectWith(line, this, ep);
            if (isIntersect) break;
        }
        return isIntersect ? ep : null;
    };

    /**
     * 将直线按分段数等分，输出分段节点
     *
     * @param nSegments 分段点数量
     */
    split(nSegments:number):Array<Point> {
        let pts = [];
        const dir = this.toVector().normalize();
        const sp = this.startPoint();
        const length = this.length();
        const seg_length = length / (nSegments + 1);
        for(let i = 0; i < nSegments; ++i) {
            const subdir = dir.clone().multiplyScalar(seg_length * (i + 1));
            let p:Point = sp.clone();
            p.add(subdir)
            pts.push(p);
        }
        return pts;
    }

}
