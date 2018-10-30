
import {Path} from 'paper'
import {BasePath} from './base-path'
import {Line} from '../geometry/geometry'

export class LinePath extends BasePath {
    // protected line_: Line;
    constructor(line: Line) {
        super();
        this.geo_ = line;
    }

    update() {
        this.removeSegments();
        this.moveTo(this.line().startPoint().toPaperPoint());
        this.lineTo(this.line().endPoint().toPaperPoint());
    }

    line(): Line {
        return <Line> this.geo_;
    }
}
