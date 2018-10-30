import {BaseGeometry, GeometryType} from './base'
import {Point} from './point'
import {Path, Point as PaperPoint} from 'paper'
import {CirclePath} from '../path/path'


export class Circle extends BaseGeometry {
    protected center_: Point;

    protected radius_: number;

    constructor(center: Point, radius: number) {
        super();
        this.center_ = center;
        this.radius_ = radius;   
       
        // this.path_ = new CirclePath(this);
        this.type_ = GeometryType.GEO_CIRCLE;
    }
    
    

    center(): Point {
        return this.center_;
    }

    setCenter(point: Point) {
        this.center_ = point;
    }

    radius(): number {
        return this.radius_;
    }

    setRadius(radius: number) {
        this.radius_ = radius;
    }

    generateOuterPoints(): Array<PaperPoint> {
        const result = new Array<PaperPoint>();
        const p1 = new PaperPoint( this.center().x() - this.radius() , this.center().y());
        const p2 = new PaperPoint( this.center().x() + this.radius(), this.center().y());
        const p3 = new PaperPoint( this.center().x(), this.center().y() - this.radius());
        const p4 = new PaperPoint( this.center().x(), this.center().y() + this.radius()); 
        result.push(p1);
        result.push(p2);
        result.push(p3);
        result.push(p4);

        return result;
     }
}
