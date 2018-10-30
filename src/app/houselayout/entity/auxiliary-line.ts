import {BaseEntity, Wall, Room } from './entity'
import {Line, Point, BaseGeometry, Rect} from '../../geometry/geometry'
import {Path, CompoundPath, Point as ppoint, Size, PointText} from 'paper'
import {Vector2 as Vec2} from 'three'
import * as MathUtil from '../../math/math'


/**
 * 作为墙标注对应的entity
 * 在没有指定房间时（无源），则绘制普通（工字形）标注线
 * 在指定房间时，则绘制朝向房间外的凹型线
 * 
 */
export class AuxilaryRect extends BaseEntity {
    protected static maxId = 0;    
    protected static idmaxRange = 1000; 
    protected sPoint_: Point;
    protected ePoint_: Point;

    // 4个端点
    protected edgepointStart_: Point; // 终点法线起点
    protected edgepointEnd_: Point;  // 终点法线终点
    protected beginpointStart_: Point; //起点法线终点
    protected beginpointEnd_: Point; // 起点法线终点
   
    protected drawFromCenter_: boolean;

    // protected text_: PointText;

    // 延长线的长度
    protected length_: number;

    // 延长线在纵向的宽度
    protected rectRange_: number;

    // 所关联房间
    protected refRoom_: Room;

    // geos_ do the job
    // protected compoundpath_: CompoundPath;
    constructor(sPoint: Point, ePoint: Point, rectRange?: number, room?: Room ) {
        super();
        this.id_ = AuxilaryRect.GenerateId();
        this.sPoint_ = sPoint;
        this.ePoint_ = ePoint;
        this.edgepointEnd_ = null;
        this.edgepointStart_ = null;

        // this.text_ = null;
        this.rectRange_ = (rectRange) ? rectRange : 10;

        
        if(room) {
            this.findDirction(room);
            this.drawFromCenter_ = true;
            this.refRoom_ = room;
        } else {
            // 没有指定源房间
            this.generateEndPoints();
            this.drawFromCenter_ = true;
            this.refRoom_ = null;
        }
     
        const centerstart = this.getStartCenter();
        const centerend = this.getEndCenter();
        const line = new Line(centerstart, centerend);
        this.setPosition(line.middlePoint());
        const vec = new Vec2(centerend.x() - centerstart.x(), centerend.y() - centerstart.y());
        const angle = MathUtil.radianToAngle(MathUtil.Vec2ToRadian(vec));
        this.setRotationZ(angle);        
    }

    protected static GenerateId(): number {
        AuxilaryRect.maxId = AuxilaryRect.maxId + 1;
        AuxilaryRect.maxId = (AuxilaryRect.maxId) % AuxilaryRect.idmaxRange;
        return AuxilaryRect.maxId;
    }

    /**
     * 传入一个待序列化的对象，维护本地的id信息
     * 返回 维护后的ID
     * @param input 
     */
    protected static  maintainID(input: any): number {
        let result = null;
    
        if(input.id_ && input.id_ < AuxilaryRect.idmaxRange) {
            result = input.id_;
        } else {
            console.log('[AuxilaryRect]---[warning]: ID is not accepted from input val');
            return result;
        }

        if(AuxilaryRect.maxId < result) {
            AuxilaryRect.maxId = result;
        }       

        return result;
    }    

    //4个get
    // 左侧法线起点
    getLeftStartPoint(): Point {
        return this.beginpointStart_;
    }

    // 左侧法线终点
    getLeftEndPoint(): Point {
        return this.beginpointEnd_;
    }

    // 右侧法线起点
    getRightBeginPoint(): Point {
        return this.edgepointStart_;
    }

    // 右侧法线终点
    getRigthEndPoint(): Point {
        return this.edgepointEnd_;
    }  

    getStartCenter(): Point {
        if(this.beginpointEnd_ === null || this.beginpointStart_ === null) {
            return null;
        }

        if(this.drawFromCenter_) {
            const line = new Line(this.beginpointStart_,this.beginpointEnd_);
            const pointinfo = line.middlePoint();
            return pointinfo;
        } else {
            return this.beginpointStart_;
        }
    }

    getEndCenter(): Point {
        if(this.edgepointStart_ === null || this.edgepointEnd_ === null) {
            return null;
        }        
        if(this.drawFromCenter_) {
            const line = new Line(this.edgepointStart_, this.edgepointEnd_);
            const pointinfo = line.middlePoint();
            return pointinfo;
        } else {
            return this.edgepointStart_;
        }

    }
    
    drawFromCenter(): boolean {
        return this.drawFromCenter_;
    }



    protected generateEndPoints() {
       // 在两个端点，  分别向两个法线方向绘制半个标注线长度的线段
       this.beginpointStart_ = this.findalign(this.sPoint_, this.ePoint_, this.rectRange_ / 2.0,  10  , true);
       this.beginpointEnd_ = this.findalign(this.sPoint_, this.ePoint_, this.rectRange_ / 2.0,  10 , false);
       this.edgepointStart_ = this.findalign(this.ePoint_, this.sPoint_, this.rectRange_ / 2.0,  10 , true);
       this.edgepointEnd_ = this.findalign(this.ePoint_, this.sPoint_, this.rectRange_ / 2.0,  10 , false);

       if(!this.beginpointStart_) {
           this.beginpointStart_ = new Point(0,0);
       }

       if(!this.beginpointEnd_) {
           this.beginpointEnd_ = new Point(0,0);
       }

       if(!this.edgepointStart_) {
           this.edgepointStart_ = new Point(0,0);
       }

       if(!this.edgepointEnd_) {
           this.edgepointEnd_ = new Point(0,0);
       }
    }

    /**
     * 起始点
     * @param sPoint
     */
    setStartPoint(sPoint: Point, updateEnd: boolean = true) {
        this.sPoint_ = sPoint;
        if(updateEnd){
            this.updateEndPoints();
        }
    }    

    /**
     * 终点
     * @param ePoint
     */
    setEndPoint(ePoint: Point,updateEnd: boolean = true) {
        this.ePoint_ = ePoint;
        if(updateEnd) {
            this.updateEndPoints();
        }
    }

    // 设置边界线在边界的指示宽度
    setRangeWidth(range: number) {
        this.rectRange_ = range;
        this.updateEndPoints();
    }

    setDrawFromCenter(isCenter: boolean) {
        this.drawFromCenter_ = isCenter;
    }
    
    // 创建法线线段
    protected findalign(startPoint: Point, endPoint: Point, length: number, lengthlimit: number , bup: Boolean): Point {
        let alignx = (endPoint.y() - startPoint.y());
        let aligny = (startPoint.x() - endPoint.x());
        const sqrtnum = Math.sqrt(alignx * alignx + aligny * aligny);
        if (sqrtnum < lengthlimit) {
            return null;
        }
        alignx = (bup === true) ? alignx / sqrtnum * length : -alignx / sqrtnum * length;
        aligny = (bup === true) ? aligny / sqrtnum * length : -aligny / sqrtnum * length;

        return new Point(startPoint.x() + alignx, startPoint.y() + aligny);
    }

    // 判断辅助长度显示信息所处的位置
    findDirction(refRoom: Room) {
        // 起始点对应法线一
        // 10 —— 代表距离边缘多远时不显示辅助线
        const salign1 = this.findalign(this.sPoint_, this.ePoint_, this.rectRange_,  10  , true);
        const salign2 = this.findalign(this.sPoint_, this.ePoint_, this.rectRange_,  10 , false);
        const ealign1 = this.findalign(this.ePoint_, this.sPoint_, this.rectRange_,  10 , true);
        const ealign2 = this.findalign(this.ePoint_, this.sPoint_, this.rectRange_,  10 , false);

        let si1 = false;
        let si2 = false;


        if (null !== salign1 && !refRoom.containsPoint(salign1)) {
            // this.edgepointStart_ = salign1;
            // this.edgepointEnd_ = ealign2;
            this.beginpointEnd_ = salign1;
            this.edgepointEnd_ = ealign2;
            si1 = true;
        }

        if (null !== salign2 && !refRoom.containsPoint(salign2) && !si1) {
            // this.edgepointStart_ = salign2;
            // this.edgepointEnd_ = ealign1;
            this.beginpointEnd_ = salign2;
            this.edgepointEnd_ = ealign1;
            si2 = true;
        }

        this.beginpointStart_ = this.sPoint_;
        this.edgepointStart_ = this.ePoint_;

    }

     //更新几何相关信息
     updateEndPoints() {
        if(this.refRoom_ !== null) {
            this.findDirction(this.refRoom_);
        } else {
            this.generateEndPoints();            
        }

        const centerstart = this.getStartCenter();
        const centerend = this.getEndCenter();
        const line = new Line(centerstart, centerend);
        this.setPosition(line.middlePoint());
        const vec = new Vec2(centerend.x() - centerstart.x(), centerend.y() - centerstart.y());
        const angle = MathUtil.radianToAngle(MathUtil.Vec2ToRadian(vec));
        this.setRotationZ(angle);

     }

     showEntityInfo(): string {
         return 'auxilaryLine';
     }

 


}
// End
// declare type pointHandler = (pointinfo: Point) => void;

// 采用和baseentity一样的方式存储图像数据和一样的绘图方式
export class AuxilaryPoints extends BaseEntity {
    protected points_: Array<Point>;

    protected lineColor_: string;

    protected promosingattach_: Point;

    // 十字线点数目
    protected axispointNum_: number;

    // 黑框点数目
    protected rectpointNum_: number;

    // 垂直交点数目
    protected vtpointNum_: number;

    protected  functionmapfordraw_: Map<string, (pointinfo: Point) => void>;

    // 十字线标记
    drawAxisPoint (pointinfo: Point): void {
        // 生成图元名称
        const str1 = 'axisline' + (this.axispointNum_++).toString();
        const str2 = 'axisline' + (this.axispointNum_++).toString();

        //  垂直线
        const vline = new Line(new Point(pointinfo.x() + 5, pointinfo.y() - 5),
        new Point(pointinfo.x() - 5 , pointinfo.y() + 5));
        // vline.setStrokeColor('green');
        this.geos_[str1] = vline;

        // 竖直线
        const tline = new Line(new Point(pointinfo.x() - 5, pointinfo.y() - 5),
        new Point(pointinfo.x() + 5, pointinfo.y() + 5));
        // tline.setStrokeColor('green');

        this.geos_[str2] =  tline;
    }

    // 方块标记
    drawRectPoint(pointinfo: Point): void {
        // 生成图元名称
        const str1 = 'rectmark' + (this.rectpointNum_++).toString();

        const rect1 = new Rect(new Point(pointinfo.x() - 5 , pointinfo.y() - 5),
    10, 10);

        // rect1.setStrokeColor('grey');

        this.geos_[str1] = rect1;
    }

    // 垂直标记
    drawverticalmark(pointinfo: Point): void {
        // 生成图元名称
        const str1 = 'verticaline' + (this.vtpointNum_++).toString();
        const str2 = 'verticaline' + (this.vtpointNum_++).toString();

        const line1 = new Line(new Point(pointinfo.x(), pointinfo.y() - 10),
        new Point(pointinfo.x(), pointinfo.y() + 10));
        // line1.setStrokeColor('blue');
        const line2 = new Line(new Point(pointinfo.x() - 10, pointinfo.y()),
        new Point(pointinfo.x() + 10, pointinfo.y()));
        // line2.setStrokeColor('blue');

        this.geos_[str1] = line1;
        this.geos_[str2] = line2;
    }

    // protected dashArray_: Array<number>;

    // protected compoundpath_: CompoundPath;



    tryFindAttachment(currentPoint: Point): Point {
        if (this.promosingattach_ !== null) {
            return this.promosingattach_;
        }

        const temparray = new Array<Point>();
        let refp = false;
        for (let i = 0; i < this.points_.length; i++) {
            if (this.points_[i].distanceTo(currentPoint) < 2) {
                refp = true;
            }
            temparray.push(this.points_[i]);
        }

        if (refp === false) {
            temparray.push(currentPoint);
        }
        temparray.sort(MathUtil.sortByPointX);

        let xinfo = NaN;
        let yinfo = NaN;
        for (let i = 0 ; i < temparray.length - 1; i++) {
            if (Math.abs(temparray[i].x() - temparray[i + 1].x()) < 1) {
                xinfo = temparray[i].x();
            }

        }

        temparray.sort(MathUtil.sortByPointY);

        for (let i = 0 ; i < temparray.length - 1; i++) {
            if (Math.abs(temparray[i].y() - temparray[i + 1].y()) < 1) {
                yinfo = temparray[i].y();
            }

        }

        if (isNaN(xinfo) || isNaN(yinfo)) {
            return null;
        } else {
            const newpoint = new Point(xinfo, yinfo);
            this.points_.push(newpoint);
            return newpoint;
        }
    }

    //数组去重
    protected  unique(arr: Array<Point>): Array<Point> {
        const tmpar =  Array<Point>();    //定义一个临时数组
        for (let i = 0; i < arr.length; i++) {    //循环遍历当前数组

            // 判断当前数组下标为i的元素是否已经保存到临时数组
            // 如果已保存，则跳过，否则将此元素保存到临时数组中

            if (tmpar.indexOf(arr[i]) === -1) {
                tmpar.push(arr[i]);
            }
        }

        return tmpar;

    }

    protected tryBuildDirectAngle(eventPoint: Point): void {
        for (let i = 0; i < this.points_.length - 1; i++) {
            for (let j = i + 1; j < this.points_.length; j++) {
                const p2 = this.points_[i];
                const p3 = this.points_[j];

                // 找到可能的垂线交点
                if (MathUtil.tryBuildRectAngle(eventPoint, p2 , p3)) {
                    const rectp1 = new Point(p2.x(), p3.y());
                    rectp1.setSeedType('directangle');
                    const rectp2 = new Point(p3.x(), p2.y());
                    rectp2.setSeedType('directangle');
                    if (eventPoint.distanceTo(rectp1) > eventPoint.distanceTo(rectp2)) {
                        this.points_.push(rectp2);
                        this.promosingattach_ = rectp2;
                    } else {
                        this.points_.push(rectp1);
                        this.promosingattach_ = rectp1;
                    }

                    return;
                }
            }
        }

        return;
    }

    constructor(pointinfo: Array<Point>, eventpoint: Point) {
        super();
        this.promosingattach_ = null;
        this.points_ = this.unique(pointinfo);
        this.tryBuildDirectAngle(eventpoint);
        this.axispointNum_ = 0;
        this.vtpointNum_ = 0;
        this.rectpointNum_ = 0;
    }

    lineColor(color: string) {
        this.lineColor_ = color;
    }
    // destoryPath() {
    //     super.destoryPath();
    //     this.linePath_.remove();
    //     this.linePath_.removeSegments();
    // }
    destoryPath() {
        super.destoryPath();
        while (this.points_.length > 0) {
            this.points_.pop();
        }

        this.geos_.clear();
        this.axispointNum_ = 0;
        this.vtpointNum_ = 0;
        this.rectpointNum_ = 0;
        //this.compoundpath_.remove();
        //this.compoundpath_.removeChildren();
    }

    drawEntity() {
        if (this.points_.length <= 1) {
            return;
        }
        for (let i = 0; i < this.points_.length; i++) {
            const strp = this.points_[i].getSeedType();

            if (strp === 'directangle') {
                this.drawverticalmark(this.points_[i]);
            } else {
                this.drawAxisPoint(this.points_[i]);
            }
        }

    }


}

export class AuxiliaryLine extends BaseEntity {

    protected line_: Line;
    protected linePath_: Path;

    protected lineColor_: string;

    protected dashArray_: Array<number>;

    //protected

    constructor(line: Line) {
        super();
        this.line_ = line;
        this.linePath_ = new Path();
        this.lineColor_ = 'green';
        this.dashArray_ = [10, 10];
        //this.linePath_.
    }

    lineColor(color: string) {
        this.lineColor_ = color;
    }

    protected updatePath() {
        this.linePath_.strokeColor = this.lineColor_;
        this.linePath_.dashArray = this.dashArray_;
        this.linePath_.removeSegments();
        this.linePath_.moveTo(this.line_.startPoint().toPaperPoint());
        this.linePath_.lineTo(this.line_.endPoint().toPaperPoint());
    }

    destoryPath() {
        super.destoryPath();
        this.linePath_.remove();
        this.linePath_.removeSegments();
    }
}
