import { DoorwayFlag } from './../../../entity/houselayout-flag';
import { Opening } from './../../../entity/opening';
import { Component, ChangeDetectorRef, OnInit} from '@angular/core';
import { DrawHouseLayoutService, TestMessageService ,Message,MessageManagerService, 
  WrapperService
} from '../../../service/hsservice';
import { BaseEntity } from '../../../entity/entity';

import {view} from 'paper'

@Component({
  selector: 'app-operate-button-group',
  templateUrl: './operate-button-group.component.html',
  styleUrls: ['./operate-button-group.component.css']
})
export class OperateButtonGroupComponent implements OnInit {
  private entityinfo: any;

  constructor(
      private drawHouseLayoutService: DrawHouseLayoutService,
      private wrapperService: WrapperService,
      private testService: TestMessageService,
      private msgManager: MessageManagerService,
      private cdRef: ChangeDetectorRef) { 

      this.entityinfo = null;
     //显示操作按钮
     this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'actionButton', this.showActionButton());
  }

  ngOnInit() {}

  makeDeleteAction() {
    const wrapper = this.wrapperService.getDragItemWrapper();
    if (this.entityinfo !== null) {
      wrapper.sendDeletionAction(this.entityinfo);
      const operateBtn = document.getElementById('operateBtnGroup');
      operateBtn.style.display = 'none';
      this.entityinfo = null; 
    }
    //删除后属性栏消失
    const objinfo = new Array<any>();
    objinfo.push('none');
    objinfo.push('none');
    const message = new Message('sceneObjectSelected', objinfo);
    this.drawHouseLayoutService.postMessage(message);

  }

  makeflipAction() {
      const objinfo = [this.entityinfo];
      const message = new Message(DrawHouseLayoutService.FLIP_CURRENT_ENTITY,objinfo);

      this.drawHouseLayoutService.postMessage(message);
  }

  //删除按钮
  showActionButton(): (objinfo: any) => void {
    return(objinfo: any) => {
      if (objinfo === null) {
        return;
      }
      //
    
      const operateBtn = document.getElementById('operateBtnGroup');
      if(!operateBtn) {
          return;
      }
      if(objinfo[0] === true){
        operateBtn.style.display ='block';
      }else{
        operateBtn.style.display = 'none';
        this.entityinfo = null;
      }
      if (!(objinfo[1] instanceof BaseEntity)) {
        return;
      }
  
      const point  = objinfo[1].position();
      this.entityinfo = objinfo[1];

      // 1. 是否显示
      const center = view.projectToView(point.toPaperPoint());
      //const rightPoint= view.projectToView(boundbox[1].toPaperPoint());
      const operateBtnPositionX = center.x + 34;
      const operateBtnPositionY = center.y - 42;
      operateBtn.style.left = operateBtnPositionX + 'px';
      operateBtn.style.top = operateBtnPositionY + 'px';
      
    
    }
  }

  /**
   * 判断是否显示翻转按钮
   */
  checkFlapable() {
    return (this.entityinfo instanceof Opening &&  ! (this.entityinfo instanceof DoorwayFlag) );
  }

}
