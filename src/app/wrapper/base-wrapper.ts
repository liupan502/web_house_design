import {Design, BaseEntity, MouseSymbol,DoorwayFlag,OneDoorFlag,TwoDoorsFlag,SlidingDoorsFlag,
        FixedWindowFlag,FloorWindowFlag,UphillFlag,PipelienFlag,StrongElectricBoxFlag,BayWindowFlag,
        FloorDrainlFlag,PillarFlag,FlueFlag,WeakBoxFlag, KtFlag,RadiatorFlag,HangingFireplaceFlag,GasMeterFlag,
        WaterMeterFlag,GirderFlag,StrongElectricBox2DFlag,WeakBox2DFlag,Kt2DFlag,HouseLayout  } from '../houselayout/entity/entity'
import {Point as PaperPoint} from 'paper'
import {Point} from '../geometry/geometry'
import {BaseEntityGeometry} from '../entity-geometry/entity-geometry'

export class BaseWrapper {
    protected design_: Design;
    protected outSceneObject_: Map<string, BaseEntity>;


    constructor(design: Design) {
        this.design_ = design;
        this.outSceneObject_ = new Map<string, BaseEntity>();
    }



    /*updateView() {
        for (const key in this.outSceneObject_) {
            if (key) {
                this.outSceneObject_[key].updateView();
            }
        }
    }*/

    /*updateDesignView() {
        if (this.design_ !== null) {
            this.design_.updateView();
        }
    }*/

    /*destoryPath() {
        for (const key in this.outSceneObject_) {
            if (key !== null) {
                const object = (<BaseEntity> this.outSceneObject_[key]);
                if (object.isTmp()) {
                    object.destoryPath();
                }
            }
        }

        this.outSceneObject_.clear();
    }*/

    /**获取绘图数据*/
    getHouseLayout(): HouseLayout {
        return this.design_.houseLayout();
    }

    /**
     * 根据名称创建item
     * 创建失败则返回null,
     * @param name
     */
     createItem(name: string): BaseEntity {
        return null;
    }
}
