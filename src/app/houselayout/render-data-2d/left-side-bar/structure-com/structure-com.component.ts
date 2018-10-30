import { Component, OnInit } from '@angular/core';
import { List } from './../list.model';
import {DrawHouseLayoutService,TestMessageService, Message} from '../../../service/hsservice'
import {Subscription} from 'rxjs/Subscription'
@Component({
  selector: 'app-structure-com',
  templateUrl: './structure-com.component.html',
  styleUrls: ['./../left-content.common.css']
})
export class StructureComComponent implements OnInit {
  lists:List[];
  selectedList:List;
  subscription: Subscription;
  constructor(private drawHouseLayoutService: DrawHouseLayoutService,
  private testService: TestMessageService) { 
     this.lists=[
      new List('icon-ic_draw_column','柱子','PillarFlag'),
      new List('icon-ic_draw_flue','烟道','FlueFlag'),
      new List('icon-ic_draw_beam','梁','GirderFlag'),
    
    ]
  }

  ngOnInit() {
  }


  
  onSelect(list:List): void {
   // this.selectedList = list;
    const str = this.selectedList.id;
    const message = new Message('dragObjectSelected', str);
    this.drawHouseLayoutService.postMessage(message);

    const objinfo = new Array<any>();
    objinfo.push('none');
    const message1 = new Message('clearSelect', objinfo);
    this.drawHouseLayoutService.postMessage(message1);
  }
}
