import {Path} from 'paper'

import {BaseGeometry,Point} from '../geometry/geometry'
import {Serializable } from '../houselayout/entity/entity'

export enum PathDrawType {
    PATH_DRAW_DEFAULT,
    PATH_DRAW_FILL,
}


export enum PathGeoRelation {
    PATH_RELATION_UNKNOWN = 0, /** 未知， 无法计算 */
    PATH_INTERSECT, /**相交 */
    PATH_NOINTERSECT, /**相离 */
    PATH_INSIDE,  /**包含 */
    PATH_CONTAINS, /**被包含 */    
    PATH_CONSISTOF, /*重叠(小于) */
    PATH_CONSISTING, /*重叠(大于)*/
}

export class GeoRelationInfo {
    relationType: PathGeoRelation;
    crossings_: Array<Point>;

    constructor(relation: PathGeoRelation, points?: Array<Point>) {
        this.relationType = relation;
        if(points) {
            this.crossings_ = points;
        } else {
            this.crossings_ = null;
        }
    }
}


export class BasePath extends Path implements Serializable<BasePath> {
    protected geo_: BaseGeometry;
    protected fillColor_: string;
    protected drawType_: PathDrawType;
    constructor() {
        super();
        // this.strokeColor = '#fff';
        //this.fillColor = 'white';
        this.drawType_ = PathDrawType.PATH_DRAW_DEFAULT;
    }

    setFillColor(color: string) {
        this.fillColor = color;
    }

    setDrawType(drawType: PathDrawType) {
        this.drawType_ = drawType;
    }

    // needs implement
    update(info?: number) {

    }

    serialize() {
        return new Object(this);
    }

    deserialize(input) {
        // if (null !== input.geo_) {
        //     this.geo_ =  new BaseGeometry().deserialize(input.geo_); //  input.type_;
        // }

        this.fillColor_ = input.fillColor_;
        this.drawType_ = input.drawType_;
        this.strokeColor = input.strokeColor;
        this.strokeWidth = input.strokeWidth;
        this.opacity = input.opacity;
        // for (let key in this) {
        //     if (input.hasOwnProperty(key)) {
        //       const strprp = <string>(key);
        //       if (strprp !== 'geo_') {
        //           this[key] = input[key];
        //       }
        //     }
        //   }
        // this.fillColor_ = ;
        // this.drawType_ = input.drawType_;
        // this.strokeColor = input.strokeColor;

        this.update();

        //this.segments =
        return this;
    }


    CalcGeoRelationShip(path: BasePath): PathGeoRelation{
        return PathGeoRelation.PATH_RELATION_UNKNOWN;
    }

    injectinfo(input: Object) {

    }

    setPropertyWithName(name: string, value: number) {

    }


    getPropertyWithName(name: string): number {
              return 0;
    }

    reportinfo(): Object {
        const info = new Object();
        return info;
    }

}
