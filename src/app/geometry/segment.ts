import {BaseGeometry, GeometryType} from './base'
import {Point} from './point'
import {Path} from 'paper'
import {Vector2 as Vec2} from 'three'

export abstract class Segment extends BaseGeometry {
    protected startPoint_: Point;
    protected endPoint_: Point;


    constructor(startPoint: Point, endPoint: Point) {
        super();
        this.startPoint_ = startPoint;
        this.endPoint_ = endPoint;
    }

    showEntityInfo() {
        return 'segment';
    }

    deserialize(input) {
        // this.type_ = input.type_;
        this.startPoint_ = new Point(0, 0).deserialize(input.startPoint_);
        this.endPoint_ = new Point(0, 0).deserialize(input.endPoint_);

        return this;
    }

    setStartPoint(point: Point) {
        this.startPoint_ = point;
    }

    startPoint(): Point {
        return this.startPoint_;
    }

    setEndPoint(point: Point) {
        this.endPoint_ = point;
    }

    endPoint(): Point {
        return this.endPoint_;
    }

    toVector(): Vec2 {
        return this.endPoint().subtraction(this.startPoint());
    }

    length(): number {
        return this.startPoint_.subtraction(this.endPoint_).length();
    }

    pointAtX(x: number): Point {
        return null;
    }

    pointAtY(y: number): Point {
        return null;
    }


    swapPoints() {
        const tmp = this.startPoint_;
        this.startPoint_ = this.endPoint_;
        this.endPoint_ = tmp;
    }

    pointValue(point: Point): number {
        return null;
    }

    abstract distanceFromPoint(point: Point) : number;

    // get the bounding box of segment
    // return the left-top point and right-bottom point
    abstract getBBox(): Array<Point>;

    abstract contains(point: Point): boolean;

    abstract clone(): any;

    abstract getDistanceToStartPoint(point: Point) : number;
    abstract getSegmentDistance() : number;

    abstract isSame(otherSegment: Segment): boolean;

}
