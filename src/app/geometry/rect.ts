import { BaseGeometry, GeometryType } from './base'
import { Point } from './point'
import { BasePath, RectPath } from '../path/path'
import { Line } from './line';
import { Segment } from './segment';
import { Vector2 as Vec2 } from 'three'
import * as MathUtil from '../math/math'
import {Point as PaperPoint} from 'paper'

export class Rect extends BaseGeometry {
    protected center_: Point;
    protected width_: number;
    protected length_: number;
    protected lengthDirection_: Vec2;

    constructor (center: Point, width: number, length: number, lengthDirection ?: Vec2) {
        super();
        this.type_ = GeometryType.GEO_RECT;
        this.width_ = width;
        this.length_ = length;
        this.center_ = center;

        // this.path_ = new RectPath(this);
        if (lengthDirection) {
          this.lengthDirection_ = lengthDirection.clone();
        } else {
          this.lengthDirection_ = new Vec2(1, 0);
        }
    }

    lengthDirection(): Vec2 {
      return this.lengthDirection_;
    }

    deserialize(input) {
        this.type_ = input.type_;
        this.width_ = input.width_;
        this.length_ = input.length_;
        this.center_ = new Point(0, 0).deserialize(input.center_);
        return this;
    }

    clone():Rect{
        return new Rect(this.center_.clone(), this.width_, this.length_, this.lengthDirection_);
    }

    /**
     * 废弃
     */
    path(): BasePath { return null }

    width(): number {
        return this.width_;
    }

    setWidth(width: number) {
        this.width_ = width;
    }

    length(): number {
        return this.length_;
    }

    setLength(length: number) {
        this.length_ = length;
    }

    // start with left-top point
    getRectBounderPoint(): Array<Point> {
      let lengthDir = this.lengthDirection_.normalize();
      let widthDir = new Vec2(-lengthDir.y, lengthDir.x);
      if (MathUtil.CrossProduction(widthDir, lengthDir) > 0) {
        widthDir = MathUtil.CreateVecByMultiply(widthDir, -1);
      }
      const tmpPoint1 = new Vec2(this.center_.x() - 0.5 * this.length_ * lengthDir.x, this.center_.y() - 0.5 * this.length_ * lengthDir.y);
      const tmpPoint2 = new Vec2(this.center_.x() + 0.5 * this.length_ * lengthDir.x, this.center_.y() + 0.5 * this.length_ * lengthDir.y);

      const point1 = new Point(tmpPoint1.x + 0.5 * this.width_ * widthDir.x, tmpPoint1.y + 0.5 * this.width_ * widthDir.y);
      const point2 = new Point(tmpPoint2.x + 0.5 * this.width_ * widthDir.x, tmpPoint2.y + 0.5 * this.width_ * widthDir.y);
      const point3 = new Point(tmpPoint2.x - 0.5 * this.width_ * widthDir.x, tmpPoint2.y - 0.5 * this.width_ * widthDir.y);
      const point4 = new Point(tmpPoint1.x - 0.5 * this.width_ * widthDir.x, tmpPoint1.y - 0.5 * this.width_ * widthDir.y);

      const bounderPoint = new Array<Point>();
      bounderPoint.push(point1, point4, point3, point2);
      return bounderPoint;
    }

    getRectBounder(): Array<Line> {
      const bounder = new Array<Line>();
      const bounderPoint = this.getRectBounderPoint();
      if(bounderPoint.length != 4) {
        return bounder;
      }
      const line1 = new Line(bounderPoint[0], bounderPoint[1]);
      const line2 = new Line(bounderPoint[1], bounderPoint[2]);
      const line3 = new Line(bounderPoint[2], bounderPoint[3]);
      const line4 = new Line(bounderPoint[3], bounderPoint[0]);


      bounder.push(line1, line2, line3, line4);
      return bounder;
    }

    setBoundsByBorderPoint(start: Point, end: Point) {
        let s_x = start.x(),
            s_y = start.y(),
            e_x = end.x(),
            e_y = end.y();
        this.center_.setX((s_x + e_x) / 2);
        this.center_.setY((s_y + e_y) / 2);
        this.setLength(Math.abs(e_x - s_x));
        this.setWidth(Math.abs(e_y - s_y));
    }

    center(): Point {
        return this.center_;
    }

    setCenter(center: Point) {
        this.center_ = center;
    }

    distanceToPoint(point:Point) {

    }

    /**
     * 生成geometry的凸点集合，用于进行计算
     * 这些信息足够绝大多数 几何判断
     */
    generateOuterPoints(): Array<PaperPoint> {
        const pointinfo = new Array<PaperPoint>();
        // const plt = new PaperPoint(this.center().x() - )
        const pointArray = this.getRectBounderPoint();
        for(let i = 0; i < pointArray.length; i++) {
            pointinfo.push(pointArray[i].toPaperPoint());
        } 
        return pointinfo;
    }      
}
