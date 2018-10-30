import { RectPath } from './../path/rect-path';
import {BaseEntityGeometry} from './base'
import {Line, Rect} from '../geometry/geometry'
import {Style} from 'paper'
import {LinePath} from '../path/path'


export class AuxilityLineGeometry extends BaseEntityGeometry{
    constructor(line: Line) {
        super(null);
        this.geos_['line'] = new LinePath(line);

    }

    style(): Style{
        if (this.geos_['line'] !== null) {
            return (<LinePath>this.geos_['line']).style;
        }
        return null;
    }
}

export class AuxliityRectGeometry extends BaseEntityGeometry{
    constructor(rect: Rect){
        super(null);
        this.geos_['rect'] = new RectPath(rect);
    }

    style(): Style {
        if(this.geos_['rect'] !== null) {
            return (<RectPath>this.geos_['rect']).style;
        }
    }
}


