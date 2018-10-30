import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {PropertyComponet, PropertyPanel,PropertyCompares,PropertyRange} from '../property.component';
import { BaseEntity, LandMark, HouseLayoutDragEntity} from '../../../entity/entity';
import {DesignService, WrapperService} from '../../../service/hsservice'
import {ForbiddenValidatorDirective} from '../wall-mark/wall-mark.directive'
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators} from '@angular/forms'


@Component({
  selector: 'hero-form-template',
  templateUrl: './purlin.component.html',
  styleUrls: ['./purlin.component.css']
})
export class PurlinComponent extends PropertyPanel implements OnInit {
  @Input() prevdata: any;
  public objinfo: any;
  propertyRange_: PropertyRange[];
  
  constructor(private designService: DesignService, 
    private wrapperService: WrapperService,
    private cdRef: ChangeDetectorRef) {
     super();
     
      this.objinfo = {} as any;

      // 初始化范围约束对象，这一部分作为参数将交给封装好的自定义验证器（已实现）
      this.propertyRange_ = [
       new PropertyRange({name: 'length_',
       id: PropertyCompares.Property_Between,
       range: [0, 1000],
       obj: this.objinfo,  
       alarm: '梁长度必须大于0，小于1000',
       }),  
     
       new PropertyRange({name: 'width_',
       id: PropertyCompares.Property_Between,
       range: [0, 1000],
       alarm: '梁长度必须大于0，小于1000',
       }), 

       new PropertyRange({name: 'thickness_',
       id: PropertyCompares.Property_Between,
       range: [0, 1000],
       alarm: '梁厚度必须大于0，小于1000',
       }), 

       new PropertyRange({name: 'rotationZ_',
       id: PropertyCompares.Property_Between,
       range: [0, 360],
       alarm: '梁旋转角度必须大于0，小于360',
       }), 
    ];
   }

   // 传递范围信息
   allows(index: number): string {
      return JSON.stringify(this.propertyRange_[index]);
   }

   // 在keyup时调用，用于手动激活变化检查
   hello() {
      this.cdRef.detectChanges();
   }

   // 使得input进来的data数据，能够在初始化时被注入到组建自身属性中
   ngOnInit() {
    super.ngOnInit(); 
    this.hoopup();   
  }

   // 初始化时，使得input进来的data数据，能够在初始化时被注入到组建自身属性中
   hoopup() {

     this.objinfo.length_ =  this.getProperty('length_');
     this.objinfo.width_ = this.getProperty('width_');
     this.objinfo.thickness_ = this.getProperty('thickness_');
     this.objinfo.rotationZ_ = this.getProperty('rotationZ_');
   }

   // 根据表单状态， 来决定是否激活更新流程。 这样可以省掉submit按钮，使得改动尽可能（即只要输入合法）即时生效
   voting(inputinfo: boolean) {
       if (inputinfo) {
          this.voteting(this.wrapperService,this.designService);
       }
   }

   // 重载基类函数， 用于向data（即实体的数据载体）中注入更新后的控件数据
   injectval() {
     this.data.length_ = parseFloat(this.objinfo.length_);
     this.data.width_ = parseFloat(this.objinfo.width_);
     this.data.thickness_ = parseFloat(this.objinfo.thickness_);
     this.data.rotationZ_ = parseFloat(this.objinfo.rotationZ_);
     return;
   }

   protected doModify(): boolean {
     if (this.data.length_ !== this.prevdata.length_) {
       return true;
     }

     if (this.data.width_ !== this.prevdata.width_) {
       return true;
     }

     if (this.data.thickness_ !== this.prevdata.thickness_) {
       return true;
     }

     if (this.data.rotationZ_ !== this.prevdata.rotationZ_) {
       return true;
     }

     return false;
   }
}
