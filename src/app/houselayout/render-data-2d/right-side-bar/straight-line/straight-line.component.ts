import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {PropertyComponet, PropertyPanel, PropertyCompares, PropertyRange} from '../property.component'
import { BaseEntity, LandMark, HouseLayoutDragEntity, InnerWall,InnerWallType} from '../../../entity/entity'
import {
   DrawHouseLayoutService, Message, WrapperService} from '../../../service/hsservice'
import {DesignService} from '../../../../service/design.service'
import {Point, Line} from '../../../geometry/geometry'
import * as MathUtil from '../../../../math/math'
import {WallModifyAction,WallAddAction} from '../../../action/action'


@Component({
  selector: 'app-straight-line',
  templateUrl: './straight-line.component.html',
  styleUrls: ['./straight-line.component.css']
})

// 直线
export class StraightLineComponent extends PropertyPanel implements OnInit{
    @Input() prevdata: any;
    public offsetHeight_: number;
    public length_: number;
    public propertyRange_: PropertyRange[];
    public wallType_: InnerWallType;
    public isTmp_: boolean;
    public thickness_: number;
    public height_: number;
    public unhandled_ = InnerWallType.INNERWALL_UNHANDLED;

     protected wallTypes = [
        {id: InnerWallType.INNERWALL_DEFAULT, abbrev: "普通墙"},
        {id: InnerWallType.INNERWALL_LOADBEARING, abbrev: "承重墙"},
        {id: InnerWallType.INNERWALL_SHORT, abbrev: "矮墙"},
        // {id: InnerWallType.INNERWALL_D, abbrev: "墙类型D"},
        // {id: InnerWallType.INNERWALL_E, abbrev: "墙类型E"},
        
      ];
     /**
      * 
      * @param designService 

      */

    constructor(private designService: DesignService, 
      private wrapperService: WrapperService,
      private drawHouseLayoutService: DrawHouseLayoutService) {
       super();

       /**
        *            
     public id: PropertyCompares ;
     public range: Array<any>;
     public valid: boolean;
     public alarm: string;
     public name: string;
        */
       this.propertyRange_ = [
          new PropertyRange({name: 'length_',
          id: PropertyCompares.Property_Between,
          range: [0, 5000],
          alarm: '线段长度必须大于0，小于1500',
          }),
          new PropertyRange({name: 'offsetHeight_',
          id: PropertyCompares.Property_Between,
          range: [0, 'length_'],
          alarm: '偏移距离必须大于0并小于线段长度',
          })         
       ];

     }
  
     vote() {
       this.voteting(this.wrapperService,this.designService);
     }

     getLength() {
        this.length_ = this.getValue(this.prevdata.segment().length());        
        return this.length_;
     }

     getHeight() {
       this.height_ = this.getValue(this.prevdata.height_);
       return this.height_;
     }
 
     getOffsetHeight() {
      this.offsetHeight_ = Math.abs(this.prevdata.segment().endPoint().y() - this.prevdata.segment().startPoint().y());
      return this.getValue(this.offsetHeight_);
     }

     ngOnInit() {
      this.prevdata = (<InnerWall>this.data).shallowclone();
      this.hoopup();
     } 

    neednew() {
      const line = <Line>(this.data.segment());
     const v1 = line.toVector();
      const orialigny = Math.abs(v1.y);
      const orilength = line.length();

      if(this.offsetHeight_ === null) {
        this.offsetHeight_ = orialigny;
        return;
      }

      if(this.length_ === null) {
        this.length_ = orilength;
        return;
      }
      
      if (this.offsetHeight_ < 0) {
          return;
      }      
      if (orialigny === this.offsetHeight_  && orilength === this.length_) {
          return;
      }
       
      const p1 = line.startPoint();
      const p2 = line.endPoint();       
      
      // 不考虑同时修改的情况,因为两个属性相互关联
      if (orialigny !== this.offsetHeight_) {
          const angleori = Math.asin(orialigny / orilength);
          const anglenew = Math.asin(this.offsetHeight_ / orilength);

          const rotationangle = (v1.x * v1.y > 0) ? (anglenew - angleori) : (angleori - anglenew);
          
           MathUtil.rotateLine(line, rotationangle);

      } else if (orilength !== this.length_) {
          const ration = this.length_ / orilength;
          const newEndPoint = new Point(p1.x() + v1.x * ration, p1.y() + v1.y * ration);
          line.setEndPoint(newEndPoint);
      }     
          
    }

     

     voteting(wrapperService: WrapperService,deservice: DesignService) {
      if (this.prevdata !== null && this.prevdata !== undefined) {
        this.neednew();
        if (!this.doModify()) {
          return;
        }

        this.data.height_ = this.height_;
        this.data.wallType_ = this.wallType_;
       
        // Wall modifyAction 的action是执行AddWall,PopWall
        const wallModifyAction = new WallModifyAction(<InnerWall>this.prevdata, <InnerWall>(this.data.shallowclone()))
        const wallModifyMsg = new Message(DrawHouseLayoutService.ADD_ACTION, wallModifyAction);
        this.drawHouseLayoutService.postMessage(wallModifyMsg);

        this.prevdata = this.data.shallowclone();   

        // 使用AddWallAction来执行修改
        // 基于逻辑, 相同(ID)的墙壁添加到户型中时,addWall执行的实际动作将是updateWall
        // const wallAddAction = new WallAddAction(<InnerWall>this.data.shallowclone());
        // const wallAddMsg = new Message(DrawHouseLayoutService.ADD_ACTION, wallAddAction);
        // this.drawHouseLayoutService.postMessage(wallAddMsg);
        // this.prevdata = this.data.shallowclone();       
        // this.wrapperService.getDrawHouseLayoutWrapper().initActivatedPoints();
      }
    }

    protected doModify(): boolean {
      const line  = <Line> (<InnerWall>this.data).segment();
      const preLine = <Line> (<InnerWall>this.prevdata).segment();

      if (line.startPoint().distanceTo(preLine.startPoint()) > 0.1) {
        return true;
      }

      if (line.endPoint().distanceTo(preLine.endPoint()) > 0.1) {
        return true;
      }

      if(this.wallType_ !== this.prevdata.wallType_) {
        return true;
      }

      if(this.height_ !== this.prevdata.height_) {
        return true;
      }

      return false;
    }

    hoopup() {
       this.wallType_ = this.getProperty('wallType_');
       this.isTmp_ = this.getProperty('isTmp_');
       this.thickness_ = this.getProperty('wallthickness_');
    }   

    onChange(value){
      this.wallType_ = value;
      this.vote();
      //this.vote('openingType_',this.propertyRange_[3]);
    }
    
 }
