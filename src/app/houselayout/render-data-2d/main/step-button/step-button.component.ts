import { Component, ChangeDetectorRef, OnInit} from '@angular/core';
import { DrawHouseLayoutService, TestMessageService ,Message,MessageManagerService} from '../../../service/hsservice';
import { BaseEntity } from '../../../entity/entity';

@Component({
  selector: 'app-step-button',
  templateUrl: './step-button.component.html',
  styleUrls: ['./step-button.component.css']
})
export class StepButtonComponent implements OnInit {
  workFlowStatus: boolean[];
  constructor(
     private drawHouseLayoutService: DrawHouseLayoutService,
     
     private testService: TestMessageService,
     private msgManager: MessageManagerService,
     private cdRef: ChangeDetectorRef) { 

    this.workFlowStatus= [false, false];
    this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.STEP_STATUSS, this.processActionFlow()); 

    // 控制撤销恢复按钮的激活状态
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'stepButtonStatus', this.stepButtonStatus());
    }

  ngOnInit() {}

  isNextPrev(index: number) {
     return this.workFlowStatus[index];
  }
  
//接收消息 改变按钮激活状态
  stepButtonStatus(): (object: any) => void {
    return(object: any) => {
        const id = object.id;
        const result = object.result;
        this.workFlowStatus[0] = result[0];
        this.workFlowStatus[1] = result[1];
    }
  }
    
  //撤销
  clickPreStep() {     
      const obj =  {} as any;
      const message = new Message(DrawHouseLayoutService.UNDO, obj);
      this.drawHouseLayoutService.postMessage(message);

// 清空选择
      const objinfo = new Array<any>();
      objinfo.push('none');
      const message1 = new Message('clearSelect', objinfo);
      this.drawHouseLayoutService.postMessage(message1);

    

  }

  //恢复
  clickNextStep() {
      const obj =  {} as any;
      const message = new Message(DrawHouseLayoutService.REDO, obj);
      this.drawHouseLayoutService.postMessage(message);

  // 清空选择
      const objinfo = new Array<any>();
      objinfo.push('none');
      const message1 = new Message('clearSelect', objinfo);
      this.drawHouseLayoutService.postMessage(message1);
  }
 
  //撤销/恢复
              
 /* const obj = {} as any;               
    obj.id = Math.random().toString();                
    obj.preEnabled = null;                
    obj.nextEnabled = false; 
    wallgenerating(): (object: any) => void {
    return(object: any) => {*/
  processActionFlow(): (obj : any) => void {
    return(obj: any) => {
      if( obj.preEnabled !== undefined && obj.preEnabled !== null){
            this.workFlowStatus[0] = <boolean>(obj.preEnabled);
      }

       if( obj.nextEnabled !== undefined && obj.nextEnabled !== null){
            this.workFlowStatus[1] = <boolean>(obj.nextEnabled);
      }
      this.cdRef.detectChanges();
    }
  }



}

 


