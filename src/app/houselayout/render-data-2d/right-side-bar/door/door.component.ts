import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {PropertyComponet, PropertyPanel, PropertyCompares, PropertyRange} from '../property.component';
import {DesignService, WrapperService} from '../../../service/hsservice'

@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css']
})

export class DoorComponent extends PropertyPanel implements OnInit{
  @Input() prevdata: any;
    //  private distancefromground_: number;
    //  private length_: number;//宽度
    //  private height_: number;
    //  private width_: number;//厚度
    //  private openingType_: number;

     objinfo: any; // 真正和前端双向绑定的数据
     public propertyRange_: PropertyRange[];
     public states: Array<any>;     

     ngOnInit() {
      super.ngOnInit();
      //this.hoopup();     
    }
    // 传递范围信息
    allows(index: number): string {
      return JSON.stringify(this.propertyRange_[index]);
    }

    // 在keyup时调用，用户手动激活变化检查
     hello() {
       this.cdRef.detectChanges();
    }

    voting(inputinfo: boolean){
      if(inputinfo) {
        this.voteting(this.wrapperService,this.designService);
      }
    }


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
        alarm: '门的离地高度必须大于0，小于1000',
        }), 
        
        new PropertyRange({name: 'length_',
        id: PropertyCompares.Property_Between,
        range: [0, 1000],
        obj: this.objinfo,
        alarm: '门的宽度必须大于0，小于1000',
        }), 

        new PropertyRange({name: 'hegiht_',
        id: PropertyCompares.Property_Between,
        range: [0, 2800],
        obj: this.objinfo,
        alarm: '门的高度必须大于0，小于2800',
        }), 

        new PropertyRange({name: 'width_',
        id: PropertyCompares.Property_Between,
        range: [0, 2800],
        obj: this.objinfo,
        alarm: '门的厚度必须大于0，小于2800',
        }),
      
        
     ];
   
     this.states = 
     [ 
       {id: 1, abbrev: "单开门"},
       {id: 2, abbrev: "双开门"},
       {id: 3, abbrev: "斜拉门"}
     ];     
    }
 
    onChange(value){
      this.cdRef.detectChanges();
      // alert(JSON.stringify(value));
      this.objinfo.openingType_ = value;

      this.vote('openingType_',this.propertyRange_[3]);
    }


    vote(name: string, range: PropertyRange) {
      this.votes(name, this.designService, this.wrapperService,range, this.cdRef);     
    }

  
     injectval() {
      this.data.distancefromground_ = parseFloat(this.objinfo.distancefromground_);
      this.data.length_ = parseFloat(this.objinfo.length_);
      this.data.height_ = parseFloat(this.objinfo.height_);
      this.data.width_ = parseFloat(this.objinfo.width_);
      this.data.openingType_ = parseFloat(this.objinfo.openingType_); 
  
      return;
    }

    hoopup() {
      this.objinfo.distancefromground_ = this.getProperty('distancefromground_');
      this.objinfo.length_ = this.getProperty('length_');
      this.objinfo.height_ = this.getProperty('height_');
      this.objinfo.width_ = this.getProperty('width_');
      this.objinfo.openingType_ = this.getProperty('openingType_');
    }

    protected doModify(): boolean {
      if (this.data.length_ !== this.prevdata.length_) {
        return true;
      }

      if (this.data.height_ !== this.prevdata.height_) {
        return true;
      }

      if (this.data.width_ !== this.prevdata.width_) {
        return true;
      }

      if (this.data.distancefromground_ !== this.prevdata.distancefromground_) {
        return true;
      }

      if (this.data.openingType_ !== this.prevdata.openingType_) {
        return true;
      }
      
      return false;
    }
 
}
