import * as Paper from 'paper';
import * as BaseGeo from '../geometry/geometry';
import * as GeoPath from './path';
import { BasePath } from './base-path';
import { BaseGeometry, Line, Arc} from '../geometry/geometry';
import { BaseTextPath } from './text-path';
import { Matrix } from 'paper';
import { BasePathFactory } from './path-factory';
import { style } from '@angular/animations';
import * as MathUtil from '../math/math'

/**
 * @description mark text处理直线（长度），曲线（长度），圆形（半径），椭圆（长短半轴），点（位置）
 *              PolyGon不处理（可以看作是直线曲线集合)
 *              
 * @export
 * @class MarkerText
 * @extends {BaseTextPath}
 */
export class MarkerText extends BaseTextPath {
    protected textitem_: Paper.PointText;
    constructor(geo: BaseGeo.BaseGeometry) {
        super(geo, 'marker');
        this.textitem_ = null;
        // this.textitem_ = BasePathFactory.CreatePathMarkText(this.geo_);
        
    }

    get style() {return this.textitem_.style; }

    set style(styleinfo: Paper.Style) { this.textitem_.style = styleinfo; }

    transform(matrix: Matrix) {
    //     this.textitem_.position = new Paper.Point(0, 0);
    //     this.textitem_.rotation =  0;
    //     const selfmatrix = matrix.clone();
    //     if(this.geo_ instanceof Line) {
    //        const  markpoint = MathUtil.findalign(this.geo_.middlePoint(), this.geo_.endPoint(),10,10,true);
    //        if(markpoint !== null) {
    //            selfmatrix.tx = markpoint.x();
    //            selfmatrix.ty = markpoint.y();
    //        }
           
    //    }    
    //     this.textitem_.transform(matrix);
    }

    remove(): boolean{
        if(this.textitem_ !== null) {
            this.textitem_.remove();
        }
        return true;
    }

    protected generateTextPath() {
       // 根据几何信息生成标注
        let markpoint = null;
        if(this.geo_ instanceof Line) {
             markpoint = MathUtil.findalign(this.geo_.middlePoint(), this.geo_.endPoint(),10,10,false);
        }

        if(this.geo_ instanceof Arc) {
             markpoint = MathUtil.moveTowardsPoint(this.geo_.arcThroughPoint(),this.geo_.center(),10);
        }

        this.textitem_ = BasePathFactory.CreatePathMarkText(this.geo_,markpoint);
    }

    update() {
        // 生成标注
        if(this.textitem_ !== null) {
            this.textitem_.remove();
        }
        this.generateTextPath();
    }
}
