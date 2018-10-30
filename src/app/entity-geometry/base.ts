import { FlipStatus } from './../houselayout/entity/opening';


import {BaseEntity, LayerStage} from '../entity/entity'
import {BasePath, BasePathFactory, PathGeoRelation} from '../path/path'
import {Style, Item, Layer} from 'paper'
import {Point, BaseGeometry, Segment} from '../geometry/geometry'
import * as MathUtil from '../math/math'

export class BaseEntityGeometry {
    protected refEntity_: BaseEntity = null;
    protected geos_: Map<string,  BasePath> = null;

    constructor(refEntity: BaseEntity) {
        if (refEntity === undefined) {
            //  console.log('refEntity is undefined');
        }
        this.refEntity_ = refEntity;
        this.geos_ = new Map<string, BasePath>();
    }

    updatePath() {
        if (this.refEntity_ !== null && !this.refEntity_.isDirty()) {
            return;
        }

        this.updateGeometry();

        for (const name in this.geos_) {
            if (name === null) {
                continue;
            }

            const geometry = <BasePath>this.geos_[name];
            if (geometry === null) { 
                continue;
            }

            geometry.update();

            const flipstatus = this.getflipStatus();
            this.flipgeometry( geometry, flipstatus);

            if (this.refEntity_ !== null) {
                const matrix = this.refEntity_.getPathMatrix();
                geometry.transform(matrix);
            }
        }

        // // 渲染完， 数据一致， 设置dirty的标记为false
        // if (this.refEntity_ !== null) {
        //     this.refEntity_.setIsDirty(false);
        // }
    }

    getflipStatus() : FlipStatus {
        return FlipStatus.NO_FLIP;
    }

    protected flipgeometry(pathinfo: BasePath, flipstatus: FlipStatus) {
        if(!pathinfo) {
            return;
        }
        const flipPara = [1 , 1];
        if(flipstatus === FlipStatus.HORIZON_FLIP) {
            flipPara[0] = -1;
            flipPara[1] = 1;
        } else if(flipstatus === FlipStatus.VERTICAL_FLIP) {
            flipPara[0] = 1;
            flipPara[1] = -1;
        } else if(flipstatus === FlipStatus.OPPOSITE_FLIP) {
            flipPara[0] = -1;
            flipPara[1] = -1;
        }

        const pivotPoint = new Point(0,0);
        pathinfo.scale(flipPara[0], flipPara[1], pivotPoint.toPaperPoint());
        
    }

    protected updateGeometry() {

    }

    /**
     * 设置子路径的样式
     * @param name
     * @param style
     */
    setSubPathStyle(name: string, style:Style) {
        if (!(this.geos_.has(name))) {
            return;
        }

        (<BasePath>(this.geos_[name])).style = style;
    }

    /**
     * 获取子路径的样式
     * @param name
     */
    subPathStyle(name: string): Style {
        if (!(this.geos_.has(name))) {
            return null;
        }

        return this.geos_[name].style();
    }

    /**
     * 设置几何形状
     * @param geos_
     */
    setGeos(geos_: Map<string, BasePath> ) {
        if (geos_ === null) {
            return ;
        }

        this.geos_ = geos_;
    }

    /**
     * 是否包含paper item
     */
    containsItem(item: Item): boolean {
        for (const name in this.geos_) {
            if (name === null) {
                continue;
            }

            const geometry = <BasePath> this.geos_[name];
            if (geometry === item) {
                return true;
            }
        }

        return false;
    }

    overLapWith(itempath_: Segment, p1:Point, p2:Point) {
        this.updateGeometry();
        const mathinfo = this.refEntity_.getPathMatrix();

        const geometryArray = this.getOuterGeos();
        for(let i = 0; i < geometryArray.length;i++) {
                const geoinfo = geometryArray[i];
                const result =  MathUtil.CalcGeoRelationShip(itempath_,geoinfo,mathinfo);
                if(result !== null && result.relationType === PathGeoRelation.PATH_CONSISTING) {
                   // return result.crossings_;
                   p1.setX(result.crossings_[0].x());
                   p1.setY(result.crossings_[0].y());
                   p2.setX(result.crossings_[1].x());
                   p2.setY(result.crossings_[1].y());  
                   return true;                 
                } 
                
        }
    
        return false;
    }

    /**
     * 銷毀渲染的元素
     */
    destory() {
        for (const name in this.geos_) {
            if (name === null) {
                continue;
            }

            const geometry = <BasePath>this.geos_[name];
            if (geometry !== null) {
                geometry.remove();
            }
        }
    }

    refEntity(): BaseEntity {
        return this.refEntity_;
    }

    // 获取边界点集合
    getOuterGeos():Array<BaseGeometry> {
        return null;
    }

    /**
     * 设置图层名称
     * @param layerName 
     */
    setLayerStage(layerStage: LayerStage) {
        if(this.refEntity_) {
            this.refEntity_.setLayerStage(layerStage);
        }
    }

    /**
     * 获取图层名称
     */
    getLayerStage(): LayerStage{
        if(this.refEntity_) {
            return this.refEntity_.getLayerStage();
        }

        return null;
    }

    moveToLayer(layerInfo: Layer) {
        // 遍历所有path
        for (const name in this.geos_) {
            if (name === null) {
                continue;
            }

            const geometryPathInfo = <BasePath>this.geos_[name];
            if(geometryPathInfo === null ){
                console.log('error, entityGeo used without path generated.');
                console.log(this.refEntity_.showEntityInfo() + this.refEntity_.id() + ':' + name);
                continue;
            }

            /// 找到entityGeo中的path当前对应的图层        
            const correspondingLayer = geometryPathInfo.layer;
            if(correspondingLayer === layerInfo) {
                continue;
            }
            
            if(correspondingLayer === null) {
                continue;
            }

            /// 如果当前图层与指定图层不一致, 从当前图层移出
            const cindex = correspondingLayer.children.indexOf(geometryPathInfo);
            if(cindex >= 0) {
                correspondingLayer.removeChildren(cindex, cindex + 1);
            }

            /// 迁移到新图层
            layerInfo.addChild(geometryPathInfo);
        }      
    }
     

}
