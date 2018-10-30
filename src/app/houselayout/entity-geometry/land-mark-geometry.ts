import {BaseEntityGeometry} from './entity-geometry'
import {FloorDrainlFlag, UphillFlag,  PipelienFlag} from '../entity/entity'
import {Rect, Polygon, Line, Point, Circle, BaseGeometry} from '../geometry/geometry'
import {BasePath,RectPath, LinePath,CirclePath, PolygonPath} from '../path/path'

/**
 * 地漏
 */
export class FloorDrainFlagGeometry extends BaseEntityGeometry {
    static readonly CIRCLE = 'circle';

    static readonly LINE1 = 'line1';

    static readonly LINE2 = 'line2';

    static readonly LINE3 = 'line3';

    static readonly LINE4 = 'line4';

    static readonly LINE5 = 'line5';

    static readonly LINE6 = 'line6';

    protected tmpGeos_: Map<string, BaseGeometry> = null;

    constructor(floorDrainFlag: FloorDrainlFlag) {
        super(floorDrainFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const radius = floorDrainFlag.radius();

        this.tmpGeos_[FloorDrainFlagGeometry.CIRCLE] = new Circle(new Point(0,0), radius);
        this.tmpGeos_[FloorDrainFlagGeometry.LINE1] = new Line(new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))), new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        this.tmpGeos_[FloorDrainFlagGeometry.LINE2] = new Line(new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))), new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        this.tmpGeos_[FloorDrainFlagGeometry.LINE3] = new Line(new Point((22/50)*radius/2-radius/2,Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))), new Point(Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),(22/50)*radius/2-radius/2));
        this.tmpGeos_[FloorDrainFlagGeometry.LINE4] = new Line(new Point(-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),(78/50)*radius/2-radius/2), new Point((78/50)*radius/2-radius/2,-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        this.tmpGeos_[FloorDrainFlagGeometry.LINE5] = new Line(new Point(-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),(22/50)*radius/2-radius/2), new Point((78/50)*radius/2-radius/2,Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        this.tmpGeos_[FloorDrainFlagGeometry.LINE6] = new Line(new Point((22/50)*radius/2-radius/2,-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))), new Point(Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),(78/50)*radius/2-radius/2));

        this.tmpGeos_['tmpCircle'] = new Circle(new Point(0,0), radius);
        

        this.geos_[FloorDrainFlagGeometry.CIRCLE] = new CirclePath(this.tmpGeos_[FloorDrainFlagGeometry.CIRCLE]);
        this.geos_[FloorDrainFlagGeometry.LINE1] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE1]);
        this.geos_[FloorDrainFlagGeometry.LINE2] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE2]);
        this.geos_[FloorDrainFlagGeometry.LINE3] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE3]);
        this.geos_[FloorDrainFlagGeometry.LINE4] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE4]);
        this.geos_[FloorDrainFlagGeometry.LINE5] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE5]);
        this.geos_[FloorDrainFlagGeometry.LINE6] = new LinePath(this.tmpGeos_[FloorDrainFlagGeometry.LINE6]);
        this.geos_['tmpCircle'] = new CirclePath(this.tmpGeos_['tmpCircle']);

        (<BasePath>this.geos_[FloorDrainFlagGeometry.CIRCLE]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE3]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE4]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE5]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FloorDrainFlagGeometry.LINE6]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpCircle']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpCircle']).opacity = 0.0;
    }

    protected floorDrainFlag(): FloorDrainlFlag {
        return <FloorDrainlFlag> this.refEntity_;
    }

    protected updateGeometry() {        
        const radius = this.floorDrainFlag().radius();
        
        const circle = <Circle>this.tmpGeos_[FloorDrainFlagGeometry.CIRCLE];
        circle.setRadius(radius);
        const line1 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE1];
        line1.setStartPoint(new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))));
        line1.setEndPoint(new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        const line2 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE2];
        line2.setStartPoint(new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))));
        line2.setEndPoint( new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        const line3 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE3];
        line3.setStartPoint(new Point((22/50)*radius/2-radius/2,
        Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        line3.setEndPoint(new Point(Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),
        (22/50)*radius/2-radius/2));
        const line4 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE4];
        line4.setStartPoint(new Point(-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),
        (78/50)*radius/2-radius/2));
        line4.setEndPoint(new Point((78/50)*radius/2-radius/2,
        -Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        const line5 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE5];
        line5.setStartPoint(new Point(-Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),
        (22/50)*radius/2-radius/2));
        line5.setEndPoint(new Point((78/50)*radius/2-radius/2,
        Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        const line6 = <Line>this.tmpGeos_[FloorDrainFlagGeometry.LINE6];
        line6.setStartPoint(new Point((22/50)*radius/2-radius/2,
        -Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2)))));
        line6.setEndPoint(new Point(Math.sqrt((Math.pow(radius/2,2)-Math.pow((28/50)*radius/2,2))),
        (78/50)*radius/2-radius/2));
        const tmpCircle = <Circle>this.tmpGeos_['tmpCircle'];
        tmpCircle.setRadius(radius);
        
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpCircle']);
        return result;       
    }

}

/**
 * 上下水口
 */
export class UphillFlagGeometry extends BaseEntityGeometry {
    static readonly CIRCLE = 'circle';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(uphillFlag: UphillFlag) {
        super(uphillFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const radius = uphillFlag.radius();
        this.tmpGeos_[UphillFlagGeometry.CIRCLE] = new Circle(new Point(0,0), radius);        
        this.tmpGeos_['tmpCircle'] = new Circle(new Point(0,0), radius);
        
        this.geos_[UphillFlagGeometry.CIRCLE] = new CirclePath(this.tmpGeos_[UphillFlagGeometry.CIRCLE]);
        this.geos_['tmpCircle'] = new CirclePath(this.tmpGeos_['tmpCircle']);

        (<BasePath>this.geos_[UphillFlagGeometry.CIRCLE]).style.fillColor = '#fff';
        (<BasePath>this.geos_['tmpCircle']).style.fillColor = '#fff';
        (<BasePath>this.geos_[UphillFlagGeometry.CIRCLE]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpCircle']).style.strokeColor = 'black';
        (<BasePath>this.geos_['tmpCircle']).opacity = 0.0;
    }

    protected uphillFlag(): UphillFlag{
        return <UphillFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const radius = this.uphillFlag().radius();
        const circle = <Circle>this.tmpGeos_[UphillFlagGeometry.CIRCLE];
        circle.setRadius(radius);
        const tmpCircle = <Circle>this.tmpGeos_['tmpCircle'];
        tmpCircle.setRadius(radius);       
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpCircle']);
        return result;       
    }
}

/**
 * 下水口
 */
/*export class OutletFlagGeometry extends BaseEntityGeometry {
    static readonly CIRCLE = 'circle';

    static readonly LINE1 = 'line1';
    
    static readonly LINE2 = 'line2';

    constructor(outletFlag: OutletFlag) {
        super(outletFlag);

        const radius = outletFlag.radius();

        this.geos_[OutletFlagGeometry.CIRCLE] = new Circle(new Point(0,0), radius);
        this.geos_[OutletFlagGeometry.LINE1] = new Line(new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))), new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        this.geos_[OutletFlagGeometry.LINE2] = new Line(new Point(-radius/2*(Math.cos(2*Math.PI*(45/360))),-radius/2*(Math.sin(2*Math.PI*(45/360)))), new Point(radius/2*(Math.cos(2*Math.PI*(45/360))),radius/2*(Math.sin(2*Math.PI*(45/360)))));
        this.geos_['tmpCircle'] = new Circle(new Point(0,0), radius); 
        this.geos_['tmpCircle'].setFillColor('black');
        this.geos_['tmpCircle'].setOpacity(0.0); 
    }

    protected outletFlag(): OutletFlag {
        return <OutletFlag> this.refEntity_;
    }


}*/ 

/**
 * 管道
 */
export class PipelienFlagGeometry extends BaseEntityGeometry {
    static readonly POLYGON = 'polygon';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(pipelienFlag: PipelienFlag) {
        super(pipelienFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();

        const width = pipelienFlag.width();
        const length = pipelienFlag.length();

        this.tmpGeos_[PipelienFlagGeometry.POLYGON] = new Polygon([new Line(new Point(-length/2,-width/2),new Point((-1200/3000)*length,-width/2)),
            new Line(new Point((-1200/3000)*length,-width/2),new Point((-1200/3000)*length,(-270/700)*width)),
            new Line(new Point((-1200/3000)*length,(-270/700)*width),new Point((1200/3000)*length,(-270/700)*width)),
            new Line(new Point((1200/3000)*length,(-270/700)*width),new Point((1200/3000)*length,-width/2)),
            new Line(new Point((1200/3000)*length,-width/2),new Point(length/2,-width/2)),
            new Line(new Point(length/2,-width/2),new Point(length/2,width/2)),
            new Line(new Point(length/2,width/2),new Point((1200/3000)*length,width/2)),
            new Line(new Point((1200/3000)*length,width/2),new Point((1200/3000)*length,(270/700)*width)),
            new Line(new Point((1200/3000)*length,(270/700)*width),new Point((-1200/3000)*length,(270/700)*width)),
            new Line(new Point((-1200/3000)*length,(270/700)*width),new Point((-1200/3000)*length,width/2)),
            new Line(new Point((-1200/3000)*length,width/2),new Point(-length/2,width/2)),
            new Line(new Point(-length/2,width/2),new Point(-length/2,-width/2))]);

        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length);
     
        this.geos_[PipelienFlagGeometry.POLYGON] = new PolygonPath(this.tmpGeos_[PipelienFlagGeometry.POLYGON]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[PipelienFlagGeometry.POLYGON]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected pipelienFlag(): PipelienFlag {
        return <PipelienFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const width = this.pipelienFlag().width();
        const length = this.pipelienFlag().length();
        const polygon = <Polygon> this.tmpGeos_[PipelienFlagGeometry.POLYGON];
        const segments = polygon.segments();
        segments[0].setStartPoint(new Point(-length/2,-width/2));
        segments[0].setEndPoint(new Point((-1200/3000)*length,-width/2));
        segments[1].setStartPoint(new Point((-1200/3000)*length,-width/2));
        segments[1].setEndPoint(new Point((-1200/3000)*length,(-270/700)*width));
        segments[2].setStartPoint(new Point((-1200/3000)*length,(-270/700)*width));
        segments[2].setEndPoint(new Point((1200/3000)*length,(-270/700)*width));
        segments[3].setStartPoint(new Point((1200/3000)*length,(-270/700)*width));
        segments[3].setEndPoint(new Point((1200/3000)*length,-width/2));
        segments[4].setStartPoint(new Point((1200/3000)*length,-width/2));
        segments[4].setEndPoint(new Point(length/2,-width/2));
        segments[5].setStartPoint(new Point(length/2,-width/2));
        segments[5].setEndPoint(new Point(length/2,width/2));
        segments[6].setStartPoint(new Point(length/2,width/2));
        segments[6].setEndPoint(new Point((1200/3000)*length,width/2));
        segments[7].setStartPoint(new Point((1200/3000)*length,width/2));
        segments[7].setEndPoint(new Point((1200/3000)*length,(270/700)*width));
        segments[8].setStartPoint(new Point((1200/3000)*length,(270/700)*width));
        segments[8].setEndPoint(new Point((-1200/3000)*length,(270/700)*width));
        segments[9].setStartPoint(new Point((-1200/3000)*length,(270/700)*width));
        segments[9].setEndPoint(new Point((-1200/3000)*length,width/2));
        segments[10].setStartPoint(new Point((-1200/3000)*length,width/2));
        segments[10].setEndPoint(new Point(-length/2,width/2));
        segments[11].setStartPoint(new Point(-length/2,width/2));
        segments[11].setEndPoint(new Point(-length/2,-width/2));
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);
        
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpRect']);
        return result;       
    }



}