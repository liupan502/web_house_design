import {BasePath} from './base-path'
import {Point, Rect, BaseGeometry} from '../geometry/geometry'
import {BaseEntity, Design, Serializable } from '../houselayout/entity/entity'
import {Point as PaperPoint,Segment} from 'paper'
export class RectPath extends BasePath {
    constructor(rect: Rect) {
        super();
        this.geo_ = rect;
    }

    deserialize(input) {
        super.deserialize(input);
        const infos = JSON.stringify(this);
        console.log(infos);
        //this.geo_ = new Rect(new Point(0, 0) , 5, 5).deserialize(input.geo_);
        input.segments.forEach(element => {
            //this.segments.push(new Segment());
            console.log(element);
        });

        this.strokeColor = input.strokeColor;

        this.update();

        const info2 = JSON.stringify(this);
        console.log(info2);        
        return this;
    }

    rect(): Rect {
        
        return <Rect>this.geo_;
    }

    update() {
        this.removeSegments();
        
        const halfWidth = this.rect().width() / 2.0;
        const halfLength = this.rect().length() / 2.0;
        const center = this.rect().center();
        // const center = new Point(0,0);
        this.moveTo(new PaperPoint(center.x() - halfLength, center.y() - halfWidth));
        this.lineTo(new PaperPoint(center.x() + halfLength, center.y() - halfWidth));
        this.lineTo(new PaperPoint(center.x() + halfLength, center.y() + halfWidth));
        this.lineTo(new PaperPoint(center.x() - halfLength, center.y() + halfWidth));
        this.lineTo(new PaperPoint(center.x() - halfLength, center.y() - halfWidth));
        // this.rotate(30, new PaperPoint(0.0, 0.0));
    }
}