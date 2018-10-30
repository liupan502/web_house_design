import { element } from 'protractor';
import {BaseEntityGeometry} from './base'
import {Item, Layer, Group, Style} from 'paper'
import {SceneElement} from './scene2d'

import {BaseEntity,LayerStage} from '../entity/entity'

class LayerElement {
    protected stage_: LayerStage;
    protected layer_: Layer;
    protected entities_: Map<string, BaseEntityGeometry>;

    constructor(stage: LayerStage) {
        this.stage_ = stage;
        this.layer_ = new Layer();
        this.entities_ = new Map<string, BaseEntityGeometry>();
    }


    /**
     * 激活图层
     * @param element 
     */
    activateWithElement(element: SceneElement) {
        if (element === null) {
            this.layer_.activate();
            return true;
        }

        if (this.entities_.has(element.name())) {
        } else {
            this.entities_.set(element.name(), element.object());    
        }

        // 如果当前entityGeo的path没在实际图层，
        // （这种情况会出现，因为path在createGeometry就会创建，）

        //this.layer_.activate();
        element.object().moveToLayer(this.layer_);
        return true;
    }

    /**
     * 
     */
    activate() {
       // this.layer_.activate();
    }



    layerStage(): LayerStage {
        return this.stage_;
    }

    getLayer(): Layer{
        return this.layer_;
    }

    isBelow(toElement: LayerElement): boolean{
        return this.getLayer().isBelow(toElement.getLayer());
    }
}


/**
 * 使用LayerElement
 * @desc manager 来保证按照LAYER_STAGE_ONE 至 LAYER_STAGE_EIGHT 的顺序，
 */
export class GroupLayerManager {
    protected container_: Array<LayerElement>;
    protected currentLayer_: LayerElement;
    constructor() {
        this.container_ = new Array<LayerElement>();
        //const layer = new LayerElement('default');
        //layer.activate();
        //this.container_.push(layer);
        this.currentLayer_ = null;
    }

    /**
     * 仅用于比较
     * @param source 
     * @param to 
     */
    protected CompareBetweenLayer(source: LayerElement, to: LayerElement) {
        if(source.isBelow(to)){
            return -1;
        } else {
            return 1;
        }
    }

    /**
     * @param element 
     * @description 只能在render时调用，因为它只与渲染有关
     * 图层信息跟随sceneElement，因此Scene2D本身对实体图层信息不关心
     */
    switchToLayer(element: SceneElement): boolean {
        let layerStage = null;
        if (null === element) {
            console.log('!!switch to layer with null element!!');
            return false;
        } else {
            // entityGeometry会记录与图层有关信息
            layerStage = element.object().getLayerStage();
        }

        /// layerStage 为空说明是没有对应Entity（辅助线等），不需要记录在图层中
        if(layerStage === null) {
            // console.log('!!invalid stage info' + element.name() + element.layerName());

            return false;
        }

        let layerexist = false;
        // 如果图层存在，激活对应图层
        for (let i = 0; i < this.container_.length; i++) {
            if (layerStage === this.container_[i].layerStage()) {
                layerexist = true;
                this.container_[i].activateWithElement(element);
                this.currentLayer_ = this.container_[i];
                return true;
            }
        }

        // 指定图层不存在，新建图层，并添加到图层容器中
        if (!layerexist) {
           const layer = new LayerElement(layerStage);
           layer.activateWithElement(element);
           this.container_.push(layer); 
           this.currentLayer_ = layer;
        }

        return true;
    }

    /**
     * 指定图层级别进行转换，如果没有对应名称图层，则返回失败
     * @param layerStage 图层级别
     */
    switchWithLayerName(layerStage: LayerStage): boolean{
        let result = false;
        for (let i = 0; i < this.container_.length; i++) {
            if (layerStage === this.container_[i].layerStage()) {
                // layerexist = true;
                this.container_[i].activate();
                result = true;
                this.currentLayer_ = this.container_[i];
                return result;
            }
        }

        return result;
    }  
    
    /**
     * 只需要返回当前图层名称
     */
    getCurrentLayerStage(): LayerStage {
        if(this.currentLayer_ !== null) {
            return this.currentLayer_.layerStage();
        } else {
            return null;
        }
    }

    /**
     * 根据图层级别获取其样式
     * @param layerStage 图层级别 
     */
    getLayerStyle(layerStage: LayerStage) : Style {
        for(let i =0; i < this.container_.length;i++) {
            if(this.container_[i].layerStage() === layerStage) {
                return this.container_[i].getLayer().style;
            }
        }

        return null;
    }

    /**
     * 根据图层名称设置样式
     * @param layerName 
     * @param styleInfo 
     */
    setLayerStyle(layerStage: LayerStage, styleInfo: Style): boolean {
        let result = false;
        for(let i = 0; i < this.container_.length; i++) {
            if(this.container_[i].layerStage() === layerStage) {
                this.container_[i].getLayer().style = styleInfo;
                result = true;
                return result;
            }
        }

        return result;
    }

    /**Begin： 对图层顺序的操作 */

    /**
     * 按照从下至上的顺序依此返回图层级别
     * 
     */
    getLayerSequenceFromBack2Front(): Array<LayerStage> {
        // 所有图层的顺序即时计算，manager内部不保存
        const sequenceArray = Array.from(this.container_);
        sequenceArray.sort(this.CompareBetweenLayer); 
        const nameArray = new Array<LayerStage>();

        for(let i = 0; i < sequenceArray.length;i++) {
            nameArray.push(sequenceArray[i].layerStage());
        }

        return nameArray;
    }


    /**
     * 检查图层是否按照枚举顺序排列，如果不符，则调换图层顺序使之相符
     */
    swapLayerSequence(): boolean {
        return false;
    }
    
    /**End: 对图层顺序的操作 */

    selectLayer(layerStage: LayerStage) {
        for(let i = 0; i < this.container_.length; i++) {
            if(this.container_[i].layerStage() !== layerStage) {
                // this.container_[i].getLayer().opacity = 0.1;
                this.container_[i].getLayer().strokeColor = 'orange';
                this.container_[i].getLayer().visible = true;
                this.container_[i].getLayer().sendToBack();
            } else {
                this.container_[i].getLayer().visible = true;
            }
        }
    }



 }