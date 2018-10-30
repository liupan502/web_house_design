import { FlipStatus } from './../entity/opening';
import { Geometry } from 'three';
import {BaseEntityGeometry} from './entity-geometry'
import {Opening, FixedWindowFlag, FloorWindowFlag, BayWindowFlag,
    OneDoorFlag, TwoDoorsFlag, SlidingDoorsFlag, DoorwayFlag } from '../entity/entity'
import { BaseGeometry, Polygon, Rect, Line, Point, Arc} from '../geometry/geometry'
import {BasePath, RectPath, LinePath, PolygonPath} from '../path/path'

export class OpeningGeometry extends BaseEntityGeometry{

    static readonly RECT = 'rect';

    static readonly LINE = 'line';

    constructor(opening: Opening) {
        super(opening);


        /*const rect = new Rect(new Point(0.0, 0.0), opening.width(), opening.height());

        this.geos_.set(OpeningGeometry.RECT, rect);

        const tmpRect = new Rect(new Point(0.0, 0.0), opening.width(), opening.height());


        const line =  new Line(new Point(-length / 2.0, 0), new Point(length / 2.0, 0));
        this.geos_.set(OpeningGeometry.LINE, line);*/
    }


}

/**
 * 固定窗
 */
export class FixedWindowFlagGeometry extends BaseEntityGeometry {
    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(fixedWindowFlag: FixedWindowFlag) {
        super(fixedWindowFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = fixedWindowFlag.width();
        const length = fixedWindowFlag.length();

        //获取width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/800;

        this.tmpGeos_[FixedWindowFlagGeometry.RECT1] = new Rect(new Point(0,-30*widthMultiple), width/2, length);
        this.tmpGeos_[FixedWindowFlagGeometry.RECT2] = new Rect(new Point(0,30*widthMultiple),  width/2, length);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0), width,length);

        this.geos_[FixedWindowFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[FixedWindowFlagGeometry.RECT1]);
        this.geos_[FixedWindowFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[FixedWindowFlagGeometry.RECT2]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);


        (<BasePath>this.geos_[FixedWindowFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FixedWindowFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = '#fff';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;    

     
    }

    protected fixedWindowFlag(): FixedWindowFlag {
        return <FixedWindowFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const width = this.fixedWindowFlag().width();
        const length = this.fixedWindowFlag().length();
        const widthMultiple = width/120;
        const lengthMultiple = length/800;
        const rect1 = <Rect>this.tmpGeos_[FixedWindowFlagGeometry.RECT1];
        rect1.setCenter(new Point(0,-30*widthMultiple));
        rect1.setWidth(width/2);
        rect1.setLength(length);
        const rect2 = <Rect>this.tmpGeos_[FixedWindowFlagGeometry.RECT2];
        rect2.setCenter(new Point(0,30*widthMultiple));
        rect2.setWidth(width/2);
        rect2.setLength(length);
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);
    }
 
    // 获取边界点集合
     getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_[FixedWindowFlagGeometry.RECT1]);
        result.push(this.tmpGeos_[FixedWindowFlagGeometry.RECT2]);

        return result;
    }   
    
    getflipStatus() : FlipStatus {
        return this.fixedWindowFlag().getFlipStatus();
    }    
}

/**
 * 落地窗
 */
export class FloorWindowFlagGeometry extends BaseEntityGeometry {

    static readonly RECT1 = 'rect1';
    static readonly RECT2 = 'rect2';
    static readonly RECT3 = 'rect3';
    static readonly LINE1 = 'line1';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(floorWindowFlag: FloorWindowFlag) {
        super(floorWindowFlag);

        this.tmpGeos_ = new Map<string, BaseGeometry>();

        const width = floorWindowFlag.width();
        const length = floorWindowFlag.height();

        //获取width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        this.tmpGeos_[FloorWindowFlagGeometry.RECT1] = new Rect(new Point(0,-40*widthMultiple+0*40*widthMultiple),
                                width/3, length);
        this.tmpGeos_[FloorWindowFlagGeometry.RECT2] = new Rect(new Point(0,-40*widthMultiple+1*40*widthMultiple),
                                width/3, length);
        this.tmpGeos_[FloorWindowFlagGeometry.RECT3] = new Rect(new Point(0,-40*widthMultiple+2*40*widthMultiple),
                                width/3, length);

        this.tmpGeos_[FloorWindowFlagGeometry.LINE1] = new Line(new Point(0,-20*widthMultiple), new Point(0,20*widthMultiple));

        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length);

        this.geos_[FloorWindowFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[FloorWindowFlagGeometry.RECT1]);
        this.geos_[FloorWindowFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[FloorWindowFlagGeometry.RECT2]);
        this.geos_[FloorWindowFlagGeometry.RECT3] = new RectPath(this.tmpGeos_[FloorWindowFlagGeometry.RECT3]);
        this.geos_[FloorWindowFlagGeometry.LINE1] = new LinePath(this.tmpGeos_[FloorWindowFlagGeometry.LINE1]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[FloorWindowFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorWindowFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorWindowFlagGeometry.RECT3]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorWindowFlagGeometry.LINE1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

        // const geoArray = new Array<BaseGeometry>();
        // geoArray.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT1]);
        // geoArray.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT2]);
        // geoArray.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT3]);
        // geoArray.push(this.tmpGeos_[FloorWindowFlagGeometry.LINE1]);
        // this.geos_[TwoDoorsGFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //   'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg',length,width);        
    }

    protected floorWindowFlag(): FloorWindowFlag {
        return <FloorWindowFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const length = this.floorWindowFlag().length();
        const width = this.floorWindowFlag().width();

        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        const rectNameArray = [FloorWindowFlagGeometry.RECT1,
            FloorWindowFlagGeometry.RECT2,
            FloorWindowFlagGeometry.RECT3];

        for(let i=0;i<3;i++) {
            const rectArry = new Array;
            rectArry[i] = <Rect>this.tmpGeos_[rectNameArray[i]];
            rectArry[i].setCenter(new Point(0,-40*widthMultiple+i*40*widthMultiple));
            rectArry[i].setWidth(width/3);
            rectArry[i].setLength(length);
        }
        const line1 = <Line>this.tmpGeos_['line1'];
        line1.setStartPoint(new Point(0,-20*widthMultiple));
        line1.setEndPoint(new Point(0,20*widthMultiple));
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);
    }

      getOuterGeos(): Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT1]);
        result.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT2]);
        result.push(this.tmpGeos_[FloorWindowFlagGeometry.RECT3]);
        result.push(this.tmpGeos_[FloorWindowFlagGeometry.LINE1]);

        return result;
     }

     getflipStatus() : FlipStatus {
        return this.floorWindowFlag().getFlipStatus();
    }    

}

/**
 * 飘窗
 */
export class BayWindowFlagGeometry extends BaseEntityGeometry {
    static readonly POLYGON1 = 'polygon1';

    static readonly POLYGON2 = 'polygon2';

    static readonly RECT = 'rect';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(bayWindowFlag: BayWindowFlag) {
        super(bayWindowFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = bayWindowFlag.width();
        const length = bayWindowFlag.length();
        const depth = bayWindowFlag.depth();

        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/800;
        const depthMultiple = depth/380;

        this.tmpGeos_[BayWindowFlagGeometry.POLYGON1] = new Polygon(
            [new Line(new Point(-(12+length/2),-(depth+12+width/2)),new Point(12+length/2,-(depth+12+width/2))),
            new Line(new Point(12+length/2,-(depth+12+width/2)),new Point(12+length/2,-width/2)),
            new Line(new Point(12+length/2,-width/2),new Point(6+length/2,-width/2)),
            new Line(new Point(6+length/2,-width/2),new Point(6+length/2,-(depth+width/2+6))),
            new Line(new Point(6+length/2,-(depth+width/2+6)),new Point(-(6+length/2),-(depth+width/2+6))),
            new Line(new Point(-(6+length/2),-(depth+width/2+6)),new Point(-(6+length/2),-width/2)),
            new Line(new Point(-(6+length/2),-width/2),new Point(-(12+length/2),-width/2)),
            new Line(new Point(-(12+length/2),-width/2),new Point(-(12+length/2),-(depth+12+width/2)))]);
        this.tmpGeos_[BayWindowFlagGeometry.POLYGON2] = new Polygon(
            [new Line(new Point(-(6+length/2),-(depth+6+width/2)),new Point(6+length/2,-(depth+6+width/2))),
            new Line(new Point(6+length/2,-(depth+6+width/2)),new Point(6+length/2,-width/2)),
            new Line(new Point(6+length/2,-width/2),new Point(length/2,-width/2)),
            new Line(new Point(length/2,-width/2),new Point(length/2,-(depth+width/2))),
            new Line(new Point(length/2,-(depth+width/2)),new Point(-length/2,-(depth+width/2))),
            new Line(new Point(-length/2,-(depth+width/2)),new Point(-length/2,-width/2)),
            new Line(new Point(-length/2,-width/2),new Point(-(6+length/2),-width/2)),
            new Line(new Point(-(6+length/2),-width/2),new Point(-(6+length/2),-(depth+6+width/2)))]);
        this.tmpGeos_[BayWindowFlagGeometry.RECT] = new Rect(new Point(0,-190*depthMultiple), width+depth, length);

        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,-190*depthMultiple-6),width+depth+12,length+24);

        this.geos_[BayWindowFlagGeometry.POLYGON1] = new PolygonPath(this.tmpGeos_[BayWindowFlagGeometry.POLYGON1]);
        this.geos_[BayWindowFlagGeometry.POLYGON2] = new PolygonPath(this.tmpGeos_[BayWindowFlagGeometry.POLYGON2]);
        this.geos_[BayWindowFlagGeometry.RECT] = new RectPath(this.tmpGeos_[BayWindowFlagGeometry.RECT]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        const geoArray = new Array<BaseGeometry>();


        // geoArray.push(this.tmpGeos_[BayWindowFlagGeometry.POLYGON1]);
        // geoArray.push(this.tmpGeos_[BayWindowFlagGeometry.POLYGON2]);
        // geoArray.push(this.tmpGeos_[BayWindowFlagGeometry.RECT]);
 
        //  this.geos_[TwoDoorsGFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //    'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg');


        (<BasePath>this.geos_[BayWindowFlagGeometry.POLYGON1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[BayWindowFlagGeometry.POLYGON2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[BayWindowFlagGeometry.RECT]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

    }

    protected bayWindowFlag(): BayWindowFlag {
        return <BayWindowFlag> this.refEntity_;
    }

    updateGeometry() {

        const length = this.bayWindowFlag().length();
        const width = this.bayWindowFlag().width();
        const depth = this.bayWindowFlag().depth();
        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/800;
        const depthMultiple = depth/380;
        const polygon1 = <Polygon> this.tmpGeos_[BayWindowFlagGeometry.POLYGON1];
        const segments1 = polygon1.segments();
        segments1[0].setStartPoint(new Point(-(12+length/2),-(depth+12+width/2)));
        segments1[0].setEndPoint(new Point(12+length/2,-(depth+12+width/2)));
        segments1[1].setStartPoint(new Point(12+length/2,-(depth+12+width/2)));
        segments1[1].setEndPoint(new Point(12+length/2,-width/2));
        segments1[2].setStartPoint(new Point(12+length/2,-width/2));
        segments1[2].setEndPoint(new Point(6+length/2,-width/2));
        segments1[3].setStartPoint(new Point(6+length/2,-width/2));
        segments1[3].setEndPoint(new Point((6+length/2),-(depth+width/2+6)));
        segments1[4].setStartPoint(new Point((6+length/2),-(depth+width/2+6)));
        segments1[4].setEndPoint(new Point(-(6+length/2),-(depth+width/2+6)));
        segments1[5].setStartPoint(new Point(-(6+length/2),-(depth+width/2+6)));
        segments1[5].setEndPoint(new Point(-(6+length/2),-width/2));
        segments1[6].setStartPoint(new Point(-(6+length/2),-width/2));
        segments1[6].setEndPoint(new Point(-(12+length/2),-width/2));
        segments1[7].setStartPoint(new Point(-(12+length/2),-width/2));
        segments1[7].setEndPoint(new Point(-(12+length/2),-(depth+12+width/2)));
        const polygon2 = <Polygon> this.tmpGeos_[BayWindowFlagGeometry.POLYGON2];
        const segments2 = polygon2.segments();
        segments2[0].setStartPoint(new Point(-(6+length/2),-(depth+6+width/2)));
        segments2[0].setEndPoint(new Point(6+length/2,-(depth+6+width/2)));
        segments2[1].setStartPoint(new Point(6+length/2,-(depth+6+width/2)));
        segments2[1].setEndPoint(new Point(6+length/2,-width/2));
        segments2[2].setStartPoint(new Point(6+length/2,-width/2));
        segments2[2].setEndPoint(new Point(length/2,-width/2));
        segments2[3].setStartPoint(new Point(length/2,-width/2));
        segments2[3].setEndPoint(new Point(length/2,-(depth+width/2)));
        segments2[4].setStartPoint(new Point(length/2,-(depth+width/2)));
        segments2[4].setEndPoint(new Point(-length/2,-(depth+width/2)));
        segments2[5].setStartPoint(new Point(-length/2,-(depth+width/2)));
        segments2[5].setEndPoint(new Point(-length/2,-width/2));
        segments2[6].setStartPoint(new Point(-length/2,-width/2));
        segments2[6].setEndPoint(new Point(-(6+length/2),-width/2));
        segments2[7].setStartPoint(new Point(-(6+length/2),-width/2));
        segments2[7].setEndPoint(new Point(-(6+length/2),-(depth+6+width/2)));
        const rect = <Rect>this.tmpGeos_[BayWindowFlagGeometry.RECT];
        rect.setCenter(new Point(0,-190*depthMultiple));
        rect.setWidth(width+depth);
        rect.setLength(length);

        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setCenter(new Point(0,-190*depthMultiple-6));
        tmpRect.setWidth(width+depth+12);
        tmpRect.setLength(length+24);
    }

      getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_[BayWindowFlagGeometry.POLYGON1]);
        result.push(this.tmpGeos_[BayWindowFlagGeometry.POLYGON2]);
        result.push(this.tmpGeos_[BayWindowFlagGeometry.RECT]);

        return result;
    }

    getflipStatus() : FlipStatus {
        return this.bayWindowFlag().getFlipStatus();
    }    
}

/**
 * 单开门
 */
export class OneDoorFlagGeometry extends BaseEntityGeometry {
    static readonly POLYGON1 = 'polygon1';

    static readonly POLYGON2 = 'polygon2';

    static readonly RECT = 'rect';

    static readonly BACKGroundImg = 'backgroundimage';


    protected startori: Point;

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(oneDoorFlag: OneDoorFlag) {
        super(oneDoorFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = oneDoorFlag.width();
        const length =  oneDoorFlag.length();
        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/900;


        this.startori = new Point(0,0);

        this.tmpGeos_[OneDoorFlagGeometry.POLYGON1] = new Polygon([
            new Arc(new Point(-380*lengthMultiple,-(960*lengthMultiple-width/2)),new Point(length/2,-60*widthMultiple),new Point(-600*lengthMultiple,180*lengthMultiple),),
            new Line(new Point(length/2,-60*widthMultiple),new Point(-380*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(-380*lengthMultiple,-60*widthMultiple), new Point(-380*lengthMultiple,-(960*lengthMultiple-width/2)))]);

        this.tmpGeos_[OneDoorFlagGeometry.POLYGON2] = new Polygon([
            new Line(new Point(-450*lengthMultiple,0*widthMultiple),new Point(-380*lengthMultiple,0*widthMultiple)),
            new Line(new Point(-380*lengthMultiple,0*widthMultiple),new Point(-380*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(-380*lengthMultiple,-60*widthMultiple), new Point(length/2,-60*widthMultiple)),
            new Line(new Point(length/2,-60*widthMultiple), new Point(length/2,60*widthMultiple)),
            new Line( new Point(length/2,60*widthMultiple),new Point(-450*lengthMultiple,60*widthMultiple)),
            new Line(new Point(-450*lengthMultiple,60*widthMultiple), new Point(-450*lengthMultiple,0*widthMultiple)),]);

        this.tmpGeos_[OneDoorFlagGeometry.RECT] = new Rect(new Point(-415*lengthMultiple,-(960*lengthMultiple-width/2)/2),960*lengthMultiple-width/2, 70*lengthMultiple);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,-960*lengthMultiple/2+width/2),960*lengthMultiple, length);

        this.geos_[OneDoorFlagGeometry.POLYGON1] = new PolygonPath(this.tmpGeos_[OneDoorFlagGeometry.POLYGON1]);
        this.geos_[OneDoorFlagGeometry.POLYGON2] = new PolygonPath(this.tmpGeos_[OneDoorFlagGeometry.POLYGON2]);
        this.geos_[OneDoorFlagGeometry.RECT] = new RectPath(this.tmpGeos_[OneDoorFlagGeometry.RECT]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[OneDoorFlagGeometry.POLYGON1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[OneDoorFlagGeometry.POLYGON2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[OneDoorFlagGeometry.RECT]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
        
        // const geoArray = new Array<BaseGeometry>();
        // geoArray.push(this.tmpGeos_[OneDoorFlagGeometry.POLYGON1]);
        // geoArray.push(this.tmpGeos_[OneDoorFlagGeometry.POLYGON2]);
        // geoArray.push(this.tmpGeos_[OneDoorFlagGeometry.RECT]);

        // this.geos_[OneDoorFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //   'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg');



    }

    protected oneDoorFlag(): OneDoorFlag {
        return <OneDoorFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.oneDoorFlag().width();
        const length = this.oneDoorFlag().length();

        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/900;

        const polygon1 = <Polygon> this.tmpGeos_[OneDoorFlagGeometry.POLYGON1];
        const segments1 = polygon1.segments();
        const arc1 = <Arc> segments1[0];
        arc1.setStartPoint(new Point(-380*lengthMultiple,-(960*lengthMultiple-width/2)));
        arc1.setEndPoint(new Point(length/2,-60*widthMultiple));
        arc1.setCenter(new Point(-600*lengthMultiple,180*lengthMultiple));
        segments1[1].setStartPoint(new Point(length/2,-60*widthMultiple));
        segments1[1].setEndPoint(new Point(-380*lengthMultiple,-60*widthMultiple));
        segments1[2].setStartPoint(new Point(-380*lengthMultiple,-60*widthMultiple));
        segments1[2].setEndPoint(new Point(-380*lengthMultiple,-(960*lengthMultiple-width/2)));
        const rect = <Rect>this.tmpGeos_[OneDoorFlagGeometry.RECT];
        rect.setCenter(new Point(-415*lengthMultiple,-(960*lengthMultiple-width/2)/2));
        rect.setWidth(960*lengthMultiple-width/2);
        rect.setLength(70*lengthMultiple);




        const polygon2 = <Polygon> this.tmpGeos_[OneDoorFlagGeometry.POLYGON2];
        const segments2 = polygon2.segments();
        segments2[0].setStartPoint(new Point(-450*lengthMultiple,0*widthMultiple));
        segments2[0].setEndPoint(new Point(-380*lengthMultiple,0*widthMultiple));
        segments2[1].setStartPoint(new Point(-380*lengthMultiple,0*widthMultiple));
        segments2[1].setEndPoint(new Point(-380*lengthMultiple,-60*widthMultiple));
        segments2[2].setStartPoint(new Point(-380*lengthMultiple,-60*widthMultiple));
        segments2[2].setEndPoint( new Point(length/2,-60*widthMultiple));
        segments2[3].setStartPoint( new Point(length/2,-60*widthMultiple));
        segments2[3].setEndPoint(new Point(length/2,60*widthMultiple));
        segments2[4].setStartPoint(new Point(length/2,60*widthMultiple));
        segments2[4].setEndPoint(new Point(-450*lengthMultiple,60*widthMultiple));
        segments2[5].setStartPoint(new Point(-450*lengthMultiple,60*widthMultiple));
        segments2[5].setEndPoint(new Point(-450*lengthMultiple,0*widthMultiple));
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setCenter(new Point(0,-960*lengthMultiple/2+width/2));
        tmpRect.setWidth(960*lengthMultiple);
        tmpRect.setLength(length);
      
    }


    getflipStatus() : FlipStatus {
        return this.oneDoorFlag().getFlipStatus();
    }

      getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_[OneDoorFlagGeometry.POLYGON1]);
        result.push(this.tmpGeos_[OneDoorFlagGeometry.POLYGON2]);
        result.push(this.tmpGeos_[OneDoorFlagGeometry.RECT]);

        return result;
    }
}

/**
 * 双开门
 */
export class TwoDoorsGFlagGeometry extends BaseEntityGeometry {

    static readonly POLYGON1 = 'polygon1';

    static readonly POLYGON2 = 'polygon2';

    static readonly POLYGON3 = 'polygon3';

    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    static readonly BACKGroundImg = 'backgroundimage';


    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(twoDoorsFlag: TwoDoorsFlag) {
        super(twoDoorsFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();

        const width = twoDoorsFlag.width();
        const length = twoDoorsFlag.length();
        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON1] = new Polygon([
            new Arc(new Point(-680*lengthMultiple,-(810*lengthMultiple-width/2)),new Point(0,-60*widthMultiple),
            new Point(-800*lengthMultiple,-45*lengthMultiple),),
            new Line(new Point(0,-60*widthMultiple),new Point(-680*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(-680*lengthMultiple,-60*widthMultiple), new Point(-680*lengthMultiple,-(810*lengthMultiple-width/2)))]);

        this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON2] = new Polygon([
            new Arc(new Point(0,-60*widthMultiple),new Point(680*lengthMultiple,-(810*lengthMultiple-width/2)),
            new Point(500*lengthMultiple,-45*lengthMultiple),),
            new Line(new Point(680*lengthMultiple,-(810*lengthMultiple-width/2)),new Point(680*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(680*lengthMultiple,-60*widthMultiple), new Point(0,-60*widthMultiple))]);

        this.tmpGeos_[TwoDoorsGFlagGeometry.RECT1] = new Rect(new Point(-715*lengthMultiple,-(810*lengthMultiple-width/2)/2),
        810*lengthMultiple-width/2, 70*lengthMultiple);
        this.tmpGeos_[TwoDoorsGFlagGeometry.RECT2] = new Rect(new Point(715*lengthMultiple,-(810*lengthMultiple-width/2)/2),
         810*lengthMultiple-width/2, 70*lengthMultiple);

        this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON3] = new Polygon([
            new Line(new Point(-750*lengthMultiple,0*widthMultiple),new Point(-680*lengthMultiple,0*widthMultiple)),
            new Line(new Point(-680*lengthMultiple,0*widthMultiple),new Point(-680*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(-680*lengthMultiple,-60*widthMultiple),new Point(680*lengthMultiple,-60*widthMultiple)),
            new Line(new Point(680*lengthMultiple,-60*widthMultiple),new Point(680*lengthMultiple,0*widthMultiple)),
            new Line(new Point(680*lengthMultiple,0*widthMultiple), new Point(length/2,0*widthMultiple)),
            new Line(new Point(length/2,0*widthMultiple), new Point(length/2,60*widthMultiple)),
            new Line( new Point(length/2,60*widthMultiple),new Point(-750*lengthMultiple,60*widthMultiple)),
            new Line(new Point(-750*lengthMultiple,60*widthMultiple), new Point(-750*lengthMultiple,0*widthMultiple)), ]);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,-810*lengthMultiple/2+width/2),  810*lengthMultiple, length);

        this.geos_[TwoDoorsGFlagGeometry.POLYGON1] = new PolygonPath(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON1]);
        this.geos_[TwoDoorsGFlagGeometry.POLYGON2] = new PolygonPath(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON2]);
        this.geos_[TwoDoorsGFlagGeometry.POLYGON3] = new PolygonPath(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON3]);
        this.geos_[TwoDoorsGFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT1]);
        this.geos_[TwoDoorsGFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT2]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);


        // const geoArray = new Array<BaseGeometry>();
        // geoArray.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON1]);
        // geoArray.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON2]);
        // geoArray.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON3]);
        // geoArray.push(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT1]);
        // geoArray.push(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT2]);
        // this.geos_[TwoDoorsGFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //   'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg'
        //   ,150,150);



        /// END!!!


        (<BasePath>this.geos_[TwoDoorsGFlagGeometry.POLYGON1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[TwoDoorsGFlagGeometry.POLYGON2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[TwoDoorsGFlagGeometry.POLYGON3]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[TwoDoorsGFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[TwoDoorsGFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected twoDoorsFlag(): TwoDoorsFlag {
        return <TwoDoorsFlag> this.refEntity_;
    }

    getflipStatus() : FlipStatus {
        return this.twoDoorsFlag().getFlipStatus();
    }

    protected updateGeometry() {

        const width = this.twoDoorsFlag().width();
        const length = this.twoDoorsFlag().length();
        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        const polygon1 = <Polygon> this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON1];
        const segments1 = polygon1.segments();
        const arc1 = <Arc> segments1[0];
        arc1.setStartPoint(new Point(-680*lengthMultiple,-(810*lengthMultiple-width/2)));
        arc1.setEndPoint(new Point(0,-60*widthMultiple));
        arc1.setCenter(new Point(-800*lengthMultiple,-45*lengthMultiple));
        segments1[1].setStartPoint(new Point(0,-60*widthMultiple));
        segments1[1].setEndPoint(new Point(-680*lengthMultiple,-60*widthMultiple));
        segments1[2].setStartPoint(new Point(-680*lengthMultiple,-60*widthMultiple));
        segments1[2].setEndPoint(new Point(-680*lengthMultiple,-(810*lengthMultiple-width/2)));
        const polygon2 = <Polygon> this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON2];
        const segments2 = polygon2.segments();
        const arc2 = <Arc> segments2[0];
        arc2.setStartPoint(new Point(0,-60*widthMultiple));
        arc2.setEndPoint(new Point(680*lengthMultiple,-(810*lengthMultiple-width/2)));
        arc2.setCenter(new Point(500*lengthMultiple,-45*lengthMultiple));
        segments2[1].setStartPoint(new Point(680*lengthMultiple,-(810*lengthMultiple-width/2)));
        segments2[1].setEndPoint(new Point(680*lengthMultiple,-60*widthMultiple));
        segments2[2].setStartPoint(new Point(680*lengthMultiple,-60*widthMultiple));
        segments2[2].setEndPoint(new Point(0,-60*widthMultiple));
        const rect1 = <Rect>this.tmpGeos_[TwoDoorsGFlagGeometry.RECT1];
        rect1.setCenter(new Point(-715*lengthMultiple,-(810*lengthMultiple-width/2)/2));
        rect1.setWidth(810*lengthMultiple-width/2);
        rect1.setLength(70*lengthMultiple);
        const rect2 = <Rect>this.tmpGeos_[TwoDoorsGFlagGeometry.RECT2];
        rect2.setCenter(new Point(715*lengthMultiple,-(810*lengthMultiple-width/2)/2));
        rect2.setWidth(810*lengthMultiple-width/2);
        rect2.setLength(70*lengthMultiple);
        const polygon3 = <Polygon> this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON3];
        const segments3 = polygon3.segments();
        segments3[0].setStartPoint(new Point(-750*lengthMultiple,0*widthMultiple));
        segments3[0].setEndPoint(new Point(-680*lengthMultiple,0*widthMultiple));
        segments3[1].setStartPoint(new Point(-680*lengthMultiple,0*widthMultiple));
        segments3[1].setEndPoint(new Point(-680*lengthMultiple,-60*widthMultiple));
        segments3[2].setStartPoint(new Point(-680*lengthMultiple,-60*widthMultiple));
        segments3[2].setEndPoint(new Point(680*lengthMultiple,-60*widthMultiple));
        segments3[3].setStartPoint(new Point(680*lengthMultiple,-60*widthMultiple));
        segments3[3].setEndPoint(new Point(680*lengthMultiple,0*widthMultiple));
        segments3[4].setStartPoint(new Point(680*lengthMultiple,0*widthMultiple));
        segments3[4].setEndPoint(new Point(length/2,0*widthMultiple));
        segments3[5].setStartPoint(new Point(length/2,0*widthMultiple));
        segments3[5].setEndPoint(new Point(length/2,60*widthMultiple));
        segments3[6].setStartPoint(new Point(length/2,60*widthMultiple));
        segments3[6].setEndPoint(new Point(-750*lengthMultiple,60*widthMultiple));
        segments3[7].setStartPoint(new Point(-750*lengthMultiple,60*widthMultiple));
        segments3[7].setEndPoint(new Point(-750*lengthMultiple,0*widthMultiple));
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setCenter(new Point(0,-810*lengthMultiple/2+width/2));
        tmpRect.setWidth(810*lengthMultiple);
        tmpRect.setLength(length);
    }

      getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON1]);
        result.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON2]);
        result.push(this.tmpGeos_[TwoDoorsGFlagGeometry.POLYGON3]);
        result.push(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT1]);        
        result.push(this.tmpGeos_[TwoDoorsGFlagGeometry.RECT2]);    

        return result;
    }     
}

/**
 * 推拉门
 */
export class SlidingDoorsFlagGeometry extends BaseEntityGeometry {
    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    static readonly RECT3 = 'rect3';
    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(slidingDoorsFlag: SlidingDoorsFlag) {
        super(slidingDoorsFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width =  slidingDoorsFlag.width();
        const length = slidingDoorsFlag.length();

        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        this.tmpGeos_[SlidingDoorsFlagGeometry.RECT1] = new Rect(new Point(0,0),  width, length);
        this.tmpGeos_[SlidingDoorsFlagGeometry.RECT2] = new Rect(new Point(lengthMultiple*(-237),widthMultiple*(-15)),widthMultiple*(30),lengthMultiple*1000);
        this.tmpGeos_[SlidingDoorsFlagGeometry.RECT3] = new Rect(new Point(lengthMultiple*237,widthMultiple*15), widthMultiple*(30),lengthMultiple*1000);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length);

        this.geos_[SlidingDoorsFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT1]);
        this.geos_[SlidingDoorsFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT2]);
        this.geos_[SlidingDoorsFlagGeometry.RECT3] = new RectPath(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT3]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[SlidingDoorsFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[SlidingDoorsFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[SlidingDoorsFlagGeometry.RECT3]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

        // const geoArray = new Array<BaseGeometry>();
        // geoArray.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT1]);
        // geoArray.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT2]);
        // geoArray.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT3]);

        // this.geos_[OneDoorFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //   'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg');
    }

    protected slidingDoorsFlag(): SlidingDoorsFlag{
        return <SlidingDoorsFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.slidingDoorsFlag().width();
        const length = this.slidingDoorsFlag().length();
        //获取的width和length相对于原模型的倍数
        const widthMultiple = width/120;
        const lengthMultiple = length/1500;

        const rect1 = <Rect>this.tmpGeos_[SlidingDoorsFlagGeometry.RECT1];
        rect1.setWidth(width);
        rect1.setLength(length);
        const rect2 = <Rect>this.tmpGeos_[SlidingDoorsFlagGeometry.RECT2];
        rect2.setCenter(new Point(lengthMultiple*(-237),widthMultiple*(-15)));
        rect2.setWidth(widthMultiple*30);
        rect2.setLength(lengthMultiple*1000);
        const rect3 = <Rect>this.tmpGeos_[SlidingDoorsFlagGeometry.RECT3];
        rect3.setCenter(new Point(lengthMultiple*237,widthMultiple*15));
        rect3.setWidth(widthMultiple*30);
        rect3.setLength(lengthMultiple*1000);
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);
    }

    getflipStatus() : FlipStatus {
        return this.slidingDoorsFlag().getFlipStatus();
    }    

      getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT1]);
        result.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT2]);
        result.push(this.tmpGeos_[SlidingDoorsFlagGeometry.RECT3]);

        return result;
    }    
}

export class DoorwayFlagGeometry extends BaseEntityGeometry {

    static readonly RECT = 'rect';

    static readonly LINE = 'line';
    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(doorWayFlag: DoorwayFlag) {
        super(doorWayFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = doorWayFlag.width();
        const length = doorWayFlag.length();
        this.tmpGeos_['rect'] = new Rect(new Point(0.0, 0.0), width, length);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0.0, 0.0), width, length);
        this.tmpGeos_['line'] = new Line(new Point(-length / 2.0, 0), new Point(length / 2.0, 0));


        this.geos_['rect'] = new RectPath(this.tmpGeos_['rect']);
        this.geos_['line'] = new LinePath(this.tmpGeos_['line']);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_['rect']).style.strokeColor = '#333843';
        (<BasePath>this.geos_['line']).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

        // const geoArray = new Array<BaseGeometry>();
        // geoArray.push(this.tmpGeos_['rect']);
        // geoArray.push(this.tmpGeos_['line']);


        // this.geos_[OneDoorFlagGeometry.BACKGroundImg] = new ImagePath(geoArray,
        //   'http://img1.bmlink.com/big/default/2012/6/11/15/421136796670564.jpg');       
    }

    getflipStatus() : FlipStatus {
        return (<DoorwayFlag>this.refEntity()).getFlipStatus();
    }

     getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();

        result.push(this.tmpGeos_['rect']);
        result.push(this.tmpGeos_['line']);

        return result;
    }   
}
