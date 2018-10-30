import * as PathObject from './path';
import * as BaseGeo from '../geometry/geometry';
import { Path, TextItem ,PointText , Point as PaperPoint} from 'paper';
import * as MathUtil from '../math/math'

export class BasePathFactory {
    static CreatePath(geometry: BaseGeo.BaseGeometry): PathObject.BasePath {
        let result = null;

        if (geometry instanceof BaseGeo.Arc) {
            result = new PathObject.ArcPath(geometry);
        } else if (geometry instanceof BaseGeo.Circle) {
            result = new PathObject.CirclePath(geometry);
        } else if (geometry instanceof BaseGeo.Eillpse) {
            result = new PathObject.EillpsePath(geometry);
        } else if (geometry instanceof BaseGeo.Line) {
          result = new PathObject.LinePath(geometry);
        } else if(geometry instanceof BaseGeo.Polygon) {
          result= new PathObject.PolygonPath(geometry);
        } else if(geometry instanceof BaseGeo.Rect) {
          result = new PathObject.RectPath(geometry);
        }


        return result;
    }

    /**
     *
     * @description these pathInfo will always be treated as clockwised here
     * @static
     * @param {PathObject.BasePath} pathInfo
     * @returns {PathObject.MarkerText}
     * @memberof BasePathFactory
     */
    static CreatePathMarkText(geometry: BaseGeo.BaseGeometry, position?: BaseGeo.Point):  PointText{
         let result = null;

         ///
         const resultinf = new PointText(new PaperPoint(0, 0));
//     //         const index = tmpStr.indexOf('.');
    //         // console.log('index is ' + index);
    //         const content = index >=  0 ? tmpStr.substr(0, index) : tmpStr;
    //         this.text_.content = content;
          if (geometry instanceof BaseGeo.Arc) {
              
              resultinf.content = (Math.floor(geometry.length())).toString();
              resultinf.position = (position)? position.toPaperPoint() : (<BaseGeo.Arc>geometry).arcThroughPoint().toPaperPoint();
              resultinf.strokeColor = 'green';
              result = resultinf;
          } else if (geometry instanceof BaseGeo.Circle) {
              resultinf.content =  (Math.floor(geometry.radius())).toString() ; //geometry.radius().toString() 
              resultinf.position = (position)? position.toPaperPoint() : (<BaseGeo.Circle>geometry).center().toPaperPoint();
              resultinf.strokeColor = 'green';
              result = resultinf;
          } else if (geometry instanceof BaseGeo.Eillpse) {
              resultinf.content = geometry.width().toString() 
              resultinf.position = (position)? position.toPaperPoint() :(<BaseGeo.Eillpse>geometry).center().toPaperPoint();
              resultinf.strokeColor = 'green';
              result = resultinf;
          } else if (geometry instanceof BaseGeo.Line) {
              resultinf.content = (Math.floor(geometry.length())).toString();
              resultinf.position = (position)? position.toPaperPoint() :(<BaseGeo.Line>geometry).middlePoint().toPaperPoint();
              resultinf.strokeColor = 'green';
              result = resultinf;
          } else if (geometry instanceof BaseGeo.Point) {
               resultinf.content =  '(' + geometry.x().toString() + ',' + geometry.y().toString() + ')';
               resultinf.position = (position)? position.toPaperPoint(): (<BaseGeo.Point>geometry).toPaperPoint();
               resultinf.strokeColor = 'green';
               result = resultinf;
          }

         return result;
    }
}
