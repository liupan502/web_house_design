import { Component, OnInit } from '@angular/core';
import { List } from './../list.model';
import {DrawHouseLayoutService,TestMessageService, Message} from '../../../service/hsservice'
import {Subscription} from 'rxjs/Subscription'
@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./../left-content.common.css']
})
export class MarkerComponent implements OnInit {
  lists:List[];
  subscription: Subscription;
  constructor(private drawHouseLayoutService: DrawHouseLayoutService,
  private testService: TestMessageService) { 
    this.lists=[
      new List('icon-ic_draw_theFloorDrai','地漏','FloorDrainlFlag'),
      new List('icon-ic_draw_conduit','管道','PipelienFlag'),
      new List('icon-ic_draw_strongElectr','强电箱','StrongElectricBoxFlag'),
      new List('icon-ic_draw_weakElectric','弱电箱','WeakBoxFlag'),
      new List('icon-ic_draw_airCondition','空调口','KtFlag'),
      new List('icon-ic_draw_radiator','暖气片','RadiatorFlag'),
      new List('icon-ic_draw_wallHangingF','壁挂炉','HangingFireplaceFlag'),
      new List('icon-ic_draw_waterMeter','水表','WaterMeterFlag'),
      new List('icon-ic_draw_gasMeter','燃气表','GasMeterFlag'),
      new List('icon-ic_draw_upperAndLowe','上下水口','UphillFlag'),
    
    ]
  }

  ngOnInit() {
  }

  
 selectedList:List;
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
