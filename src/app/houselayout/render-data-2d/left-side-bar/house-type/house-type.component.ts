import { Component, OnInit, OnDestroy ,ChangeDetectorRef} from '@angular/core';
import { List } from './../list.model';
import {DrawHouseLayoutService, TestMessageService, Message , MessageManagerService} from '../../../service/hsservice'
import {Subscription} from 'rxjs/Subscription';

enum ENUM_DrawStatus{
  STATUS_NOT_DEFINED = -1,
  STATUS_DRAW_READY = 0,
  STATUS_ROOM_ALLCONNECTED = 1,
  STATUS_ROOM_OUTWALLGENERATED = 2,
  STATUS_ONLY_DRAWLINES = 3

}
@Component({
  selector: 'app-house-type',
  templateUrl: './house-type.component.html',
  styleUrls: ['./../left-content.common.css']
})
export class HouseTypeComponent implements OnInit, OnDestroy {
  lists: List[] ;
  disablestatus: boolean[];
  subscription: Subscription;
  public roomDrawed: number;
  selectedList: List;
  // 用于清空提示信息的timeout定时器
  private timer;

  /// 避免在组件被销毁后调用detectchange
  abletoDetecteChanage: boolean;
  msgs: Array<any>;

  constructor(private drawHouseLayoutService: DrawHouseLayoutService, private cdRef: ChangeDetectorRef,
    private msgManager: MessageManagerService,  
              private testService: TestMessageService) {
    this.lists = [
      new List('icon-ic_draw_line', '直线', 'line'),
      new List('icon-ic_draw_arc', '弧线', 'arc'),
      new List('icon-ic_draw_doorway', '添加门洞', 'addOpening'),

      //temp
      new List('icon-ic_draw_room', '添加房间', 'addByRoom')
    ];
    this.selectedList = this.lists[0];

    this.msgs = [];
    
    this.disablestatus = [false,false,false,false];
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'dragStatusSelected', this.onStatusChanged());
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'roomdrawed', this.onRoomDrawed());
    this.roomDrawed = 0;
   }

  ngOnInit() {

      this.abletoDetecteChanage = true;
      // 需要发送消息， 询问当前控件的显示状态
      const msgcontent = null;
      const msg = new Message(DrawHouseLayoutService.ASK_LAYOUTDRAWSTATUS, msgcontent);
      this.drawHouseLayoutService.postMessage(msg);

      // this.cdRef.detectChanges();


  }

  ngOnDestroy() {
    this.abletoDetecteChanage = false;
    
  }

  shutuptip() {
    this.timer = setTimeout(() => {
      while(this.msgs.length > 0) {
          this.msgs.pop();
      }
    }, 2000);
 }

  
  /**
   * 根据接受的状态判断是否能切换至划线状态
   * @param drawStatus 
   */
  checkCanDrawLineArc(drawStatus: ENUM_DrawStatus){
     switch (drawStatus) {
       case ENUM_DrawStatus.STATUS_NOT_DEFINED:
       case ENUM_DrawStatus.STATUS_DRAW_READY:
       case ENUM_DrawStatus.STATUS_ONLY_DRAWLINES:
         this.disablestatus[0] = false;
         this.disablestatus[1] = false;
         break;
       case ENUM_DrawStatus.STATUS_ROOM_ALLCONNECTED:
       case ENUM_DrawStatus.STATUS_ROOM_OUTWALLGENERATED:
         this.disablestatus[0] = true;
         this.disablestatus[1] = true;
         break;
       default:
         break;
     }
  }

  /**
   * 根据接受的状态判断是否能拖动门洞
   * @param drawStatus 
   */
  checkCanDragDoorWay(drawStatus: ENUM_DrawStatus) {
     // 只有所有房间都封闭，且外墙没有生成时，可以拖动生成门洞
     if(drawStatus === ENUM_DrawStatus.STATUS_ROOM_ALLCONNECTED){
       this.disablestatus[2] = false;
     } else {
       this.disablestatus[2] = true;
     }
  }

  /**
   * 根据接受的状态判断是否能否使用房间绘图模式
   * @param drawStatus 
   */
  checkCanDrawByRoom(drawStatus:ENUM_DrawStatus) {
      if(drawStatus === ENUM_DrawStatus.STATUS_DRAW_READY){
        this.disablestatus[3] = false;
      } else {
        this.disablestatus[3] = true;
      }
  }


  // 响应控件状态更新
  onRoomDrawed(): (objinfo: any) => void {
    return (objinfo: any) => {
        const result = <number>(objinfo.result);
        this.roomDrawed = result;
        // check & update status
        this.checkCanDragDoorWay(result);
        this.checkCanDrawByRoom(result);
        this.checkCanDrawLineArc(result);
    }
  }


  onStatusChanged(): (objectName: any) => void {
    return (objectName: any) => {
        
        const id = objectName.id;
        const result = <Boolean>(objectName.result);
 
        
        if ('none' ===  id) {
          this.selectedList = null;
        }

        for (let i = 0; i < this.lists.length; i++) {
            if (id === this.lists[i].id) {
                if (result) {
                  this.selectedList = this.lists[i];
                } else {
                }


                break;
            }
        }


        return;
    }
  }  

  onSelect(list: List): void {
    this.selectedList = list;
    if (this.abletoDetecteChanage) {
      this.cdRef.detectChanges();
    }
    // const message = new Message('testConsole', 'abcd');
    // this.testService.postMessage(message);
    const str = list.id;
    const message1 = new Message('drawActionChanged', str);
    
    this.drawHouseLayoutService.postMessage(message1);
  }

  // 当控件无法被激活时给出提示信息
  cannotselect(list: List): void {
    //alert(list.name + '当前无法操作');
    while(this.msgs.length > 0) {
      this.msgs.pop();
    }
    const info = list.name + '当前无法操作';
    this.msgs.push({severity:'info', summary:'提示', detail:info});    
    this.shutuptip();
  }
}
