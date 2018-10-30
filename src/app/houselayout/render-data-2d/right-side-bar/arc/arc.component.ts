import { Component, OnInit,Input, ChangeDetectorRef } from '@angular/core';
import {PropertyComponet, PropertyPanel} from '../property.component';
import {
  // DesignService, 
  DrawHouseLayoutService, Message, WrapperService} from '../../../service/hsservice'

import {DesignService} from '../../../../service/design.service'
import {Point, Arc, Line} from '../../../geometry/geometry'
import * as MathUtil from '../../../../math/math'
import {InnerWall} from '../../../entity/entity'
import {WallModifyAction} from '../../../action/action'
import {Vector2} from 'three'

@Component({
  selector: 'app-arc',
  templateUrl: './arc.component.html',
  styleUrls: ['./arc.component.css']
})
export class ArcComponent extends PropertyPanel implements OnInit{
  @Input() prevdata: any;
  public distance_ : number;
  public offSetHeight_ : number;
  public arcDepth_ : number;
  public clockwise_: boolean;
  public unclockwise_: boolean;

    constructor(private designService: DesignService, 
      private drawHouseLayoutService:DrawHouseLayoutService,
      private wrapperService: WrapperService,
       private cdRef: ChangeDetectorRef) {
      super();
      this.clockwise_ = true;
      this.unclockwise_ = false;
    }
 
    /**
     * @function 提交参数值的修改
     */
    voteInputVal() {
      this.need();  
      if (this.doModify()) {
        this.activateAction();
      }
      
    }

    /**
     * 触发更新（modify）操作
     */
    activateAction() {
        

      const wallModifyAction = new WallModifyAction(<InnerWall>this.prevdata, <InnerWall>this.data.shallowclone());
      const wallModiftMsg = new Message(DrawHouseLayoutService.ADD_ACTION, wallModifyAction);
      this.drawHouseLayoutService.postMessage(wallModiftMsg);

      this.prevdata = (<InnerWall>this.data).shallowclone();  

      const wrapper = this.wrapperService.getDrawHouseLayoutWrapper();      
      this.wrapperService.getDrawHouseLayoutWrapper().initActivatedPoints();     
    }


 
    getDistance(){
      const arc = <Arc>(this.prevdata.segment());
      const x =  arc.endPoint().x() - arc.startPoint().x();
      const y = arc.endPoint().y() - arc.startPoint().y();
      const wallDistance = Math.sqrt(x*x + y * y); 
      this.distance_ = wallDistance;
      return this.getValue(this.distance_);
     
    }

    getOffsetHeight(){
      const arc = <Arc>(this.prevdata.segment());
      this.offSetHeight_ = Math.abs(arc.endPoint().y()-arc.startPoint().y());
      return this.getValue(this.offSetHeight_);
    }

    getArcDepth(){
      const arc = <Arc>(this.prevdata.segment());
      const arcThroughPoint = arc.arcThroughPoint();
      const x =  (arc.endPoint().x()+arc.startPoint().x())/2 - arcThroughPoint.x();
      const y = (arc.endPoint().y()+arc.startPoint().y())/2 - arcThroughPoint.y(); 
      this.arcDepth_ =  Math.sqrt(x*x + y * y);
      return this.getValue(this.arcDepth_);
    
    }

    clockwiseDrawArc() { 
      const datum = <Arc>(this.data.segment());

      datum.setIsClockwise(true);
      this.activateAction();

    }

    ngOnInit() {
      this.hoopup();
      this.prevdata = (<InnerWall>this.data).shallowclone();      
      this.clockwise_ = true;
      this.unclockwise_ = false;
    }

    counterClockwiseDrawArc() {
      const datum = <Arc>(this.data.segment());
      datum.setIsClockwise(false);
      this.activateAction();
  
    }

    need() {
      const datum = <Arc>(this.data.segment());
      const v1 = datum.toVector();
      const orialigny = Math.abs(v1.y);
      const orilength = datum.startPoint().distanceTo(datum.endPoint());
      const directline = new Line(datum.startPoint() , datum.endPoint());
      const linePointer = new Line( directline.middlePoint(), datum.arcThroughPoint());

      const checkAligny = Math.abs(this.offSetHeight_ - orialigny);
      const checkArc = Math.abs(this.arcDepth_ -  linePointer.length());

      if (this.offSetHeight_ === null) {
        this.offSetHeight_ = orialigny;
        return;
      }

      if(this.arcDepth_ === null) {
        this.arcDepth_ = linePointer.length();
        return;
      }
      
      if (checkAligny < 1  && checkArc < 1) {
          return;
      }

      if (this.arcDepth_ < 1) {
        return;
      }
       
      const p1 = datum.startPoint();
      const p2 = datum.endPoint();       

      // 不考虑同时修改的情况,因为两个属性相互关联
      if (checkAligny > 1) {
          const angleori = Math.asin(orialigny / orilength);
          const anglenew = Math.asin(this.offSetHeight_ / orilength);
          const rotationangle = (v1.x * v1.y > 0) ? (anglenew - angleori) : (angleori - anglenew); 
          MathUtil.rotateLine(datum, rotationangle);


          const halfLength = orilength / 2;
          const curdepth = this.arcDepth_;
          const newRadius = 0.5 * (curdepth + halfLength * halfLength / curdepth);
          const vec = datum.toVector();
          let normalVec = new Vector2(-vec.y, vec.x);
          normalVec = normalVec.normalize();
          const directline2 = new Line(datum.startPoint() , datum.endPoint());
          const midpoint = directline2.middlePoint();
          midpoint.addation(normalVec.multiplyScalar(newRadius - curdepth));         
          datum.setCenter(midpoint);          

      } else if (checkArc > 1) {
          const halfLength = orilength / 2;
          const curdepth = this.arcDepth_;
          const newRadius = 0.5 * (curdepth + halfLength * halfLength / curdepth);
          const vec = datum.toVector();
          let normalVec = new Vector2(-vec.y, vec.x);
          normalVec = normalVec.normalize();
          const directline2 = new Line(datum.startPoint() , datum.endPoint());
          const midpoint = directline2.middlePoint();
          midpoint.addation(normalVec.multiplyScalar(newRadius - curdepth));         

          datum.setCenter(midpoint);
      }

      

    }   

    protected doModify():boolean{
     const arc = <Arc> (this.data.segment());
     const preArc = <Arc> (this.prevdata.segment());
     if (arc.startPoint().distanceTo(preArc.startPoint())  > 0.1) {
       return true;
     }  

     if (arc.endPoint().distanceTo(preArc.endPoint()) > 0.1) {
       return true;
     }

     if (arc.center().distanceTo(preArc.center()) > 0.1) {
       return true;
     }

     return false;
    } 


    

 
 
}

