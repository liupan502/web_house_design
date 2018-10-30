import {Point} from './point'
import {Polygon} from './polygon'
import {BaseGeometry, GeometryType} from './base'
import {Segment} from './segment'
import {Vector2 as Vec2} from 'three'
import * as MathUtil from '../math/math'
import {Path, Point as PaperPoint, Rectangle} from 'paper'
import {EillpsePath} from '../path/path'

export class Eillpse extends BaseGeometry {
    protected path_;

    constructor(private center_:Point,private width_:number,private height_:number, doInitPath = true) {
        super();
        this.type_ = GeometryType.GEO_EILLPSE;
        if (doInitPath) this.initPath();        
    }

    initPath() {
        return this.path_ ? false : this.path_ = new EillpsePath(this);
    }

    center():Point {
        return this.center_;
    }

    setCenter(point:Point) {
        this.center_ = point;
    }

    width():number{
        return this.width_;
    }

    setWidth(width: number) {
        this.width_ = width;
    }

    height():number {
        return this.height_;
    }

    setHeight(height:number) {
        this.height_ = height;
    }

    setBoundsByBorderPoint(start: Point, end: Point) {
        this.setCenter( new Point((start.x() + end.x()) / 2, (start.y() + end.y()) / 2));
        this.setWidth( Math.abs(start.x() - end.x()) );
        this.setHeight( Math.abs(start.y() - end.y()) );
        
    }
}
