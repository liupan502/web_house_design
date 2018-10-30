import {BaseGeometry, GeometryType} from './base'
import {Vector2 as Vec2} from 'three'
import * as MathUtil from '../math/math'
import {Path, Point as PaperPoint} from 'paper'

export class Point extends BaseGeometry {
    protected seedtype_: string;

    static fromPaperPoint(point: PaperPoint): Point {
        return new Point(point.x, point.y);
    }

    constructor(private x_: number, private y_: number) {
        super();
        this.type_ = GeometryType.GEO_POINT;
        this.seedtype_ = 'none';
    }

    setSeedType(typeinfo: string) {
        this.seedtype_ = typeinfo;
    }

    getSeedType(): string {
        return this.seedtype_;
    }

    deserialize(input) {
        this.x_ = input.x_ ;
        this.y_ = input.y_ ;
        this.isNull_ = input.isNull_;
        return this;
    }

    setX(x_: number) {
        this.x_ = x_;
        this.isNull_ = false;
    }

    x(): number {
        return this.x_;
    }

    setY(y_: number) {
        this.y_ = y_;
        this.isNull_ = false;
    }

    y(): number {
        return this.y_;
    }

    toPaperPoint(): PaperPoint {
        return new PaperPoint(this.x_, this.y_);
    }

    add(vec: Vec2) {
        this.x_ += vec.x;
        this.y_ += vec.y;
    }

    subtraction(point: Point): Vec2 {
        return new Vec2(this.x() - point.x(), this.y() - point.y());
    }

    addation(vec: Vec2) {
        this.x_ += vec.x;
        this.y_ += vec.y;
    }

    equal(point: Point): boolean {
        const vec = this.subtraction(point);
        return MathUtil.isZero(vec.length());
    }

    addToPath(path: Path) {

    }

    distanceTo(point: Point) {
        return this.subtraction(point).length();
    }

    clone(): any {
        return new Point(this.x_ , this.y_);
    }
}
