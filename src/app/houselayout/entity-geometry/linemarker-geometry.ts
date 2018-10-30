import {AuxilaryRect, LayerStage} from '../entity/entity';
import * as MathUtil from '../../math/math';
import {BaseGeometry, Point, Line} from '../geometry/geometry';
import {  Layer } from 'paper';
import {BaseEntityGeometry, HouseLayoutGeometryFactory} from './entity-geometry';
import {LinePath, BasePath, MarkerText} from '../path/path';

export class LinemarkerEntityGeometry extends BaseEntityGeometry{
    // 起点的垂直线
    static readonly LINESTART = 'line1';

    // 终点的垂直线
    static readonly LINEEND = 'line2';

    // 起点终点连线
    static readonly LINECONNECT = 'line3';

    // 标注信息
    static readonly TEXTINFO = 'textinfo';
    

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    
    constructor(auxEntity: AuxilaryRect) {
        super(auxEntity);
        this.tmpGeos_ = new Map<string, BaseGeometry>();   
        
        const leftStartPoint = auxEntity.getLeftStartPoint();
        const leftEndPoint = auxEntity.getLeftEndPoint();

        const rightStartPoint = auxEntity.getRightBeginPoint();
        const rightEndPoint = auxEntity.getRigthEndPoint();

        const centerstartp = auxEntity.getStartCenter();
        const centerendpoint = auxEntity.getEndCenter();

        /// 更新时更新tmpGeos
        this.tmpGeos_[LinemarkerEntityGeometry.LINESTART] = new Line(leftEndPoint, leftEndPoint);

        this.tmpGeos_[LinemarkerEntityGeometry.LINEEND] = new Line(rightStartPoint, rightEndPoint);

        this.tmpGeos_[LinemarkerEntityGeometry.LINECONNECT] = new Line(centerstartp, centerendpoint);



        this.geos_[LinemarkerEntityGeometry.LINESTART] = new LinePath(this.tmpGeos_[LinemarkerEntityGeometry.LINESTART]);
        this.geos_[LinemarkerEntityGeometry.LINEEND] = new LinePath(this.tmpGeos_[LinemarkerEntityGeometry.LINEEND]);
        this.geos_[LinemarkerEntityGeometry.LINECONNECT] = new LinePath(this.tmpGeos_[LinemarkerEntityGeometry.LINECONNECT]);
        this.geos_[LinemarkerEntityGeometry.TEXTINFO] = new MarkerText(this.tmpGeos_[LinemarkerEntityGeometry.LINECONNECT]);

 
        (<BasePath>this.geos_[LinemarkerEntityGeometry.LINESTART]).style.strokeColor = 'grey';
        (<BasePath>this.geos_[LinemarkerEntityGeometry.LINEEND]).style.strokeColor = 'grey';
        (<BasePath>this.geos_[LinemarkerEntityGeometry.LINECONNECT]).style.strokeColor = 'grey';        
        
    }   

    protected getAuxliaryRect(): AuxilaryRect {
        return <AuxilaryRect> this.refEntity_;
    }    

    protected updateGeometry() {   
        const auxEntity = this.getAuxliaryRect();
        const leftStartPoint = auxEntity.getLeftStartPoint();
        const leftEndPoint = auxEntity.getLeftEndPoint();
        if(leftStartPoint === null || leftEndPoint === null) {
            return;
        }

        const rightStartPoint = auxEntity.getRightBeginPoint();
        const rightEndPoint = auxEntity.getRigthEndPoint();

        const centerstartp = auxEntity.getStartCenter();
        const centerendpoint = auxEntity.getEndCenter();

        

        const lineStart = <Line>(this.tmpGeos_[LinemarkerEntityGeometry.LINESTART]);
        lineStart.setStartPoint(leftStartPoint);
        lineStart.setEndPoint(leftEndPoint);

        const lineEnd = <Line>(this.tmpGeos_[LinemarkerEntityGeometry.LINEEND]);
        lineEnd.setStartPoint(rightStartPoint);
        lineEnd.setEndPoint(rightEndPoint);

        const lineCenter = <Line>(this.tmpGeos_[LinemarkerEntityGeometry.LINECONNECT]);
        lineCenter.setStartPoint(centerstartp);
        lineCenter.setEndPoint(centerendpoint);
    }


    /**
     * 重写updatePath原因是，auxliaryRect在update的transform过程有差异
     */
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
            // if (this.refEntity_ !== null) {
            //     const matrix = this.refEntity_.getPathMatrix();
            //     geometry.transform(matrix);
            // }
            if(name === LinemarkerEntityGeometry.TEXTINFO){
                const matrix = this.refEntity_.getPathMatrix();
                geometry.transform(matrix);
            }
        }
    }

    setLayerStage(layerStage: LayerStage) {
        this.refEntity_.setLayerStage(LayerStage.LAYER_STAGE_ONE);
    }

    getLayerStage(): LayerStage{
        return this.refEntity_.getLayerStage();
    }   

}