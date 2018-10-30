import {Path} from 'paper'
import {BasePath} from './base-path'
import {Line, Segment, GeometryType, Arc, Polygon} from '../geometry/geometry'

export class PolygonPath extends BasePath {
    

    constructor(polygon: Polygon) {
        super();
        this.geo_ = polygon;
    }

    update() {
        const segments = this.polygon().segments();
        if (segments.length === 0) {
            return;
        }

        this.removeSegments();
        const lastSegment = segments[segments.length - 1];
        const firstSegment = segments[0];
        const isReversal = lastSegment.endPoint().equal(firstSegment.startPoint());
        const firstPoint = isReversal ? segments[0].startPoint() : segments[1].endPoint();
        this.moveTo(firstPoint.toPaperPoint());
        for (let i = 0; i < segments.length; i++) {
            const point = isReversal ? segments[i].endPoint() : segments[i].startPoint();
            switch (segments[i].type()) {
                case GeometryType.GEO_LINE:                    
                    this.lineTo(point.toPaperPoint());
                    break;
                case GeometryType.GEO_ARC:
                    const arc = <Arc>segments[i];
                    this.arcTo(arc.arcThroughPoint().toPaperPoint(), point.toPaperPoint());
                    break;
                default:
                    break;
            }
        }
    }

    polygon() {
        return <Polygon> this.geo_;
    }
}
