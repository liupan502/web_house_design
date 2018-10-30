import * as Paper from 'paper';
import * as BaseGeo from '../geometry/geometry';
import * as GeoPath from './path';
import { BaseGeometry } from '../geometry/base';
import { Matrix } from 'paper';

/**
 * use geo to find where the text should be
 *
 * @export
 * @class BaseTextPath
 * @extends {GeoPath.BasePath}
 */
export class BaseTextPath extends GeoPath.BasePath {
    protected text_: string;
    protected geo_: BaseGeometry;
    constructor(geo: BaseGeometry, text: string) {
        super();
        this.text_ = text;
        this.geo_ = geo;
    }

    transform(matrix: Matrix) {

    }

    remove(): boolean {
       return true;
    }

    update() {

    }

}
