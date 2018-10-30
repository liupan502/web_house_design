import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import {trigger,state,style,animate,transition,keyframes} from '@angular/animations';
import {DrawHouseLayoutService, MessageManagerService } from '../../service/hsservice'

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css'],
 /* animations: [
     // 动画的内容
    trigger('leftShowChanged', [
      // state 控制不同的状态下对应的不同的样式
      state('active' , style({ opacity: 1, 'width':'256px'})),
      state('inactive', style({ opacity: 0, 'width':'0' })),
      // transition 控制状态到状态以什么样的方式来进行转换
     transition('shown => hidden', animate('5000ms ease-in')),
     transition('hidden => shown', animate('5000ms ease-out')),

      //transition('* => *', animate(200))
    ])
  ]*/
})


export class LeftSideBarComponent implements OnInit {
 //左侧收缩动画
  public leftSideStatus: string;
  //public leftShowChanged: string;
  //public isShowLeft: boolean = false;
  //public shrinkLeft: HTMLImageElement;
  //public src: string;
  disabled_: boolean;
  public navList:Array<string>;
  constructor(private router: Router,
    private drawHouseLayoutService: DrawHouseLayoutService,
    
    private msgManager: MessageManagerService,   
  ) {
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'changeBarTohouselayout', this.onDrawObjectSeclected());    
    this.disabled_ = false;
  
    this.navList = [ '绘制','门窗','结构','地标'];
  };

  ngOnInit() {
    this.leftSideStatus = 'close';
  }

  
  // toggleLeft() {
  //    this.leftShowChanged = this.isShowLeft ? 'active' : 'inactive'; 
  //    this.shrinkLeft = <HTMLImageElement>document.getElementById('myImgLeft');
  //   if(this.isShowLeft === false){
  //       this.shrinkLeft.src = "assets/img/right_shrink.png";
  //   } else {
  //       this.shrinkLeft.src = "assets/img/left_shrink_s.png";
  //   }
  //   this.isShowLeft = !this.isShowLeft; 
  // }

  

  onDrawObjectSeclected(): (objinfo: any) => void {
    return (objinfo: any) => {
        // houselayout is for render-2d ,house-type is for houselayout bar
     //   this.router.navigate(['./house-type']);
    }
}

}

