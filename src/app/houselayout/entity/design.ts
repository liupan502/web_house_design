import { DrawHouseLayoutService } from './../service/draw-houselayout.service';
import { BaseEntityGeometry } from './../../entity-geometry/base';
import { BaseEntity } from './entity'
import { uuid } from '../../math/math';
import { HouseLayout } from './house-layout'
import { Background } from './background'
import { Opening } from './opening'
import { Point } from '../../geometry/geometry'
import { CompoundPath, PathItem, Point as PaperPoint } from 'paper'


export class Design extends BaseEntity {

    public uuid: string; // 前台id
 
    public designId: string; // 后台id

    protected houseLayout_: HouseLayout;

    protected opening_: Opening;

    protected opening2_: Opening;

    protected background_: Background;

    protected globalTranslation_: PaperPoint;

    protected globalScale_: number;

    protected globalRoatation_: number;

    //返回一个可以JSON.stringify的Object
    toJSON() {
        const result = {} as any;
        result.houseLayout = this.houseLayout_.toJSON();
        result.uuid = this.uuid;
        result.designId = this.designId;
        return result;
    }

    //传入参数为JSON.Parse后的数据
    fromJSON(input) {

        // super.fromJSON(input);
        if (input.houseLayout !== null && input.houseLayout !== undefined) {
            this.houseLayout_ = new HouseLayout().fromJSON(input.houseLayout);
        }

        if (input.uuid) {
            this.uuid = input.uuid;
        }
        if (input.designId) {
            this.designId = input.designId;
        }
        
        return this;
    }

    removeHouseLayOut() {
        /*this.houseLayout_.setIsDirty(true);
        this.houseLayout_.updateView();
        this.subObjects_.delete('houseLayout');
        this.houseLayout_ = new HouseLayout();
        this.destoryPath();
        this.setIsDirty(true);
        this.updateView();*/
    }

    addHouseLayout(house: HouseLayout) {
        this.houseLayout_ = house;
        this.houseLayout_.setIsDirty(true);
        this.subObjects_['houseLayout'] = this.houseLayout_;
        this.houseLayout_.updateView();
        this.setIsDirty(true);
        this.updateView();
    }

    constructor() {
        super();
        this.setIsDirty(true);
        // this.path_ = new CompoundPath(null);

        this.houseLayout_ = new HouseLayout();
        this.setIsTmp(false);

        this.subObjects_['houseLayout'] = this.houseLayout_;

        if (!this.uuid) {
            this.uuid = uuid();
        }
    }

    setHouseLayout(houselay: HouseLayout) {
        this.houseLayout_ = houselay;
    }

    houseLayout(): HouseLayout {
        return this.houseLayout_;
    }

    protected updatePath() {

    }

    mapPointFromCanvasToDesign(point: Point): Point {
        return point;
    }

    mapPointFromDesignToCanvas(point: Point): Point {
        return point;
    }

    /**
     * 根据数据信息一次性生成与之关联的所有EntityGeometry
     * 各个模块负责自己的entityGeo生成
     */
    generateEntityGeometries(): Map<string, BaseEntityGeometry> {
        // 1. 调用houseLayout的generaetEntityGeometries生成相关实体的entityGeo集合
        const houseLayoutEntityGeo = this.houseLayout_.generateEntityGeometries();

        // 2. 调用Ceiling的generateEntityGeometries
        // const ceilingEntityGeo = this.houseLayout_.generateEntityGeometries();

        // const arrayOfEntityGeo = houseLayoutEntityGeo.contact(ceilingEntityGeo);

        return houseLayoutEntityGeo;

    }
}
