import {PathItem, Path, Point as PaperPoint, Matrix, Item, PointText } from 'paper'
import {Point} from '../geometry/geometry'
import {Vector2 as Vec2} from 'three'
import { Segment, BaseGeometry, Rect , Line, Polygon} from '../geometry/geometry'
import {BaseEntityGeometry} from '../entity-geometry/entity-geometry'
import * as MathUtil from '../math/math'
export interface Serializable<T> {
    //deserialize(input: Object): T;

    injectinfo(input: Object): void;

   // serialize(): object;

}

export interface IShowBaseType {
    showEntityInfo() ;

}

/**
 * 图层分层
 */
export enum LayerStage {
    LAYER_STAGE_ONE = 0 ,
    LAYER_STAGE_TWO ,
    LAYER_STAGE_THREE,
    LAYER_STAGE_FOUR,
    LAYER_STAGE_FIVE,
    LAYER_STAGE_SIX,
    LAYER_STAGE_SEVEN,
    LAYER_STAGE_EIGHT,
};


export class  BaseEntity  implements Serializable<BaseEntity>, IShowBaseType {


    id_: number;

    // 如果当前数据和显示的数据不一致，则是脏数据，
    // 反之则不是
    // 所有baseEntity接口需要管理接口的操作对该状态的变化
    protected isDirty_: boolean;

    protected isVisible_: boolean;

    protected width_: number;

    protected length_: number;

    protected height_: number;

    protected position_: Point;

    protected rotationZ_: number;

    protected subObjects_: Map<string, BaseEntity>;

    protected scale_: number;

    protected isAttachedTowall_: boolean;

    protected geos_: Map<string, BaseGeometry>;

    protected texts_: Set<PointText>;

    // 如果数据只是添加到场景中但并未添加到设计中
    // 则是临时数据，反之不是临时数据
    protected isTmp_: boolean;

    /**区分图层 */
    protected layerStage_: LayerStage;
    // 物体底部离地高度
    protected distancefromground_: number;

    protected isBeingSelected_:boolean;
    protected isBeingDragged_:boolean;

    constructor() {
        this.isDirty_ = true;
        this.isVisible_ = true;

        this.width_ = 0.0;
        this.height_ = 0.0;
        this.length_ = 0.0;
        //this.radius_ = 0.0;
        this.position_ = new Point(0.0, 0.0);
        this.distancefromground_ = 0.0
        this.rotationZ_ = 0.0;
        this.subObjects_ = new Map<string, BaseEntity>();
        this.scale_ = 1.0;
        this.isAttachedTowall_ = false;
        this.geos_ = new Map<string, BaseGeometry>();
        this.texts_ = new Set<PointText>();
        this.isTmp_ = true;
        this.isBeingDragged_ = false;
        this.isBeingSelected_ = false;
        /**默认在底层图层上 */
        this.layerStage_ = LayerStage.LAYER_STAGE_ONE;
    }


    protected jsonobjtoPathItem(obj: object): PathItem {
        return new PathItem();
    }



    debug() {
        //
    }

    // 用来接收前端传递的属性修改消息
    alerterinfo(input: Object) {

    }

    drawEntity() {
    }


    //返回一个可以JSON.stringify的Object
    toJSON() {
        const result = {} as any ;
        result.width_ = this.width_;
        result.length_ = this.length_;
        result.height_ = this.height_;
        const position = {} as any ;
        position.x_ = this.position_.x();
        position.y_ = this.position_.y();
        result.position_ = position ;
        result.rotationZ_ = this.rotationZ_;
        result.layerStage_ = this.layerStage_;
        result.isAttachedTowall_ = this.isAttachedTowall_;
        return result;
    }

    //传入参数为JSON.Parse后的数据
    fromJSON(input) {
        if (null === input) {
            return;
        }
        this.width_ = (input.width_) ? input.width_ : this.width_;
        this.length_ = (input.length_) ? input.length_ : this.length_;
        this.height_ = (input.height_) ? input.height_ : this.height_;
        this.rotationZ_ = (input.rotationZ_) ? input.rotationZ_ : this.rotationZ_;
        if (input.position_ !== null && input.position_ !== undefined) {
            this.position_  = new Point(input.position_.x_,input.position_.y_);
        }
        this.layerStage_ = (input.layerStage_) ? input.layerStage_ : this.layerStage_;
        this.isAttachedTowall_ = (input.isAttachedTowall_) ? input.isAttachedTowall_ : this.isAttachedTowall_;

        return this;
    }

    id(): number {
        return this.id_;
    }

    isDirty(): boolean {
        return this.isDirty_;
    }

    setIsDirty(isDirty: boolean) {
        this.isDirty_ = isDirty;
        for (const key in this.subObjects_) {
            if (key) {
                if (null !== this.subObjects_[key]) {
                    this.subObjects_[key].setIsDirty(isDirty);
                }
            }
        }
    }

    isVisible(): boolean {
        return this.isVisible_;
    }

    setIsVisible(isVisible: boolean) {
        this.isVisible_ = isVisible;
    }

    setWidth(widthInfo: number) {
        if (!isNaN(widthInfo)) {
            this.width_ = widthInfo;
            this.setIsDirty(true);
        }
    }

    setHeight(heightInfo: number) {
        if (!isNaN(heightInfo)) {
            this.height_ = heightInfo;
            this.setIsDirty(true);
        }
    }

    distancefromground(): number {
        return this.distancefromground_;
    }

    setdistancefromground(val: number) {
        this.distancefromground_ = val;
    }

    setLength(lengthInfo: number) {
        if (!isNaN(lengthInfo)) {
            this.length_ = lengthInfo;
            this.setIsDirty(true);
        }
    }

    width(): number {
        return this.width_;
    }

    height(): number {
        return this.height_;
    }

    length(): number {
        return this.length_;
    }

    radius(): number {
        return 0;
    }

    position(): Point {
        return this.position_;
    }





    path(): PathItem {
        return null;
    }

    rotate(degree: number) {
        this.rotationZ_ += degree;
        this.setIsDirty(true);
    }

    rotationZ(): number {
        return this.rotationZ_;
    }

    setId(id: number) {
        this.id_ = id;
    }

    setRotationZ(rotationZ: number) {
        this.rotationZ_ = rotationZ;
        this.setIsDirty(true);
    }

    /**
     * 根据偏移向量，平移物体
     * @param offset
     */
    translate(offset: Vec2) {
        this.position_.addation(offset);
        this.setIsDirty(true);
    }

    moveTo(newPosition: Point) {
        this.position_ = newPosition;
        this.setIsDirty(true);
    }

    scale(scale: number) {
        this.scale_ *= scale;
        for (const key in this.subObjects_) {
            if (key) {
                this.subObjects_[key].scale(scale);
            }
        }
        this.setIsDirty(true);
    }

    setIsSelected(selected: boolean) {
      this.isBeingSelected_ = selected;
   }

   isBeingSelected(): boolean{
     return this.isBeingSelected_;
   }

    setIsDragged(dragged: boolean) {
        this.isBeingDragged_ = dragged;
     }

     IsBeingDragged(): boolean{
       return this.isBeingDragged_;
     }

    getScale() {
       return this.scale_;
    }

    /**
     * 物体是否能够吸附在墙上
     */
    isAttachedToWall(): boolean {
        return this.isAttachedTowall_;
    }

    //attachedToWall(wall: )


    /**
     * 根据当前的旋转平移缩放参数，计算变换矩阵
     */
    getPathMatrix(): Matrix {
        const matrix = new Matrix(1, 0, 0, 1, 0, 0);
        matrix.rotate(this.rotationZ_, this.position().toPaperPoint());
        matrix.translate(this.position().x(), this.position().y());
        matrix.scale(this.scale_, new PaperPoint(0.0, 0.0));
        return matrix;
    }

    alterGeoInfo() {

    }



    /**
     * 废弃
     */
    updateView() {

    }



    setPosition(position: Point) {
        this.position_ = position;
        this.setIsDirty(true);
    }

    destoryPath(){

    }


    /**
     * author: fangchen
     * date: 20170921
     * feature : 返回包围点集合
    */
    getBBox(): Array<any> {
        let pointArray = new Array<any>();
        // for (const key in this.geos_) {
        //     if (key !== null) {
        //         const subGeoarray = (this.geos_[key]).getViewBox();
        //         if(subGeoarray === null) {
        //             return null;
        //         }
        //         pointArray = pointArray.concat(subGeoarray);
        //     }
        // }

        // for (const key in this.subObjects_) {
        //     if ( key !== null) {
        //         const subObjArray = this.subObjects_[key].getBBox();
        //         if(subObjArray === null) {
        //             return null;
        //         }
        //         pointArray = pointArray.concat(subObjArray);
        //     }
        // }
        //

        return  pointArray;
    }

     /**
     * author: fangchen
     * date: 20170921
     * feature : 返回包围rect
    */
    getBoundRect(): Array<Point> {
        let pointArray = this.getBBox();
        if (pointArray === null || pointArray.length < 1) {
            return null;
        }
        pointArray = pointArray.sort(MathUtil.sortByPointX);
        const leftupX = pointArray[0].x;
        const bottomrightX = pointArray[pointArray.length - 1].x;

        pointArray = pointArray.sort(MathUtil.sortByPointY);
        const leftupY = pointArray[0].y;
        const bottomrightY = pointArray[pointArray.length - 1].y;

        const returnArray = new Array<Point>();

        returnArray.push(new Point(leftupX, leftupY));
        returnArray.push(new Point(bottomrightX, bottomrightY));

        return returnArray;
    }


    attachToWall(wall: Segment, distance: number): boolean {
        return false;
    }

    showEntityInfo() {
        return "baseentity";
    }


    isTmp(): boolean {
        return this.isTmp_;
    }

    setIsTmp(isTmp: boolean) {
        this.isTmp_ = isTmp;
    }

    // cash-in
    injectinfo(input: Object) {

    }

    // cash-out
    reportinfo(): Object {
        const foo = {} as any;


        return foo;
    }

    /**
     * 设置图层级别
     * @param stage
     * @note 图层级别只能设置一次，再次设置不会生效
     */
    setLayerStage(stage: LayerStage) {
        // 初始状态下可以设置图层级别
        if(this.layerStage_ === LayerStage.LAYER_STAGE_ONE) {
            this.layerStage_ = stage;
        } else{
            // do nothing
        }
    }

    /**
     * 获取图层级别
     */
    getLayerStage(): LayerStage {
        return this.layerStage_;
    }


    // it's a shallow copy
    // 经过该函数， 只会向外clone自己的属性信息和数据信息
    // 几何信息不会透露
     shallowclone( ): any {
         // must do nothing
        return null;
     }

     //浅拷贝
     shallowCopy(rights: any) {
        const rightval = <BaseEntity>rights;
        this.isDirty_ = rightval.isDirty();
        this.isVisible_ = rightval.isVisible();
        this.width_ = rightval.width();
        this.height_ = rightval.height();
        this.length_ = rightval.length();
        //this.radius_ = 0.0;
        this.position_ = rightval.position().clone();
        this.rotationZ_ = rightval.rotationZ();
        // this.id_ = rightval.id_;
        this.setId(rightval.id());
        /// 子实体还是需要拷贝，但也是浅拷贝
        this.subObjects_.clear(); // = new Map<string, BaseEntity>();
        for (const key in this.subObjects_) {
            if (key) {
                this.subObjects_[key] =  rights.subObjects_[key].clone();
            }
        }


        this.scale_ = rightval.getScale();
        this.isAttachedTowall_ = rightval.isAttachedToWall();
        // this.texts_ = new Set<PointText>(); texts内容也是由基础内容得到的
        this.isTmp_ = rightval.isTmp();

        // 传递图层级别
        this.setLayerStage(rightval.getLayerStage());
        return null;
    }
 }
