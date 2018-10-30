import { HouseLayoutDragEntity } from './../entity/base-drag-entity';
import { MarkerText } from './../../path/mark-text';
import { Arc } from './../../geometry/arc';
import { Room } from './../entity/room';
import {HouseLayout} from '../entity/house-layout'
import { AuxilaryRectPath } from './../../path/auxilaryrect-path';
import { AuxilaryRect } from './../entity/auxiliary-line';
import { AuxilityLineGeometry } from './../../entity-geometry/auxility-line-geometry';
import { HouseLayoutFlag } from './../entity/houselayout-flag';
import {PillarFlag, FlueFlag, GirderFlag} from '../entity/entity'

import {BaseEntityGeometry,HouseLayoutGeometryFactory} from './entity-geometry'

import {Rect, Line, Point, BaseGeometry, Segment} from '../geometry/geometry'

import {BasePath,RectPath, LinePath} from '../path/path'

import {Point as PaperPoint} from 'paper'
import * as MathUtil from '../../math/math'

export class HouselayoutFlagAuxEntityGeometry extends BaseEntityGeometry {

    static readonly BoundingBox = 'boudingBoxWithRotation';

    static readonly VerticalUp = 'auxilaryPath-VerticalUp';
    static readonly VerticalDown = 'auxilaryPath-VerticalDown';
    static readonly HorizonLeft = 'auxilaryPath-horizonalLeft';
    static readonly HorizonRight = 'auxilaryPath-horizonalRight';

    static readonly VerticalUpText = 'auxilaryPath-VerticalUp-text';
    static readonly VerticalDownText = 'auxilaryPath-VerticalDown-text';
    static readonly HorizonLeftText = 'auxilaryPath-horizonalLeft-text';
    static readonly HorizonRightText = 'auxilaryPath-horizonalRight-text';

    protected tmpGeos_: Map<string, BaseGeometry> = null;

    protected verticalUpAux_: AuxilaryRect;
    protected verticalDownAux_: AuxilaryRect;
    protected horizonLeftAux_: AuxilaryRect;
    protected horizonRightAux_: AuxilaryRect;
    protected withinHouse_: HouseLayout;
    

    /**
     * draggable的实体辅助几何信息，需要知道其所在绘图环境
     * 因此构建时需要（调用者也一定可以拿到）相应的HouseLayout数据
     * @param draggable 
     * @param houselayout 
     */
    constructor(draggable: HouseLayoutDragEntity,houselayout: HouseLayout) {
        super(draggable);
        this.withinHouse_ = houselayout;
        // 在构建时计算基础BoundingBox, box范围只在构建时计算 
        const tmpDragEntityGeometry = HouseLayoutGeometryFactory.CreateGeometry(draggable);
        const boundGeos =  tmpDragEntityGeometry.getOuterGeos();     
        this.tmpGeos_ = new Map<string,  BaseGeometry>();
        if(boundGeos) {
            let arrayofOuterPoint = new Array<PaperPoint>();
            for(let i = 0; i < boundGeos.length;i++) {
               const objPoints =   boundGeos[0].generateOuterPoints();
               if(objPoints) {
                arrayofOuterPoint = arrayofOuterPoint.concat(objPoints);
               }
            }

            let leftopX = 999999;
            let leftopY = 999999;
            let bottomRightX = -999999;
            let bottomRightY = -999999;
            for(let i = 0; i < arrayofOuterPoint.length;i++) {
                leftopX = (arrayofOuterPoint[i].x < leftopX ) ? arrayofOuterPoint[i].x : leftopX;
                leftopY = (arrayofOuterPoint[i].y < leftopY) ? arrayofOuterPoint[i].y : leftopY;
                bottomRightX = (arrayofOuterPoint[i].x > bottomRightX) ?  arrayofOuterPoint[i].x : bottomRightX;
                bottomRightY = (arrayofOuterPoint[i].y > bottomRightY) ? arrayofOuterPoint[i].y : bottomRightY;
            }

            const centerPoint = new Point(leftopX /2 + bottomRightX /2, leftopY/2 + bottomRightY/2);
            const boundRect = new Rect(centerPoint, bottomRightX - leftopX, bottomRightY - leftopY);
            this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.BoundingBox] =  boundRect;
        } else  {
            console.error('[houseflag-auxilary-geomerty]constructor');
            console.error('unable to generate geos');
        }

        const verticalUp = new Line(new Point(0,0), new Point(0,0));
        const verticalDown = new Line(new Point(0,0), new Point(0,0));
        const horizonLeft = new Line(new Point(0,0), new Point(0,0));
        const horizonRight = new Line(new Point(0,0), new Point(0,0));
        this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText] =  verticalUp;
        this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText] =  verticalDown;
        this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText] =  horizonLeft;
        this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText] =  horizonRight;
        const verticalUpText = new MarkerText(verticalUp);
        const verticalDownText = new MarkerText(verticalDown);
        const horizonLeftText = new MarkerText(horizonLeft);
        const horizonRightText = new MarkerText(horizonRight);
        this.geos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText] =  verticalUpText;
        this.geos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText] =  verticalDownText;
        this.geos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText] =  horizonLeftText;
        this.geos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText] =  horizonRightText;

   

        this.verticalUpAux_ = new AuxilaryRect(new Point(0,0), new Point(0,0));
        this.verticalDownAux_ = new AuxilaryRect(new Point(0,0), new Point(0,0));
        this.horizonLeftAux_ = new AuxilaryRect(new Point(0,0), new Point(0,0));
        this.horizonRightAux_ = new AuxilaryRect(new Point(0,0), new Point(0,0));


        const rectpath = new RectPath(<Rect>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.BoundingBox]);
        rectpath.strokeColor = '#1DA1F2 ';

        const verticalUpPath = new AuxilaryRectPath(this.verticalUpAux_);
        const verticalDownPath = new AuxilaryRectPath(this.verticalDownAux_);
        const horizonLeftPath = new AuxilaryRectPath(this.horizonLeftAux_);
        const horizonRightPath = new AuxilaryRectPath(this.horizonRightAux_);
        verticalUpPath.strokeColor =   'white ';
        verticalDownPath.strokeColor =   'white ';
        horizonLeftPath.strokeColor =   'white ';
        horizonRightPath.strokeColor =   'white';
        

        this.geos_[HouselayoutFlagAuxEntityGeometry.VerticalUp] =   verticalUpPath;
        this.geos_[HouselayoutFlagAuxEntityGeometry.VerticalDown] =  verticalDownPath;
        this.geos_[HouselayoutFlagAuxEntityGeometry.HorizonLeft] =  horizonLeftPath;
        this.geos_[HouselayoutFlagAuxEntityGeometry.HorizonRight] =  horizonRightPath;


    }

    protected dragEntity() : HouseLayoutDragEntity {
        return <HouseLayoutDragEntity>this.refEntity();
    }

    protected boundRect() {
        return <Rect>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.BoundingBox];
    }

    protected getHouseLayout(): HouseLayout {
        return this.withinHouse_;
    }



    protected findPointOnRoomByY(curPoint: Point,  segments: Array<Segment>,choseLeftOne): Point{
        let point = null;
        const yvalue = curPoint.y();
        let minDistance = 9999999;
        for(let i = 0; i < segments.length; i++) {
            const resultPoint = MathUtil.findXOnSegByY(yvalue,segments[i]);
            if(!resultPoint) {
                continue;
            }

            for(let j = 0 ; j < resultPoint.length;j++) {
                const curDis = Math.abs(resultPoint[j].x() - curPoint.x());
                if(choseLeftOne && (resultPoint[j].x() - curPoint.x()) > 0) {
                    continue;
                }

                if(!choseLeftOne && (resultPoint[j].x() - curPoint.x()) < 0) {
                    continue;
                }

                if(curDis < minDistance) {
                    point = resultPoint[j];
                    minDistance = curDis;
                }
            }
        }

        return  point;  

    }

    protected findPointOnRoomByX(curPoint:Point, segments: Array<Segment>,choseUpOne:boolean): Point{
        let point = null;
        const xvalue =  curPoint.x();
        let rangeDistance:number = null;

        rangeDistance = 9999999;
  

        for(let i = 0; i < segments.length; i++) {
            const resultpoint = MathUtil.findYOnSegByX(xvalue, segments[i]);
            if(!resultpoint) {
                continue;
            }

            for(let j = 0; j < resultpoint.length;j++) {
                const curDis = Math.abs(resultpoint[j].y() - curPoint.y());
                if(choseUpOne && (resultpoint[j].y() - curPoint.y() < 0)) {
                    if(curDis < rangeDistance) {
                        point = resultpoint[j];
                        rangeDistance = curDis;
                    }
                } 

                if(!choseUpOne && (resultpoint[j].y() - curPoint.y() > 0)) {
                    if(curDis < rangeDistance) {
                        point = resultpoint[j];
                        rangeDistance = curDis;
                    }                  
                }

            }
        }

        return point;
    }

       protected hidePoints() {
        const hideTo = new Point(0,0);
        this.verticalUpAux_.setStartPoint(hideTo,false);
        this.verticalUpAux_.setEndPoint(hideTo,false);
        this.verticalUpAux_.updateEndPoints();

        this.verticalDownAux_.setStartPoint(hideTo,false);
        this.verticalDownAux_.setEndPoint(hideTo,false);
        this.verticalDownAux_.updateEndPoints();
        

        this.horizonLeftAux_.setStartPoint(hideTo,false);
        this.horizonLeftAux_.setEndPoint(hideTo,false);
        this.horizonLeftAux_.updateEndPoints();
        

        this.horizonRightAux_.setStartPoint(hideTo,false);
        this.horizonRightAux_.setEndPoint(hideTo,false);
        this.horizonRightAux_.updateEndPoints();
        


        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText]).setStartPoint(hideTo);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText]).setEndPoint(hideTo);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText]).setStartPoint(hideTo);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText]).setEndPoint(hideTo);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText]).setStartPoint(hideTo);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText]).setEndPoint(hideTo);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText]).setStartPoint(hideTo);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText]).setEndPoint(hideTo);          
       }

    protected updateGeometry() {
        const dragEntity = this.dragEntity();
        const transMatrix = dragEntity.getPathMatrix();

        const rotation = transMatrix.rotation ;
        
        const boundRect = this.boundRect();
        const width = boundRect.width();
        const length = boundRect.length();  
        /// 计算包围盒4个顶点当前的实际位置
        let pleftTop = new PaperPoint(boundRect.center().x() - width/2 , boundRect.center().y() - length /2);
        let pRightTop = new PaperPoint(boundRect.center().x() + width /2 , boundRect.center().y() - length /2);
        let pleftDown = new PaperPoint(boundRect.center().x() - width/2, boundRect.center().y() + length /2);
        let pRightDown = new PaperPoint(boundRect.center().x() + width /2 , boundRect.center().y() + length /2);
        pleftTop =  pleftTop.transform(transMatrix);
        pRightTop = pRightTop.transform(transMatrix);
        pleftDown = pleftDown.transform(transMatrix);
        pRightDown = pRightDown.transform(transMatrix); 

         
        const houselayout = this.getHouseLayout();
        const cornerPoints = [new Point(pleftDown.x,pleftDown.y),new Point(pleftTop.x, pleftTop.y) , new Point(pRightTop.x,pRightTop.y), 
                          new Point(pRightDown.x,pRightDown.y)];

        let room:Room = null;
        for(let i = 0; i < cornerPoints.length;i++) {
            room = houselayout.getRoomByPoint(cornerPoints[i]);
            if(!room) {
                this.hidePoints();

                return;
            }
        }              
        
        const walls = room.walls();
        const segArray = new Array<Segment>();
        for(let i = 0; i < walls.length;i++) {
            segArray.push(walls[i].segment());
        }

        // 得到变换后的实际左，上，右，下四个角点，并向墙壁进行连线
        let leftPoint = new Point(pleftTop.x, pleftTop.y) ;
        let upPoint = new Point(pleftTop.x, pleftTop.y) ;
        let rightPoint = new Point(pleftTop.x, pleftTop.y) ;
        let bottomPoint = new Point(pleftTop.x, pleftTop.y) ; 

        let indexArray:Array<number> = null;
        const directArea =  Math.floor(rotation / 90.0);
        switch (directArea) {
            case 0:
                indexArray = [0,1,2,3]; 
                break;
            case 1:
                indexArray = [3,0,1,2];
                break;
            case -2:
                indexArray = [2,3,0,1];
                break;
            case -1:
                indexArray = [1,2,3,0];
                break;
            case -2:
                indexArray = [0,1,2,3];
            default:
                break;
        }
        leftPoint = cornerPoints[indexArray[0]];
        upPoint = cornerPoints[indexArray[1]];
        rightPoint = cornerPoints[indexArray[2]];
        bottomPoint = cornerPoints[indexArray[3]];

        // 4 auxilary Path
        const upInsect = this.findPointOnRoomByX(upPoint,segArray,true);
        const downInsect =  this.findPointOnRoomByX(bottomPoint,segArray,false);
        const leftInsect =  this.findPointOnRoomByY(leftPoint,segArray,true);
        const rightInsect = this.findPointOnRoomByY(rightPoint,segArray,false);
        if(!upInsect || !downInsect || !leftInsect || !rightInsect) {
            this.hidePoints();
            return;
        } 
        

        this.verticalUpAux_.setStartPoint(upPoint,false);
        this.verticalUpAux_.setEndPoint(upInsect,false);
        this.verticalUpAux_.updateEndPoints();

        this.verticalDownAux_.setStartPoint(bottomPoint,false);
        this.verticalDownAux_.setEndPoint(downInsect,false);
        this.verticalDownAux_.updateEndPoints();
        

        this.horizonLeftAux_.setStartPoint(leftPoint,false);
        this.horizonLeftAux_.setEndPoint(leftInsect,false);
        this.horizonLeftAux_.updateEndPoints();
        

        this.horizonRightAux_.setStartPoint(rightPoint,false);
        this.horizonRightAux_.setEndPoint(rightInsect,false);
        this.horizonRightAux_.updateEndPoints();
        


        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText]).setStartPoint(upPoint);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalUpText]).setEndPoint(upInsect);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText]).setStartPoint(bottomPoint);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.VerticalDownText]).setEndPoint(downInsect);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText]).setStartPoint(leftPoint);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonLeftText]).setEndPoint(leftInsect);

        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText]).setStartPoint(rightPoint);
        (<Line>this.tmpGeos_[HouselayoutFlagAuxEntityGeometry.HorizonRightText]).setEndPoint(rightInsect);
    }

}