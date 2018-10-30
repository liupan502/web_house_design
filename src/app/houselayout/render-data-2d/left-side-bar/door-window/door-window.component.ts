import { Component, OnInit } from '@angular/core';
import { List } from './../list.model';
import {DrawHouseLayoutService,TestMessageService, Message} from '../../../service/hsservice'
import {Subscription} from 'rxjs/Subscription'
@Component({
  selector: 'app-door-window',
  templateUrl: './door-window.component.html',
  styleUrls: ['./../left-content.common.css']
})
export class DoorWindowComponent implements OnInit {


  lists:List[];
  selectedList:List;
  subscription: Subscription;
 // iconName:string;
  constructor(private drawHouseLayoutService: DrawHouseLayoutService,
    private testService: TestMessageService) {
     this.lists=[
      new List('icon-ic_draw_openDoor','单开门','OneDoorFlag'),
      new List('icon-ic_draw_doubleOpenDo','双开门','TwoDoorsFlag'),
      new List('icon-ic_draw_slidingDoor','推拉门','SlidingDoorsFlag'),
      new List('icon-ic_draw_fixedWindow','固定窗','FixedWindowFlag'),
      new List('icon-ic_draw_floorWindow','落地窗','FloorWindowFlag'),
      new List('icon-ic_draw_bayWindow','飘窗','BayWindowFlag')
    ]

    //this.iconName = "icon-ic_draw_room"

   
   }

  ngOnInit() {
  }


   
    onSelect(list:List): void {
      this.selectedList = list;
      const str = this.selectedList.id;
      const message = new Message('dragObjectSelected', str);
      this.drawHouseLayoutService.postMessage(message);

      const objinfo = new Array<any>();
      objinfo.push('none');
      const message1 = new Message('clearSelect', objinfo);
      this.drawHouseLayoutService.postMessage(message1);
    }
  

}
