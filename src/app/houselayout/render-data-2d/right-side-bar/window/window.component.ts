import { Component, OnInit,Input, ChangeDetectorRef } from '@angular/core';
import {PropertyComponet, PropertyPanel,PropertyCompares, PropertyRange} from '../property.component';
import { MessageManagerService, Message, DrawHouseLayoutService} from '../../../service/hsservice';
import {DesignService, WrapperService} from '../../../service/hsservice'
import {FormGroup, FormControl} from '@angular/forms';
// import {OpengingType} from '../../../entity/entity'
 


@Component({
  selector: 'window-form-template',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})


/**
 * 窗户控件
 * @desc 能实现内部数据类型的转换
 */
export class WindowComponent extends PropertyPanel implements OnInit {
   //private distancefromground_:number;

   /**真正和前端绑定的数据 */
   public objinfo: any;
   public states: Array<any>;

   propertyRange_: PropertyRange[];

   constructor(private designService: DesignService, 
    private wrapperService: WrapperService,
    private cdRef: ChangeDetectorRef) {
      super();
      this.objinfo = {} as any;
      this.propertyRange_ = [
        new PropertyRange({name: 'distancefromground_',
        id: PropertyCompares.Property_Between,
        range: [0, 1000],
        obj: this.objinfo,
        alarm: '离地高度必须大于0，小于1000',
        }), 
        
        new PropertyRange({name: 'length_',
        id: PropertyCompares.Property_Between,
        range: [0, 1000],
        obj: this.objinfo,        
        alarm: '宽度必须大于0，小于1000',
        }), 

        new PropertyRange({name: 'hegiht_',
        id: PropertyCompares.Property_Between,
        range: [0, 2800],
        obj: this.objinfo,        
        alarm: '高度必须大于0，小于2800',
        }), 

        new PropertyRange({name: 'width_',
        id: PropertyCompares.Property_Between,
        range: [0, 500],
        obj: this.objinfo,
        alarm: '厚度必须大于0，小于500',
        }),   
     ];
     
     this.states = 
     [ 
       {id: 4, abbrev: "固定窗"},
       {id: 5, abbrev: "落地窗"},
       {id: 6, abbrev: "飘窗"}
     ];
    }
 
    vote(name: string, range: PropertyRange) {
      this.votes(name, this.designService, this.wrapperService,range, this.cdRef);     
    }

    // 传递范围信息
    allows(index: number): string {
        return JSON.stringify(this.propertyRange_[index]);
    }

    // 在keyup时调用，用户手动激活变化检查
    hello() {
      this.cdRef.detectChanges();
    }

    /**
     * 将控件内双向绑定的数据，赋值给控件对应的业务数据
     */
    injectval() {
       this.data.distancefromground_ = parseFloat(this.objinfo.distancefromground_);
       this.data.length_ = parseFloat(this.objinfo.length_);
       this.data.height_ = parseFloat(this.objinfo.height_);
       this.data.width_ = parseFloat(this.objinfo.width_);
       this.data.openingType_ = parseFloat(this.objinfo.openingType_); 
     
      return;
    }

    onChange(value){
      this.cdRef.detectChanges();
      // alert(JSON.stringify(value));
      this.objinfo.openingType_ = value;

      this.vote('openingType_',this.propertyRange_[3]);
    }

    // 使得input进来的data数据，能够在初始化时被注入到控件内双向绑定的数据中
    ngOnInit() {
      super.ngOnInit();    
    }

    hoopup() {
      this.objinfo.distancefromground_ = this.getProperty('distancefromground_');
      this.objinfo.length_ = this.getProperty('length_');
      this.objinfo.height_ = this.getProperty('height_');
      this.objinfo.width_ = this.getProperty('width_');
      this.objinfo.openingType_ = this.getProperty('openingType_');
    }

    voting(inputinfo: boolean){
      if(inputinfo) {
        this.voteting(this.wrapperService,this.designService);
      }
    }

    protected doModify(): boolean {
      if (this.data.distancefromground_ !== this.prevdata.distancefromground_) {
        return true;
      } 

      if (this.data.length_ !== this.prevdata.length_) {
        return true;
      }

      if (this.data.height_ !== this.prevdata.height_) {
        return true;
      }

      if (this.data.width_ !== this.prevdata.width_) {
        return true;
      }

      if (this.data.openingType_ !== this.prevdata.openingType_) {
        return true;
      }
      return false;
    }


}