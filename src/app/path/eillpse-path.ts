
import { Path, Point as PaperPoint, Size} from 'paper'
import { BasePath } from './base-path'
import * as Geo from '../geometry/geometry'

export class EillpsePath extends BasePath {

    constructor(eillpse: Geo.Eillpse) {
        super();
        this.geo_ = eillpse;
    }

    update() {
        // this.removeSegments();
        // const cp = this.eillpse().center();
        // const halfWidth = this.eillpse().width() / 2;
        // const halfHeight = this.eillpse().height() / 2;
        // this.removeSegments();
        // this.moveTo(new PaperPoint(cp.x() - halfWidth, cp.y()));
        // this.arcTo(new PaperPoint(cp.x(), cp.y() + halfHeight),
        //             new PaperPoint(cp.x() + halfWidth, cp.y()));
        // this.arcTo(new PaperPoint(cp.x(), cp.y() - halfHeight),
        //             new PaperPoint(cp.x() - halfWidth, cp.y()));
    }

    eillpse(): Geo.Eillpse {
        return <Geo.Eillpse> this.geo_;
    }
}
