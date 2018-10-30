import {PillarFlag, FlueFlag, GirderFlag} from '../entity/entity'

import {BaseEntityGeometry} from './entity-geometry'

import {Rect, Line, Point, BaseGeometry} from '../geometry/geometry'

import {BasePath,RectPath, LinePath} from '../path/path'

/**
 * 柱子
 */
export class PillarFlagGeometry extends BaseEntityGeometry {
    static readonly RECT = 'rect';

    protected tmpGeos_: Map<string, BaseGeometry> = null;

    constructor(pillarFlag: PillarFlag) {
        super(pillarFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = pillarFlag.width();
        const length = pillarFlag.length();

        this.tmpGeos_[PillarFlagGeometry.RECT] =  new Rect(new Point(0,0), length, width);
        this.tmpGeos_['tmpRect'] = new Rect(new Point(0,0),  length, width);
        
        
        this.geos_[PillarFlagGeometry.RECT] = new RectPath(this.tmpGeos_[PillarFlagGeometry.RECT]);
        (<BasePath>this.geos_[PillarFlagGeometry.RECT]).style.strokeColor = '#333843';
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected pillarFlag(): PillarFlag{
        return <PillarFlag> this.refEntity_;
    }

    protected updateGeometry() {
        const width = this.pillarFlag().width();
        const length = this.pillarFlag().length();
        const rect = <Rect>this.tmpGeos_[PillarFlagGeometry.RECT];
        rect.setWidth(width);
        rect.setLength(length);
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);        
    }
    /**
     * 添加模型外壳信息
     */
    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_['tmpRect']);

        return result;       
    }
}

/**
 * 烟道
 */
export class FlueFlagGeometry extends BaseEntityGeometry {
    static readonly RECT1 = 'rect1';

    static readonly RECT2 = 'rect2';

    static readonly LINE1 = 'line1';

    static readonly LINE2 = 'line2';

    protected tmpGeos_: Map<string, BaseGeometry> = null;

    constructor(flueFlag :FlueFlag) {
        super(flueFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = flueFlag.width();
        const length = flueFlag.length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/650;
        const lengthMultiple = length/650;

        this.tmpGeos_[FlueFlagGeometry.RECT1] = new Rect(new Point(0,0),  length, width);
        // this.geos_['rect1'].path_.strokeColor= 'red';
        this.tmpGeos_[FlueFlagGeometry.RECT2] = new Rect(new Point(0,0), length-(72*lengthMultiple), width-(72*widthMultiple));
        this.tmpGeos_[FlueFlagGeometry.LINE1] = new Line(new Point(-289*lengthMultiple,-289*widthMultiple), 
                                       new Point(-289*lengthMultiple+(length-(72*lengthMultiple))/(1+Math.sin(2*Math.PI*(15/360))/Math.cos(2*Math.PI*(15/360))),-289*widthMultiple+(width-(72*widthMultiple))/(1+Math.cos(2*Math.PI*(15/360))/Math.sin(2*Math.PI*(15/360)))));
        this.tmpGeos_[FlueFlagGeometry.LINE2] = new Line(new Point(-289*lengthMultiple+(length-(72*lengthMultiple))/(1+Math.sin(2*Math.PI*(15/360))/Math.cos(2*Math.PI*(15/360))),-289*widthMultiple+(width-(72*widthMultiple))/(1+Math.cos(2*Math.PI*(15/360))/Math.sin(2*Math.PI*(15/360)))),
                                       new Point(289*lengthMultiple,289*widthMultiple)); 
        
        this.tmpGeos_['tmpRect'] =new Rect(new Point(0,0),  width, length);       

        this.geos_[FlueFlagGeometry.RECT1] = new RectPath(this.tmpGeos_[FlueFlagGeometry.RECT1]);
        this.geos_[FlueFlagGeometry.RECT2] = new RectPath(this.tmpGeos_[FlueFlagGeometry.RECT2]);
        this.geos_[FlueFlagGeometry.LINE1] = new LinePath(this.tmpGeos_[FlueFlagGeometry.LINE1]);
        this.geos_[FlueFlagGeometry.LINE2] = new LinePath(this.tmpGeos_[FlueFlagGeometry.LINE2]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[FlueFlagGeometry.RECT1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FlueFlagGeometry.RECT2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FlueFlagGeometry.LINE1]).style.strokeColor = '#333843';
        (<BasePath>this.geos_[FlueFlagGeometry.LINE2]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected flueFlag(): FlueFlag{
        return <FlueFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.flueFlag().width();
        const length = this.flueFlag().length();
        //获取width和length相对于原模型的倍数
        const widthMultiple = width/650;
        const lengthMultiple = length/650;
        
        const rect1= <Rect>this.tmpGeos_[FlueFlagGeometry.RECT1];
        rect1.setWidth(width);
        rect1.setLength(length);
        const line1= <Line>this.tmpGeos_[FlueFlagGeometry.LINE1];
        line1.setStartPoint(new Point(-289*lengthMultiple,-289*widthMultiple));
        line1.setEndPoint(new Point(-289*lengthMultiple+(length-(72*lengthMultiple))/(1+Math.sin(2*Math.PI*(15/360))/Math.cos(2*Math.PI*(15/360))),-289*widthMultiple+(width-(72*widthMultiple))/(1+Math.cos(2*Math.PI*(15/360))/Math.sin(2*Math.PI*(15/360)))));
        const line2= <Line>this.tmpGeos_[FlueFlagGeometry.LINE2];
        line2.setStartPoint(new Point(-289*lengthMultiple+(length-(72*lengthMultiple))/(1+Math.sin(2*Math.PI*(15/360))/Math.cos(2*Math.PI*(15/360))),-289*widthMultiple+(width-(72*widthMultiple))/(1+Math.cos(2*Math.PI*(15/360))/Math.sin(2*Math.PI*(15/360)))));
        line2.setEndPoint( new Point(289*lengthMultiple,width*(289/650)));
        const rect2= <Rect>this.tmpGeos_[FlueFlagGeometry.RECT2];
        rect2.setWidth(width-(72*widthMultiple));
        rect2.setLength(length-(72*lengthMultiple));
        const tmpRect = <Rect>this.tmpGeos_['tmpRect'];
        tmpRect.setWidth(width);
        tmpRect.setLength(length);
    }

    /**
     * 添加模型外壳信息
     */
    getOuterGeos():Array<BaseGeometry> {
        const result = new Array<BaseGeometry>();
        result.push(this.tmpGeos_[FlueFlagGeometry.RECT1]);
        result.push(this.tmpGeos_[FlueFlagGeometry.RECT2]);

        return result;       
    }
}

/**
 * 梁
 */
export class GirderFlagGeometry extends BaseEntityGeometry {
    static readonly RECT = 'rect';
    protected tmpGeos_: Map<string, BaseGeometry> = null;
    constructor(girderFlag: GirderFlag) {
        super(girderFlag);
        this.tmpGeos_ = new Map<string, BaseGeometry>();
        const width = girderFlag.width();
        const length = girderFlag.length();

        this.tmpGeos_[GirderFlagGeometry.RECT] = new Rect(new Point(0,0), width, length);
        this.tmpGeos_['tmpRect'] =new Rect(new Point(0,0),  width, length);       
   

        this.geos_[GirderFlagGeometry.RECT] = new RectPath(this.tmpGeos_[GirderFlagGeometry.RECT]);
        this.geos_['tmpRect'] = new RectPath(this.tmpGeos_['tmpRect']);

        (<BasePath>this.geos_[GirderFlagGeometry.RECT]).style.strokeColor = '#333843';
        (<BasePath>this.geos_['tmpRect']).style.fillColor = 'black';
        (<BasePath>this.geos_['tmpRect']).opacity = 0.0;
    }

    protected girderFlag(): GirderFlag{
        return <GirderFlag> this.refEntity_;
    }

    protected updateGeometry() {

        const width = this.girderFlag().width();
        const length = this.girderFlag().length();
        
        const rect = <Rect>this.tmpGeos_[GirderFlagGeometry.RECT];
        rect.setWidth(width);
        rect.setLength(length);
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

