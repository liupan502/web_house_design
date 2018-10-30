import {StrongElectricBoxFlag, WeakBoxFlag, KtFlag, RadiatorFlag, 
    HangingFireplaceFlag, GasMeterFlag, WaterMeterFlag}  from '../entity/entity'
import {BaseEntityGeometry} from './entity-geometry'
import {Polygon, Rect, Line, Circle, Arc, Point, BaseGeometry} from '../geometry/geometry'

import {BasePath, RectPath, LinePath, PolygonPath, CirclePath, ArcPath} from '../path/path'

/**
 * 强电箱
 */
export class StrongElectricBoxFlagGeometry extends BaseEntityGeometry{
    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    static readonly POLYGON = 'polygon';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(strongElectricBoxFlag: StrongElectricBoxFlag)  {
        super(strongElectricBoxFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = strongElectricBoxFlag.width();
        const length = strongElectricBoxFlag.length();

        //获取width和length相对于原模型的倍数
        const widthMultiple = width/112;
        const lengthMultiple = length/300;

        this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT1] = new Rect(new Point(0,0),  width, length);
        this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT2] = new Rect(new Point(0,28*widthMultiple),  width/2, length);

        this.tmpGeos_[StrongElectricBoxFlagGeometry.POLYGON] = new Polygon([new Line(new Point(10*lengthMultiple,-56*widthMultiple),new Point(-20*lengthMultiple,0*widthMultiple)),
            new Line(new Point(-20*lengthMultiple,0*widthMultiple),new Point(16*lengthMultiple,0*widthMultiple)),
            new Line(new Point(16*lengthMultiple,0),new Point(-5*lengthMultiple,56*widthMultiple)),
            new Line(new Point(-5*lengthMultiple,56*widthMultiple),new Point(30*lengthMultiple,-8*widthMultiple)),
            new Line(new Point(30*lengthMultiple,-8*widthMultiple),new Point(-6*lengthMultiple,-8*widthMultiple)) ,
            new Line(new Point(-6*lengthMultiple,-8*widthMultiple),new Point(10*lengthMultiple,-56*widthMultiple))]);       
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length);
       
       

        this.geos_[StrongElectricBoxFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT1]);
        this.geos_[StrongElectricBoxFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT2]);
        this.geos_[StrongElectricBoxFlagGeometry.POLYGON] = new PolygonPath(this.tmpGeos_[StrongElectricBoxFlagGeometry.POLYGON]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.RECT1]).style.fillColor = '#black';
        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.RECT2]).style.fillColor = '#333843';
        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.POLYGON]).style.strokeColor = '#fff';
        (<BasePath>this.geos_[StrongElectricBoxFlagGeometry.POLYGON]).style.fillColor = '#black';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

    }

    protected strongElectricBoxFlag(): StrongElectricBoxFlag{
        return <StrongElectricBoxFlag>this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.strongElectricBoxFlag().width();
        const length = this.strongElectricBoxFlag().length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/112;
        const lengthMultiple = length/300;
        
        const rect1 = <Rect>this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT1];
        rect1.setWidth(width);
        rect1.setLength(length);
        const rect2 = <Rect>this.tmpGeos_[StrongElectricBoxFlagGeometry.RECT2];
        rect2.setCenter(new Point(0,28*widthMultiple));
        rect2.setWidth(width/2);
        rect2.setLength(length);
        const polygon = <Polygon> this.tmpGeos_[StrongElectricBoxFlagGeometry.POLYGON];
        const segments = polygon.segments();
        segments[0].setStartPoint(new Point(10*lengthMultiple, -56*widthMultiple));
        segments[0].setEndPoint(new Point(-20*lengthMultiple,0*widthMultiple));
        segments[1].setStartPoint(new Point(-20*lengthMultiple,0*widthMultiple));
        segments[1].setEndPoint(new Point(16*lengthMultiple,0*widthMultiple));
        segments[2].setStartPoint(new Point(16*lengthMultiple,0*widthMultiple));
        segments[2].setEndPoint(new Point(-5*lengthMultiple,56*widthMultiple));
        segments[3].setStartPoint(new Point(-5*lengthMultiple,56*widthMultiple));
        segments[3].setEndPoint(new Point(30*lengthMultiple,-8*widthMultiple));
        segments[4].setStartPoint(new Point(30*lengthMultiple,-8*widthMultiple));
        segments[4].setEndPoint(new Point(-6*lengthMultiple,-8*widthMultiple));
        segments[5].setStartPoint(new Point(-6*lengthMultiple,-8*widthMultiple));
        segments[5].setEndPoint(new Point(10*lengthMultiple,-56*widthMultiple));
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

/**
 * 弱电箱
 */
export class WeakBoxFlagGeometry extends BaseEntityGeometry {
    static readonly RECT1 = 'rect1';
    
    static readonly RECT2 = 'rect2';

    static readonly CIRCLE0 = 'circle0';

    static readonly CIRCLE1 = 'circle1';

    static readonly CIRCLE2 = 'circle2';

    static readonly CIRCLE3 = 'circle3';

    static readonly CIRCLE4 = 'circle4';

    static readonly CIRCLE5 = 'circle5';

    static readonly CIRCLE6 = 'circle6';

    static readonly CIRCLE7 = 'circle7';

    static readonly CIRCLE8 = 'circle8';

    static readonly CIRCLE9 = 'circle9';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(weakBoxFlag: WeakBoxFlag) {
        super(weakBoxFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = weakBoxFlag.width();
        const length = weakBoxFlag.length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/150;
        const lengthMultiple = length/370;

        this.tmpGeos_[WeakBoxFlagGeometry.RECT1] = new Rect(new Point(0,0),  width, length);
        this.tmpGeos_[WeakBoxFlagGeometry.RECT2] = new Rect(new Point(0*lengthMultiple,20*widthMultiple), 110*widthMultiple, 270*lengthMultiple);

        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE0] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*0,5*widthMultiple), 18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE1] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*1,5*widthMultiple), 18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE2] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*2,5*widthMultiple), 18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE3] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*3,5*widthMultiple), 18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE4] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*4,5*widthMultiple), 18*widthMultiple);

        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE5] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*(5-5),35*widthMultiple),18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE6] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*(6-5),35*widthMultiple),18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE7] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*(7-5),35*widthMultiple),18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE8] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*(8-5),35*widthMultiple),18*widthMultiple);
        this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE9] = new Circle(new Point(-90*lengthMultiple+45*lengthMultiple*(9-5),35*widthMultiple),18*widthMultiple);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length); 

        this.geos_[WeakBoxFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[WeakBoxFlagGeometry.RECT1]);
        this.geos_[WeakBoxFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[WeakBoxFlagGeometry.RECT2]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE0] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE0]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE1] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE1]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE2] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE2]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE3] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE3]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE4] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE4]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE5] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE5]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE6] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE6]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE7] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE7]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE8] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE8]);
        this.geos_[WeakBoxFlagGeometry.CIRCLE9] = new CirclePath(this.tmpGeos_[WeakBoxFlagGeometry.CIRCLE9]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[WeakBoxFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE0]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE3]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE4]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE5]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE6]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE7]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE8]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[WeakBoxFlagGeometry.CIRCLE9]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'balck';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
        
       
    }

    protected weakBoxFlag(): WeakBoxFlag{
        return <WeakBoxFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const width = this.weakBoxFlag().width();
        const length = this.weakBoxFlag().length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/150;
        const lengthMultiple = length/370;
        
        const rect1 = <Rect>this.tmpGeos_['rect1'];
        rect1.setWidth(width);
        rect1.setLength(length);
        const rect2 = <Rect>this.tmpGeos_['rect2'];
        rect2.setCenter(new Point(0*lengthMultiple,20*widthMultiple));
        rect2.setWidth(110*widthMultiple);
        rect2.setLength(270*lengthMultiple);

        const circleNames = [
            WeakBoxFlagGeometry.CIRCLE0, WeakBoxFlagGeometry.CIRCLE1,
            WeakBoxFlagGeometry.CIRCLE2, WeakBoxFlagGeometry.CIRCLE3,
            WeakBoxFlagGeometry.CIRCLE4, WeakBoxFlagGeometry.CIRCLE5,
            WeakBoxFlagGeometry.CIRCLE6, WeakBoxFlagGeometry.CIRCLE7,
            WeakBoxFlagGeometry.CIRCLE8, WeakBoxFlagGeometry.CIRCLE9,
                            ];
        for (let i = 0 ;i<10;i++) {
            const circleArry = new Array;
            circleArry[i] = this.tmpGeos_[circleNames[i]] ;
            if(i<5) {
                circleArry[i].setCenter(new Point(-90*lengthMultiple+45*lengthMultiple*i,5*widthMultiple));
                circleArry[i].setRadius(18*widthMultiple);
            } else {
                circleArry[i].setCenter(new Point(-90*lengthMultiple+45*lengthMultiple*(i-5),35*widthMultiple));
                circleArry[i].setRadius(18*widthMultiple);
            }
        }
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

/**
 * 空调
 */
export class KtFlagGeometry extends BaseEntityGeometry {
    static readonly LINE1 = 'line1';

    static readonly LINE2 = 'line2';

    static readonly RECT = 'rect';
    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(ktFlag: KtFlag) {
        super(ktFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = ktFlag.width();
        const length = ktFlag.length();

        this.tmpGeos_[KtFlagGeometry.RECT] = new Rect(new Point(0,0),  width, length);
        this.tmpGeos_[KtFlagGeometry.LINE1] = new Line(new Point(-length/2,-width/2), new Point(length/2,width/2));
        this.tmpGeos_[KtFlagGeometry.LINE2] = new Line(new Point(-length/2,width/2), new Point(length/2,-width/2));

        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),width, length);
       
        this.geos_[KtFlagGeometry.RECT] = new RectPath(this.tmpGeos_[KtFlagGeometry.RECT]);
        this.geos_[KtFlagGeometry.LINE1] = new LinePath(this.tmpGeos_[KtFlagGeometry.LINE1]);
        this.geos_[KtFlagGeometry.LINE2] = new LinePath(this.tmpGeos_[KtFlagGeometry.LINE2]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[KtFlagGeometry.RECT]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[KtFlagGeometry.LINE1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[KtFlagGeometry.LINE2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

    }

    protected ktFlag(): KtFlag{
        return <KtFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.ktFlag().width();
        const length = this.ktFlag().length();

        const rect = <Rect>this.tmpGeos_[KtFlagGeometry.RECT];
        rect.setWidth(width);
        rect.setLength(length);
        const line1 = <Line>this.tmpGeos_['line1'];
        line1.setStartPoint(new Point(-length/2,-width/2));
        line1.setEndPoint(new Point(length/2,width/2));
        const line2 = <Line>this.tmpGeos_['line2'];
        line2.setStartPoint(new Point(-length/2,width/2));
        line2.setEndPoint(new Point(length/2,-width/2));
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

/**
 * 暖气片
 */
export class RadiatorFlagGeometry extends BaseEntityGeometry {

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(radiatorFlag: RadiatorFlag) {
        super(radiatorFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = radiatorFlag.width();
        const length = radiatorFlag.length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/496;
        const lengthMultiple = length/900;

        for (let i = 0 ;i < 6; i++) {
            this.tmpGeos_['line1'+i] = new Line(new Point((-450+167*i)*lengthMultiple,-222*widthMultiple), new Point((-450+167*i)*lengthMultiple,222.0*widthMultiple));
            this.tmpGeos_['line2'+i] = new Line(new Point((-434+167*i)*lengthMultiple,-222*widthMultiple), new Point((-434+167*i)*lengthMultiple,222.0*widthMultiple));
            this.tmpGeos_['line3'+i] = new Line(new Point((-401+167*i)*lengthMultiple,-222*widthMultiple), new Point((-401+167*i)*lengthMultiple,222.0*widthMultiple));
            this.tmpGeos_['line4'+i] = new Line(new Point((-385+167*i)*lengthMultiple,-222*widthMultiple), new Point((-385+167*i)*lengthMultiple,222.0*widthMultiple)); 
            this.tmpGeos_['line5'+i] = new Line(new Point((-424+167*i)*lengthMultiple,-248*widthMultiple), new Point((-411+167*i)*lengthMultiple,-248*widthMultiple));
            this.tmpGeos_['line6'+i] = new Line(new Point((-424+167*i)*lengthMultiple,-232*widthMultiple), new Point((-411+167*i)*lengthMultiple,-232*widthMultiple));
            this.tmpGeos_['line7'+i] = new Line(new Point((-424+167*i)*lengthMultiple,232*widthMultiple), new Point((-411+167*i)*lengthMultiple,232*widthMultiple));
            this.tmpGeos_['line8'+i] = new Line(new Point((-424+167*i)*lengthMultiple,248*widthMultiple), new Point((-411+167*i)*lengthMultiple,248*widthMultiple));         
            this.tmpGeos_['arc1'+i] = new Arc(new Point((-450+167*i)*lengthMultiple,-222*widthMultiple),new Point((-424+167*i)*lengthMultiple,-248*widthMultiple),new Point((-428+167*i)*lengthMultiple,-226*widthMultiple),);
            this.tmpGeos_['arc2'+i] = new Arc(new Point((-411+167*i)*lengthMultiple,-248*widthMultiple),new Point((-385+167*i)*lengthMultiple,-222*widthMultiple),new Point((-408+167*i)*lengthMultiple,-226*widthMultiple),);
            this.tmpGeos_['arc3'+i] = new Arc(new Point((-424+167*i)*lengthMultiple,248*widthMultiple),new Point((-450+167*i)*lengthMultiple,222*widthMultiple),new Point((-425+167*i)*lengthMultiple,225*widthMultiple),);
            this.tmpGeos_['arc4'+i] = new Arc(new Point((-385+167*i)*lengthMultiple,222*widthMultiple),new Point((-411+167*i)*lengthMultiple,248*widthMultiple),new Point((-416+167*i)*lengthMultiple,217*widthMultiple),);
            this.tmpGeos_['arc5'+i] = new Arc(new Point((-434+167*i)*lengthMultiple,-222*widthMultiple),new Point((-424+167*i)*lengthMultiple,-232*widthMultiple),new Point((-425+167*i)*lengthMultiple,-223*widthMultiple),);
            this.tmpGeos_['arc6'+i] = new Arc(new Point((-411+167*i)*lengthMultiple,-232*widthMultiple),new Point((-401+167*i)*lengthMultiple,-222*widthMultiple),new Point((-411+167*i)*lengthMultiple,-223*widthMultiple),);
            this.tmpGeos_['arc7'+i] = new Arc(new Point((-424+167*i)*lengthMultiple,232*widthMultiple),new Point((-434+167*i)*lengthMultiple,222*widthMultiple),new Point((-425+167*i)*lengthMultiple,225*widthMultiple),);
            this.tmpGeos_['arc8'+i] = new Arc(new Point((-401+167*i)*lengthMultiple,222*widthMultiple),new Point((-411+167*i)*lengthMultiple,232*widthMultiple),new Point((-412+167*i)*lengthMultiple,219*widthMultiple),); 
        }

        for(let i = 0 ;i < 5; i++) {
            
            this.tmpGeos_['arctwo'+i] = new Arc(new Point((-283+167*i)*lengthMultiple,-190*widthMultiple),new Point((-385+167*i)*lengthMultiple,-190*widthMultiple),new Point((-334+167*i)*lengthMultiple,-197*widthMultiple),);
            this.tmpGeos_['arcone'+i] = new Arc(new Point((-283+167*i)*lengthMultiple,-200*widthMultiple),new Point((-385+167*i)*lengthMultiple,-200*widthMultiple),new Point((-334+167*i)*lengthMultiple,-207*widthMultiple),);
            this.tmpGeos_['lineone'+i] = new Line(new Point((-385+167*i)*lengthMultiple,0*widthMultiple),new Point((-283+167*i)*lengthMultiple,0*widthMultiple));
            this.tmpGeos_['arcthree'+i] = new Arc(new Point((-385+167*i)*lengthMultiple,190*widthMultiple),new Point((-283+167*i)*lengthMultiple,190*widthMultiple),new Point((-334+167*i)*lengthMultiple,192*widthMultiple),);
            this.tmpGeos_['arcfour'+i] = new Arc(new Point((-385+167*i)*lengthMultiple,200*widthMultiple),new Point((-283+167*i)*lengthMultiple,200*widthMultiple),new Point((-334+167*i)*lengthMultiple,202*widthMultiple),);

        }
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),length*496/900, length);
   

        for (let i = 0; i < 6; i++) {            
            const linePath1 = new LinePath(this.tmpGeos_['line1' + i]);
            linePath1.style.strokeColor = '#333843';
            this.geos_['line1' + i] = linePath1;

            const linePath2 = new LinePath(this.tmpGeos_['line2' + i]);
            linePath2.style.strokeColor = '#333843';
            this.geos_['line2' + i] = linePath2;

            const linePath3 = new LinePath(this.tmpGeos_['line3' + i]);
            linePath3.style.strokeColor = '#333843';
            this.geos_['line3' + i] = linePath3;

            const linePath4 = new LinePath(this.tmpGeos_['line4' + i]);
            linePath4.style.strokeColor = '#333843';
            this.geos_['line4' + i] = linePath4;

            const linePath5 = new LinePath(this.tmpGeos_['line5' + i]);
            linePath5.style.strokeColor = '#333843';
            this.geos_['line5' + i] = linePath5;

            const linePath6 = new LinePath(this.tmpGeos_['line6' + i]);
            linePath6.style.strokeColor = '#333843';
            this.geos_['line6' + i] = linePath6;

            const linePath7 = new LinePath(this.tmpGeos_['line7' + i]);
            linePath7.style.strokeColor = '#333843';
            this.geos_['line7' + i] = linePath7;

            const linePath8 = new LinePath(this.tmpGeos_['line8' + i]);
            linePath8.style.strokeColor = '#333843';
            this.geos_['line8' + i] = linePath8;

            const arcPath1 = new ArcPath(this.tmpGeos_['arc1' + i]);
            arcPath1.style.strokeColor = '#333843';
            this.geos_['arc1' + i] = arcPath1;

            const arcPath2 = new ArcPath(this.tmpGeos_['arc2' + i]);
            arcPath2.style.strokeColor = '#333843';
            this.geos_['arc2' + i] = arcPath2;

            const arcPath3 = new ArcPath(this.tmpGeos_['arc3' + i]);
            arcPath3.style.strokeColor = '#333843';
            this.geos_['arc3' + i] = arcPath3;

            const arcPath4 = new ArcPath(this.tmpGeos_['arc4' + i]);
            arcPath4.style.strokeColor = '#333843';
            this.geos_['arc4' + i] = arcPath4;

            const arcPath5 = new ArcPath(this.tmpGeos_['arc5' + i]);
            arcPath5.style.strokeColor = '#333843';
            this.geos_['arc5' + i] = arcPath5;

            const arcPath6 = new ArcPath(this.tmpGeos_['arc6' + i]);
            arcPath6.style.strokeColor = '#333843';
            this.geos_['arc6' + i] = arcPath6;

            const arcPath7 = new ArcPath(this.tmpGeos_['arc7' + i]);
            arcPath7.style.strokeColor = '#333843';
            this.geos_['arc7' + i] = arcPath7;

            const arcPath8 = new ArcPath(this.tmpGeos_['arc8' + i]);
            arcPath8.style.strokeColor = '#333843';
            this.geos_['arc8' + i] = arcPath8;
        }

        for (let i = 0; i < 5; i++) {
            const arcttwoPath = new ArcPath(this.tmpGeos_['arctwo' + i]);
            arcttwoPath.style.strokeColor = '#333843';
            this.geos_['arctwo' + i] = arcttwoPath;

            const arconePath = new ArcPath(this.tmpGeos_['arcone' + i]);
            arconePath.style.strokeColor = '#333843';
            this.geos_['arcone' + i];

            const arcthreePath = new ArcPath(this.tmpGeos_['arcthree' + i]);
            arcthreePath.style.strokeColor = '#333843';
            this.geos_['arcthree' + i] = arcthreePath;

            const arcfourPath = new ArcPath(this.tmpGeos_['arcfour' + i]);
            arcfourPath.style.strokeColor = '#333843';
            this.geos_['arcfour' + i] = arcfourPath;
        }

        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected radiatorFlag(): RadiatorFlag {
        return <RadiatorFlag> this.refEntity_;
    }

    protected updateGeometry() {
        
        const width = this.radiatorFlag().width();
        const length = this.radiatorFlag().length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/496;
        const lengthMultiple = length/900;
        
        for (let i = 0 ;i<6;i++) {
            const lineArry1 = new Array;
            lineArry1[i] = this.tmpGeos_['line1'+i] ;
            lineArry1[i].setStartPoint(new Point((-450+167*i)*lengthMultiple,-222*lengthMultiple));
            lineArry1[i].setEndPoint(new Point((-450+167*i)*lengthMultiple,222.0*lengthMultiple));
            const lineArry2 = new Array;
            lineArry2[i] = this.tmpGeos_['line2'+i] ;
            lineArry2[i].setStartPoint(new Point((-434+167*i)*lengthMultiple,-222*lengthMultiple));
            lineArry2[i].setEndPoint(new Point((-434+167*i)*lengthMultiple,222.0*lengthMultiple));
            const lineArry3 = new Array;
            lineArry3[i] = this.tmpGeos_['line3'+i] ;
            lineArry3[i].setStartPoint(new Point((-401+167*i)*lengthMultiple,-222*lengthMultiple));
            lineArry3[i].setEndPoint(new Point((-401+167*i)*lengthMultiple,222.0*lengthMultiple));
            const lineArry4 = new Array;
            lineArry4[i] = this.tmpGeos_['line4'+i] ;
            lineArry4[i].setStartPoint(new Point((-385+167*i)*lengthMultiple,-222*lengthMultiple));
            lineArry4[i].setEndPoint(new Point((-385+167*i)*lengthMultiple,222.0*lengthMultiple));
            const lineArry5 = new Array;
            lineArry5[i] = this.tmpGeos_['line5'+i] ;
            lineArry5[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,-248*lengthMultiple));
            lineArry5[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,-248*lengthMultiple));
            const lineArry6 = new Array;
            lineArry6[i] = this.tmpGeos_['line6'+i] ;
            lineArry6[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,-232*lengthMultiple));
            lineArry6[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,-232*lengthMultiple));
            const lineArry7 = new Array;
            lineArry7[i] = this.tmpGeos_['line7'+i] ;
            lineArry7[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,232*lengthMultiple));
            lineArry7[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,232*lengthMultiple));
            const lineArry8 = new Array;
            lineArry8[i] = this.tmpGeos_['line8'+i] ;
            lineArry8[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,248*lengthMultiple));
            lineArry8[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,248*lengthMultiple));
            const arcArry1 = new Array;
            arcArry1[i] = this.tmpGeos_['arc1'+i];
            arcArry1[i].setStartPoint(new Point((-450+167*i)*lengthMultiple,-222*lengthMultiple));
            arcArry1[i].setEndPoint(new Point((-424+167*i)*lengthMultiple,-248*lengthMultiple));
            arcArry1[i].setCenter(new Point((-428+167*i)*lengthMultiple,-226*lengthMultiple));
            const arcArry2 = new Array;
            arcArry2[i] = this.tmpGeos_['arc2'+i];
            arcArry2[i].setStartPoint(new Point((-411+167*i)*lengthMultiple,-248*lengthMultiple));
            arcArry2[i].setEndPoint(new Point((-385+167*i)*lengthMultiple,-222*lengthMultiple));
            arcArry2[i].setCenter(new Point((-408+167*i)*lengthMultiple,-226*lengthMultiple));
            const arcArry3 = new Array;
            arcArry3[i] = this.tmpGeos_['arc3'+i];
            arcArry3[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,248*lengthMultiple));
            arcArry3[i].setEndPoint(new Point((-450+167*i)*lengthMultiple,222*lengthMultiple));
            arcArry3[i].setCenter(new Point((-425+167*i)*lengthMultiple,225*lengthMultiple));
            const arcArry4 = new Array;
            arcArry4[i] = this.tmpGeos_['arc4'+i];
            arcArry4[i].setStartPoint(new Point((-385+167*i)*lengthMultiple,222*lengthMultiple));
            arcArry4[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,248*lengthMultiple));
            arcArry4[i].setCenter(new Point((-416+167*i)*lengthMultiple,217*lengthMultiple));
            const arcArry5 = new Array;
            arcArry5[i] = this.tmpGeos_['arc5'+i];
            arcArry5[i].setStartPoint(new Point((-434+167*i)*lengthMultiple,-222*lengthMultiple));
            arcArry5[i].setEndPoint(new Point((-424+167*i)*lengthMultiple,-232*lengthMultiple));
            arcArry5[i].setCenter(new Point((-425+167*i)*lengthMultiple,-223*lengthMultiple));
            const arcArry6 = new Array;
            arcArry6[i] = this.tmpGeos_['arc6'+i];
            arcArry6[i].setStartPoint(new Point((-411+167*i)*lengthMultiple,-232*lengthMultiple));
            arcArry6[i].setEndPoint(new Point((-401+167*i)*lengthMultiple,-222*lengthMultiple));
            arcArry6[i].setCenter(new Point((-411+167*i)*lengthMultiple,-223*lengthMultiple));
            const arcArry7 = new Array;
            arcArry7[i] = this.tmpGeos_['arc7'+i];
            arcArry7[i].setStartPoint(new Point((-424+167*i)*lengthMultiple,232*lengthMultiple));
            arcArry7[i].setEndPoint(new Point((-434+167*i)*lengthMultiple,222*lengthMultiple));
            arcArry7[i].setCenter(new Point((-425+167*i)*lengthMultiple,225*lengthMultiple));
            const arcArry8 = new Array;
            arcArry8[i] = this.tmpGeos_['arc8'+i];
            arcArry8[i].setStartPoint(new Point((-401+167*i)*lengthMultiple,222*lengthMultiple));
            arcArry8[i].setEndPoint(new Point((-411+167*i)*lengthMultiple,232*lengthMultiple));
            arcArry8[i].setCenter(new Point((-412+167*i)*lengthMultiple,219*lengthMultiple));         
        }

        for (let i = 0 ;i<5;i++) {
             const arcArryTwo = new Array;
            arcArryTwo[i] = this.tmpGeos_['arctwo'+i];
            arcArryTwo[i].setStartPoint(new Point((-283+167*i)*lengthMultiple,-190*lengthMultiple));
            arcArryTwo[i].setEndPoint(new Point((-385+167*i)*lengthMultiple,-190*lengthMultiple));
            arcArryTwo[i].setCenter(new Point((-334+167*i)*lengthMultiple,-197*lengthMultiple));
            const arcArryOne = new Array;
            arcArryOne[i] = this.tmpGeos_['arcone'+i];
            arcArryOne[i].setStartPoint(new Point((-283+167*i)*lengthMultiple,-200*lengthMultiple));
            arcArryOne[i].setEndPoint(new Point((-385+167*i)*lengthMultiple,-200*lengthMultiple));
            arcArryOne[i].setCenter(new Point((-334+167*i)*lengthMultiple,-207*lengthMultiple));
            const lineArryOne = new Array;
            lineArryOne[i] = this.tmpGeos_['lineone'+i] ;
            lineArryOne[i].setStartPoint(new Point((-385+167*i)*lengthMultiple,0*lengthMultiple));
            lineArryOne[i].setEndPoint(new Point((-283+167*i)*lengthMultiple,0*lengthMultiple));
            const arcArryThree = new Array;
            arcArryThree[i] = this.tmpGeos_['arcthree'+i];
            arcArryThree[i].setStartPoint(new Point((-385+167*i)*lengthMultiple,190*lengthMultiple));
            arcArryThree[i].setEndPoint(new Point((-283+167*i)*lengthMultiple,190*lengthMultiple));
            arcArryThree[i].setCenter(new Point((-334+167*i)*lengthMultiple,192*lengthMultiple));
            const arcArryFour = new Array;
            arcArryFour[i] = this.tmpGeos_['arcfour'+i];
            arcArryFour[i].setStartPoint(new Point((-385+167*i)*lengthMultiple,200*lengthMultiple));
            arcArryFour[i].setEndPoint(new Point((-283+167*i)*lengthMultiple,200*lengthMultiple));
            arcArryFour[i].setCenter(new Point((-334+167*i)*lengthMultiple,202*lengthMultiple));
        }
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth((496/900)* length);
        tmpRect.setLength(length);       
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpRect']);
        return result;       
    }
}

/**
 * 挂壁炉
 */
export class HangingFireplaceFlagGeometry extends BaseEntityGeometry {
    static readonly POLYGON = 'polygon';

    static readonly RECT = 'rect';
    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(hangingFireplaceFlag: HangingFireplaceFlag) {
        super(hangingFireplaceFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = hangingFireplaceFlag.width();
        const length = hangingFireplaceFlag.length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/670;
        const lengthMultiple = length/450;

        this.tmpGeos_[HangingFireplaceFlagGeometry.POLYGON] = new Polygon([new Line(new Point(-length/2,415*widthMultiple),new Point(-length/2,-335*widthMultiple)),
            new Line(new Point(-length/2,-335*widthMultiple),new Point(length/2 ,-335*widthMultiple)),
           new Line(new Point(length/2 ,-335*widthMultiple),new Point(length/2,415*widthMultiple)),
           new Arc(new Point(length/2,415*widthMultiple),new Point(-length/2,415*widthMultiple),new Point(0*lengthMultiple,-200*widthMultiple),)]);
        this.tmpGeos_[HangingFireplaceFlagGeometry.RECT] = new Rect(new Point(0,0),  width, length);     

        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,61*widthMultiple),792*widthMultiple, length);

        this.geos_[HangingFireplaceFlagGeometry.POLYGON] = new PolygonPath(this.tmpGeos_[HangingFireplaceFlagGeometry.POLYGON]);
        this.geos_[HangingFireplaceFlagGeometry.RECT] = new RectPath(this.tmpGeos_[HangingFireplaceFlagGeometry.RECT]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);
        
        (<BasePath>this.geos_[HangingFireplaceFlagGeometry.POLYGON]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[HangingFireplaceFlagGeometry.RECT]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;

    }

    protected hangingFireplaceFlag(): HangingFireplaceFlag{
        return <HangingFireplaceFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const length = this.hangingFireplaceFlag().length();
        const width = this.hangingFireplaceFlag().width();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/670;
        const lengthMultiple = length/450;

        const polygon1 = <Polygon> this.tmpGeos_[HangingFireplaceFlagGeometry.POLYGON];
        const segments1 = polygon1.segments();
        


        segments1[0].setStartPoint(new Point(-length/2,415*widthMultiple));
        segments1[0].setEndPoint(new Point(-length/2,-335*widthMultiple));
        segments1[1].setStartPoint(new Point(-length/2,-335*widthMultiple));
        segments1[1].setEndPoint(new Point(length/2 ,-335*widthMultiple));
        segments1[2].setStartPoint(new Point(length/2 ,-335*widthMultiple));
        segments1[2].setEndPoint(new Point(length/2,415*widthMultiple));
        const arc1 = <Arc> segments1[3];
        arc1.setStartPoint(new Point(length/2,415*widthMultiple));
        arc1.setEndPoint(new Point(-length/2,415*widthMultiple));
        arc1.setCenter(new Point(0*lengthMultiple,-200*widthMultiple));

        const rect = <Rect>this.tmpGeos_[HangingFireplaceFlagGeometry.RECT];
        rect.setWidth(670*widthMultiple);
        rect.setLength(length);          
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setCenter(new Point(0,61*widthMultiple));
        tmpRect.setWidth(792*widthMultiple);
        tmpRect.setLength(length);
        
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpRect']);
        return result;       
    }

}

/**
 * 燃气表
 */
export class GasMeterFlagGeometry extends BaseEntityGeometry {
    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    static readonly Line1 = 'line1';

    static readonly Line2 = 'line2';

    static readonly CIRCLE1 = 'circle1';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(gasMeterFlag: GasMeterFlag) {
        super(gasMeterFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = gasMeterFlag.width();
        const length = gasMeterFlag.length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/100;
        const lengthMultiple = length/267;

        this.tmpGeos_[GasMeterFlagGeometry.RECT1] = new Rect(new Point(0,0),   width,length,);
        this.tmpGeos_[GasMeterFlagGeometry.RECT2] = new Rect(new Point(0,33.5*widthMultiple), 33*widthMultiple,length, );
        
        this.tmpGeos_[GasMeterFlagGeometry.Line1] = new Line(new Point(length/2,-3*widthMultiple), new Point(178.5*lengthMultiple,-3*widthMultiple));
        this.tmpGeos_[GasMeterFlagGeometry.Line2] = new Line(new Point(length/2,6*widthMultiple), new Point(178.5*lengthMultiple,6*widthMultiple));
        this.tmpGeos_[GasMeterFlagGeometry.CIRCLE1] = new Circle(new Point(200.5*lengthMultiple,1.5*widthMultiple), 44*lengthMultiple);


        this.tmpGeos_['tmpRect'] = new Rect(new Point(44*lengthMultiple,0),width, 355*lengthMultiple);
   
        this.geos_[GasMeterFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[GasMeterFlagGeometry.RECT1]);
        this.geos_[GasMeterFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[GasMeterFlagGeometry.RECT2]);
        this.geos_[GasMeterFlagGeometry.Line1] = new LinePath(this.tmpGeos_[GasMeterFlagGeometry.Line1]);
        this.geos_[GasMeterFlagGeometry.Line2] = new LinePath(this.tmpGeos_[GasMeterFlagGeometry.Line2]);
        this.geos_[GasMeterFlagGeometry.CIRCLE1] = new CirclePath(this.tmpGeos_[GasMeterFlagGeometry.CIRCLE1]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath> this.geos_[GasMeterFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[GasMeterFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[GasMeterFlagGeometry.RECT2]).style.fillColor = 'black';
        (<BasePath> this.geos_[GasMeterFlagGeometry.Line1]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[GasMeterFlagGeometry.Line2]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[GasMeterFlagGeometry.CIRCLE1]).style.strokeColor = '#333843';
        (<BasePath> this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath> this.geos_['tmpRect']).opacity = 0.0;
    }

    protected gasMeterFlag(): GasMeterFlag{
        return <GasMeterFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const width = this.gasMeterFlag().width();
        const length = this.gasMeterFlag().length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/100;
        const lengthMultiple = length/267;

        const rect1 = <Rect>this.tmpGeos_[GasMeterFlagGeometry.RECT1];
        rect1.setWidth(width);
        rect1.setLength(length);        
        const rect2 = <Rect>this.tmpGeos_[GasMeterFlagGeometry.RECT2];
        rect2.setCenter(new Point(0,33.5*widthMultiple));
        rect2.setWidth(33*widthMultiple);
        rect2.setLength(length);   
        const line1 = <Line>this.tmpGeos_[GasMeterFlagGeometry.Line1];
        line1.setStartPoint(new Point(length/2,-3*widthMultiple));
        line1.setEndPoint(new Point(178.5*lengthMultiple,-3*widthMultiple));   
        const line2 = <Line>this.tmpGeos_[GasMeterFlagGeometry.Line2];
        line2.setStartPoint(new Point(length/2,6*widthMultiple));
        line2.setEndPoint(new Point(178.5*lengthMultiple,6*widthMultiple));   
        const circle1 = <Circle>this.tmpGeos_[GasMeterFlagGeometry.CIRCLE1];
        circle1.setCenter(new Point(200.5*lengthMultiple,1.5*widthMultiple));
        circle1.setRadius(44*lengthMultiple);     
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setCenter(new Point(44*lengthMultiple,0));
        tmpRect.setWidth(width);
        tmpRect.setLength(355*lengthMultiple);       
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpRect']);
        return result;       
    }

}

/**
 * 水表
 */
export class WaterMeterFlagGeometry extends BaseEntityGeometry {
    static readonly CIRCLE = 'circle';

    static readonly LINE = 'line';

    static readonly POLYGON = 'polygon';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(waterMeterFlag: WaterMeterFlag) {
        super(waterMeterFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const radius = waterMeterFlag.radius();
        //获取width和length相对于原模型的倍数
        const radiushMultiple = radius/100;
        
        this.tmpGeos_[WaterMeterFlagGeometry.CIRCLE] = new Circle(new Point(0,0), radius);
        this.tmpGeos_[WaterMeterFlagGeometry.LINE] = new Line(new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360)))),
                                      new Point(-radius/2*(Math.cos(2*Math.PI*(50/360))),radius/2*(Math.sin(2*Math.PI*(50/360)))));
        this.tmpGeos_[WaterMeterFlagGeometry.POLYGON] = new Polygon([new Line(new Point(0,0),new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360))))),
                                             new Line(new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360)))),
                                                      new Point(-radius/2/(Math.sqrt(3))*(Math.cos(2*Math.PI*(40/360))),-radius/2/(Math.sqrt(3))*(Math.sin(2*Math.PI*(40/360))))),
                                             new Line(new Point(2-radius/2/(Math.sqrt(3))*(Math.cos(2*Math.PI*(40/360))),-radius/2/(Math.sqrt(3))*(Math.sin(2*Math.PI*(40/360)))),
                                                      new Point(0,0))]);
        


        this.tmpGeos_['tmpCircle'] = new Circle(new Point(0,0), radius);

        this.geos_[WaterMeterFlagGeometry.CIRCLE] = new CirclePath(this.tmpGeos_[WaterMeterFlagGeometry.CIRCLE]);
        this.geos_[WaterMeterFlagGeometry.LINE] = new LinePath(this.tmpGeos_[WaterMeterFlagGeometry.LINE]);
        this.geos_[WaterMeterFlagGeometry.POLYGON] = new PolygonPath(this.tmpGeos_[WaterMeterFlagGeometry.POLYGON]);
        this.geos_['tmpCircle'] = new CirclePath(this.tmpGeos_['tmpCircle']);

        (<BasePath> this.geos_[WaterMeterFlagGeometry.CIRCLE]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[WaterMeterFlagGeometry.LINE]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[WaterMeterFlagGeometry.POLYGON]).style.strokeColor = '#333843';
        (<BasePath> this.geos_[WaterMeterFlagGeometry.POLYGON]).style.fillColor = '#333843';
        (<BasePath> this.geos_['tmpCircle']).style.fillColor = 'black';
        (<BasePath> this.geos_['tmpCircle']).opacity = 0.0;

    }

    protected waterMeterFlag(): WaterMeterFlag{
        return <WaterMeterFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const radius = this.waterMeterFlag().radius();       

        const circle = <Circle>this.tmpGeos_[WaterMeterFlagGeometry.CIRCLE];
        circle.setRadius(radius);
        const line = <Line>this.tmpGeos_[WaterMeterFlagGeometry.LINE];
        line.setStartPoint(new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360)))));
        line.setEndPoint(new Point(-radius/2*(Math.cos(2*Math.PI*(50/360))),radius/2*(Math.sin(2*Math.PI*(50/360)))));
        const polygon = <Polygon> this.tmpGeos_[WaterMeterFlagGeometry.POLYGON];
        const segments = polygon.segments();
        segments[0].setEndPoint(new Point(0,0));
        segments[0].setEndPoint(new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360)))));
        segments[1].setStartPoint(new Point(radius/2*(Math.cos(2*Math.PI*(50/360))),-radius/2*(Math.sin(2*Math.PI*(50/360)))));
        segments[1].setEndPoint(new Point(-radius/2/(Math.sqrt(3))*(Math.cos(2*Math.PI*(40/360))),
        -radius/2/(Math.sqrt(3))*(Math.sin(2*Math.PI*(40/360)))));
        segments[2].setStartPoint(new Point(-radius/2/(Math.sqrt(3))*(Math.cos(2*Math.PI*(40/360))),
        -radius/2/(Math.sqrt(3))*(Math.sin(2*Math.PI*(40/360)))));
        segments[2].setEndPoint(new Point(0,0));
        const tmpCircle = <Circle>this.tmpGeos_['tmpCircle'];
        tmpCircle.setRadius(radius);        
    }

    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpCircle']);
        return result;       
    }
}