import {Path, Point as PaperPoint} from 'paper'
import {BasePath} from './base-path'
import {Point, Circle} from '../geometry/geometry'


export class CirclePath extends BasePath {

    constructor(circle: Circle) {
        super();
        this.geo_ = circle;
    }

    update() {
        const halfRadius = this.circle().radius() / 2.0;
        this.removeSegments();
        this.moveTo(new PaperPoint(this.circle().center().x(), this.circle().center().y() - halfRadius));
        this.arcTo(new PaperPoint(this.circle().center().x() - halfRadius, this.circle().center().y()),
                    new PaperPoint(this.circle().center().x(), this.circle().center().y() + halfRadius));
        this.arcTo(new PaperPoint(this.circle().center().x() + halfRadius, this.circle().center().y()),
                    new PaperPoint(this.circle().center().x(), this.circle().center().y() - halfRadius));
    }

    protected circle(): Circle {
        return (<Circle> this.geo_);
    }

}
