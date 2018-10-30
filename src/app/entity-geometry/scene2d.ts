import {BaseEntityGeometry} from './base'
import {Item, Layer, Project} from 'paper'

import {BaseEntity, LayerStage} from '../entity/entity'
import {GroupLayerManager} from './grouplayer'


export class SceneElement {
    protected name_: string;

    protected object_: BaseEntityGeometry;

    constructor(name: string, object: BaseEntityGeometry) {
        this.name_ = name;
        this.object_ = object;
    }

    name(): string {
        return this.name_;
    }

    object(): BaseEntityGeometry{
        return this.object_;
    }

    /**
     * 图层名称
     */
    layerName(): LayerStage {
        return this.object().getLayerStage();
    }
}

export class Scene2D {
    protected objects_: Array<SceneElement> = [];

    /**用来管理图层 */
    protected layerManager_: GroupLayerManager;

    constructor() {
        this.objects_ = new Array<SceneElement>();
        this.layerManager_ = new GroupLayerManager();
    }

    /**
     * 向场景中添加可渲染的元素，
     * 如果场景中已经存在同名的元素，则添加失败，返回false,
     *
     * @param name
     * @param object
     */
    addObject(name: string, object: BaseEntityGeometry ): boolean {
        if (name === null || name === undefined) {
            return false;
        }

        if (object === null || object === undefined) {
            return false;
        }

        if (this.getObjectIndex(name) >= 0) {
            return false;
        }


        this.objects_.push(new SceneElement(name, object));
        return true;
    }

    /**
     * 根据名字从场景中删除可渲染的元素
     */
    removeObject(name: string) {
        const index = this.getObjectIndex(name);
        if (index < 0) {
            return;
        }

        if (this.objects_[index] !== null) {
            const entityGeometry = this.objects_[index].object();
            if (entityGeometry !== null) {
                entityGeometry.destory();
            }
        }

        this.objects_.splice(index, 1);
    }

    /**
     * 删除所有的可渲染元素
     */
    removeAll() {

    }

    /**
     * 渲染数据
     */
    render() {
        for (let i = 0; i < this.objects_.length; i++) {
            const object = this.objects_[i].object();
            if (object !== null && object !== undefined) {
                // 暂存现有图层
               const currentLayerStage = this.layerManager_.getCurrentLayerStage();


                // 切换到指定图层
                this.layerManager_.switchToLayer(this.objects_[i]);
                object.updatePath();

                // 切换到默认图层
                this.layerManager_.switchWithLayerName(currentLayerStage);
            }
        }  

        // 确保图层按照枚举规定顺序排列
        this.layerManager_.swapLayerSequence();
    }

    ///TEMP!!!
    setLayerSelected(layerInfo: LayerStage) {
        const styleinfo =  this.layerManager_.selectLayer(layerInfo);
    }
    ///TEMP!!!
    

    /**
     * 根据 paper item ， 返回关联的object
     * @param item
     */
    getObject(item: Item): BaseEntity {
        if (this.objects_ == null) return null;
        for (let i = 0; i < this.objects_.length; i++) {
            const object = this.objects_[i].object();
            if (object === null || object === undefined) {
                continue;
            }
            if (object.containsItem(item)) {
                const entity = object.refEntity();
                return entity;
            }
        }
        return null;
    }

    protected getObjectIndex(name: string): number {
        if (name === null || name === undefined) {
            return -1;
        }

        for (let i = 0; i < this.objects_.length; i++) {
            const object = this.objects_[i];
            if(object.name() === name) {
                return i;
            }
        }

        return -1;
    }

    // /**
    //  * 将视图中的某一元素添加到图层到图层中管理
    //  * @param layername
    //  * @param objectinfo
    //  */
    // protected sendSceneObjectTolayer(layername: string, objectinfo: SceneElement) {
    //     this.layerManager_.addToLayer(layername, objectinfo);
    // }

    // /**
    //  * 将指定的图层下移一层
    //  * @param layername 图层名称
    //  */
    // protected layersendBack(layername: string): boolean {
    //     return this.layerManager_.sendbackLayer(layername);
    // }

    // /**
    //  * 将指定的图层上移
    //  * @param layername 图层名称
    //  */
    // protected layersendAbove(layername: string): boolean {
    //     return this.layerManager_.sendaboveLayer(layername);
    // }

    /**
     * layerstyle
     */

     /**
      * layerAnimate
      */


}
