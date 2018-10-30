import {Path} from 'paper'
import {BasePath, PathDrawType} from './base-path'
import {Point, Arc} from '../geometry/geometry'

export class ArcPath extends BasePath {
    constructor(arc: Arc) {
        super();
        this.geo_ = arc;
    }

    update() {
        this.removeSegments();
        if (this.drawType_ === PathDrawType.PATH_DRAW_DEFAULT) {
            this.moveTo(this.arc().startPoint().toPaperPoint());
            this.arcTo(this.arc().arcThroughPoint().toPaperPoint(),
                    this.arc().endPoint().toPaperPoint());
        } else if (this.drawType_ === PathDrawType.PATH_DRAW_FILL) {
            this.strokeColor = '';
            this.moveTo(this.arc().center().toPaperPoint());
            this.lineTo(this.arc().startPoint().toPaperPoint());
            this.arcTo(this.arc().arcThroughPoint().toPaperPoint(),
            this.arc().endPoint().toPaperPoint());
            this.lineTo(this.arc().center().toPaperPoint());
        }

    }

    arc(): Arc {
        return <Arc>this.geo_;
    }
}