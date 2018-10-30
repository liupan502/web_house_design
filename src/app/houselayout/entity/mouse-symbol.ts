import {BaseEntity} from './entity'
import {Path, Point as PaperPoint, CompoundPath, } from 'paper'
export class MouseSymbol extends BaseEntity {
    protected radius_: number;
    protected hPath_: Path;
    protected vPath_: Path;
    protected circlePath_: Path.Circle;

    constructor() {
        super();
        this.radius_ = 3;
        // this.path_ = new CompoundPath(null);
        this.hPath_ = new Path();
        this.hPath_.strokeColor = 'black';
        // this.path_.addChild(this.hPath_);
        this.vPath_ = new Path();
        this.vPath_.strokeColor = 'black';
        this.circlePath_ = new Path.Circle(this.position().toPaperPoint(), this.radius_);
        this.circlePath_.strokeColor = 'red';
        // this.path_.addChild(this.vPath_);
    }

    setRadius(radius: number) {
        this.radius_ = radius;
        this.setIsDirty(true);
    }

    protected updatePath() {
        const halfRadius = this.radius_ / 2.0;
        this.circlePath_.position = this.position().toPaperPoint();

        this.vPath_.removeSegments();
        this.vPath_.moveTo(new PaperPoint(this.position().x(), this.position().y() - halfRadius));
        this.vPath_.arcTo(new PaperPoint(this.position().x() - halfRadius, this.position().y() ),
            new PaperPoint(this.position().x(), this.position().y() +  halfRadius ));
        this.vPath_.arcTo(new PaperPoint(this.position().x() + halfRadius, this.position().y()),
            new PaperPoint(this.position().x(), this.position().y() - halfRadius));        
    }
}
