import { Opening } from './../../entity/opening';
// import { DrawHouseLayoutPage } from './../../../../../e2e/app.po';
import { DrawHouseLayoutService } from './../../service/draw-houselayout.service';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BaseEntity, LandMark, HouseLayoutDragEntity} from '../../entity/entity'
import { Message} from '../../service/hsservice'
import {
   MessageManagerService, WrapperService} from '../../service/hsservice'
import {DesignService} from '../../../service/design.service'
import {FormGroup, FormControl} from '@angular/forms';
import {OpeningModifyAction, FlagModifyAction} from '../../action/action'


export interface PropertyComponet {
    data: any;
    drawHouLayoutService :DrawHouseLayoutService;
}

export enum PropertyCompares{
    Property_Between,
    Property_LessThan,
    Property_Equal,
    Property_LargerThan
}

export class PropertyRange {
     public id: PropertyCompares ;
     public range: Array<any>;
     public valid: boolean;
     public alarm: string;
     public name: string;
     public obj: any;
        // 构造属性值规则
     constructor(objinfo: any ) {
        this.obj = null;
        if (objinfo.id === null || objinfo.id === undefined) {
           this.valid = false;
           return;
        } 

        if (objinfo.range === null || objinfo.range === undefined) {
           this.valid = false;
           return;
        }

        if (objinfo.id === PropertyCompares.Property_Between) {
            if (objinfo.range.length !== 2) {
              this.valid = false;
              return;
            } 

        } else  if (objinfo.id === PropertyCompares.Property_LessThan) {
          if (objinfo.range.length !== 1) {
            this.valid = false;
            return;
          } 
        } else if (objinfo.id === PropertyCompares.Property_LargerThan) {
          if (objinfo.range.length !== 1) {
            this.valid = false;
            return;
          } 
        } else if (objinfo.id === PropertyCompares.Property_Equal) {
          if (objinfo.range.length !== 1) {
            this.valid = false;
            return;
          }          
        } else {
           this.valid = false;
           return;
        }

        if (objinfo.obj !== null && objinfo.obj !== undefined) {
          this.obj = objinfo.obj;
       }        
        this.id = objinfo.id;
        this.range = objinfo.range;        
        this.valid = true;
        this.alarm = objinfo.alarm;
        this.name = objinfo.name;
     }

     // 根据设定的规则和传入的data信息，对当前值的范围合法性进行判断
     protected CheckBetween(inputObj: any, inputval: any): boolean {
          this.range.push(this.range[0]);
          
          if (!this.CheckLargeThan(inputObj,inputval)){
            return false;
          }

          let result = false;
          this.range[0] = this.range[1];
          if (this.CheckLessThan(inputObj, inputval)) {
            result = true;
          }

          this.range[0] = this.range[2];
          this.range.pop();

          return result;
     }

     protected CheckEqual(inputObj: any, inputval: any): boolean {
          const key = this.range[0];
          const val = parseFloat(inputval);
          if (key instanceof String) {
              const keyname = <string>(key);
            if (inputObj[keyname] !== null && inputObj[keyname] !== undefined) {
                const objval = parseFloat(inputObj[keyname]);

                return objval === val;
            }

          } else if (key instanceof Number) {
            return key === val;

          } else {
            return false;
          }
     } 

     protected CheckLargeThan(inputObj: any, inputval: any): boolean {
        const key = this.range[0];
        const val = parseFloat(inputval);
        if (typeof key  === 'string') {
            const keyname = <string>(key);
           if (inputObj[keyname] !== null && inputObj[keyname] !== undefined) {
              const objval = parseFloat(inputObj[keyname]);

              return objval <= val;
           }

        } else if (typeof key === 'number') {
          return key <= val;

        } else {
          return false;
        }
     }

     protected CheckLessThan(inputObj: any, inputval: any): boolean {
          return !this.CheckLargeThan(inputObj, inputval);
     }
      
     checkinfos(inputval: any) {
        if (this.obj !== null && inputval !== null && inputval !== undefined) {
           return this.checkinfo(this.obj, inputval);
        } else {
          return false;
        }
     }

  checkinfo(inputObj: any, inputval: any): boolean {
        let result = false;
        switch (this.id) {
            case PropertyCompares.Property_Between:
            result = this.CheckBetween(inputObj, inputval);
            break;
            case PropertyCompares.Property_Equal:
            result = this.CheckEqual(inputObj, inputval);
            break;
            case PropertyCompares.Property_LargerThan:
            result = this.CheckLargeThan(inputObj, inputval);
            break;            
            case PropertyCompares.Property_LessThan:
            result = this.CheckLessThan(inputObj, inputval);
            break;         
            default:
            break; 
        }

        return result;

    }
}


export class PropertyPanel implements PropertyComponet, OnInit {  

  @Input() data: any;
  // PropertyPanel 本身不是injectable， 采用@Input使得其drawHouLayoutService能被自动赋值
  @Input() drawHouLayoutService: DrawHouseLayoutService;
   prevdata: any;
   
  constructor() {    
  } 

  disableOthers() {
    const messageDisable = [true,true,false];
    const message = new Message(DrawHouseLayoutService.SWITCH_CHILDCOMPONENTS, messageDisable);
    this.drawHouLayoutService.postMessage(message);    
  }

  enableOthers(){
    const messageDisable = [false,false,false];
    const message = new Message(DrawHouseLayoutService.SWITCH_CHILDCOMPONENTS, messageDisable);
    this.drawHouLayoutService.postMessage(message);        
  }

  ngOnInit() {       


    this.prevdata = this.data.shallowclone(); 
    this.hoopup();  
  }


  votes(propertyName: string , deservice: DesignService, 
    wrapperService:WrapperService, range?: PropertyRange, cdRef?: ChangeDetectorRef) {
    // 1. 范围判定
    if (range) {
        if (!range.checkinfo(this, this[propertyName])) {
          this[propertyName] = this.data[propertyName];
          return ;
        } 
    }
    
    this.voteting(wrapperService, deservice);
  }

  hoopup() {
    
  }

  voteting(wrapperService: WrapperService, designService: DesignService) {
    this.injectval();
    if (! this.doModify()) {
      return;
    }
    if (this.data !== null && this.data !== undefined) {
      // 发送消息实现数据的更新
      const resultPreEntity = this.prevdata;// .CheckTypeTransform();\
     
      let resultEntity = null;
      if(this.data instanceof Opening) {
         // 门窗需要处理数据类型属性发生修改的情况
        resultEntity = this.data.shallowclone().CheckTypeTransform();
      } else{
        resultEntity = this.data.shallowclone();
      }
      
      const arrayOfEntity = [this.prevdata, resultEntity];    
      const msgInfo = new Message(DrawHouseLayoutService.ModifyEntityIn_HouseLayout, arrayOfEntity);
      this.drawHouLayoutService.postMessage(msgInfo); // done
      
      //发消息更新属性栏组件
      this.informPropertyInfo(resultEntity);

      // 发送消息以确保激活点更新
      const msgCarrier = null;
      const msgInitActivatedPoint = new Message(DrawHouseLayoutService.INIT_ACTIVATEDPOINTS, msgCarrier);
      this.drawHouLayoutService.postMessage(msgInitActivatedPoint);
      
      // new round begin
      this.prevdata = resultEntity;    

      // resume lock
       this.enableOthers();
    }
  }

  informPropertyInfo(resultEntity: any) {
    if(resultEntity === null) {
        const objinfo = new Array<any>();
        objinfo.push('none');
        objinfo.push('none');
        const message1 = new Message('sceneObjectSelected', objinfo);
        this.drawHouLayoutService.postMessage(message1);
        return;
    }

    const info = resultEntity.showEntityInfo();

    /// 设置配置项来对应实体类型和前端component对应关系 

    const objinfo = new Array<any>();
    objinfo.push(info);
    objinfo.push(resultEntity);

            
    const message1 = new Message('sceneObjectSelected', objinfo);
    this.drawHouLayoutService.postMessage(message1);
        
    
}

  // 发送消息，以保证在修改属性时，其他控件功能不会被触发
  disAbleOtherComponets() {

  }

  // 发送消息， 在属性修改完成后， 恢复其他控件功能
  resumeOtherComponents() {

  }

  correction(datum: any, name: string, propertyRange?: PropertyRange) {
    let inputinfo = <string>datum;
    // 1. 通过正则表达式判断输入信息的合法性
    inputinfo = inputinfo.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符  
    inputinfo = inputinfo.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的       
    inputinfo = inputinfo.replace(".","$#$").replace(/\./g,"").replace("$#$",".");      
    inputinfo = inputinfo.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');//只能输入两个小数       
    if(inputinfo.indexOf(".")< 0 && inputinfo !=""){//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的数字 
    if(inputinfo.substr(0,1) == '0' && inputinfo.length == 2){  
      inputinfo = inputinfo.substr(1,inputinfo.length);      
    }  
    }   
    
    this[name] = parseFloat(inputinfo);

    return inputinfo;
 }  

   getValue(info: any) {

      const num = <number>info;
      const mulnum = Math.round(num * 100);
      return mulnum / 100.0;

   }


   getProperty(propertyName: string) {
      this[propertyName] = this.getValue(this.prevdata[propertyName]);
      return this[propertyName];
   }  





  injectval() {
    return;
  }

  /**
   * 检查数据是否修改过， 修改过则返回true， 反之返回false
   */
  protected doModify(): boolean {
    return false;
  }


}