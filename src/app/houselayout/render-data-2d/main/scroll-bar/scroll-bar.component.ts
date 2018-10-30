import { Component, OnInit } from '@angular/core';
import { DrawHouseLayoutService, TestMessageService ,Message,MessageManagerService} from '../../../service/hsservice';

@Component({
  selector: 'app-scroll-bar',
  templateUrl: './scroll-bar.component.html',
  styleUrls: ['./scroll-bar.component.css']
})
export class ScrollBarComponent implements OnInit {
  
    protected bDragScroll_: Boolean;
    protected distanceX_: number;

    constructor(private drawHouseLayoutService: DrawHouseLayoutService,
     private testService: TestMessageService,
     private msgManager: MessageManagerService) { 

      this.bDragScroll_ = false;
      this.distanceX_ = 0;

      this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'scrollZoom', this.scrollZoomStatus());
     }

  ngOnInit() {
      const info = document.getElementById('zoomsliderbar');
      const bar = document.getElementById('scroll-bar');
      const defaultbar = document.getElementById('defaultBar');

      //点击滑动条任意位置画布放大缩小
    //  defaultbar.onmouseup = (event : MouseEvent) =>{
    //     event.preventDefault();
    //     event.cancelBubble = true;
    //     event.stopPropagation();

    //     const distanceY = ( this.distanceY_ === 0 ) ? 20 : this.distanceY_;
    //     let iL = event.layerY ;//- defaultbar.offsetTop;
    //     const maxL = 141.0; 
    //     console.log(event.layerY);
    //     // 限制滑块滑动的范围
    //     iL = iL < 0 ? 0 : iL; 
    //     iL = iL > maxL ? maxL : iL; 
    //     if(iL === 0) {
    //       return;
    //     }
    //     const info = document.getElementById('zoomsliderbar');  
    //     const slided = document.getElementById("slideACtive");    
    //     info.style.marginTop = '0px';
    //     info.style.marginLeft = '0px';
    //     info.style.top = iL + "px"; //滑块距离顶边的位置 

    //     const obj = new Object();
    //     obj['percentage'] = (maxL - iL) / maxL;
    //     const message = new Message('slider', obj);
    //     this.drawHouseLayoutService.postMessage(message);    
    //     slided.style.height = iL.toString()+ "px"; //滑块顶边白色条目的高度 
    //     return false;         
    // };   


    //拖动滑块画布放大缩小
      info.onmousedown = (event: MouseEvent) => {
            //const events = event || window.event; 
            event.preventDefault();    
            this.bDragScroll_ = true;

            // 获取滑块以外区域与左边的距离
            this.distanceX_ = event.clientX - info.offsetLeft;      
      };

      bar.onmouseup = (event: MouseEvent) => {
            //const events = event || window.event; 
            event.preventDefault();
            this.bDragScroll_ = false;
      };   
          
      
      bar.onmousemove = (event : MouseEvent) =>{
         event.preventDefault();
         if(!this.bDragScroll_) {
           return;
      }
  

      bar.onmouseleave = (event: MouseEvent) => {
            //const events = event || window.event; 
            event.preventDefault();         
            this.bDragScroll_ = false;             
      };

      
      let iL = event.clientX - this.distanceX_; 
      const maxL = 141.0; 
      // 限制滑块滑动的范围
      iL = iL < 0 ? 0 : iL; 
      iL = iL > maxL ? maxL : iL; 

      const info = document.getElementById('zoomsliderbar');  
      const slided = document.getElementById("slideACtive");    
      info.style.marginTop = '0px';
      info.style.marginLeft = '0px';
      info.style.left = iL + "px"; //滑块距离左边的位置 

      const obj = new Object();
      obj['percentage'] = (maxL - iL) / maxL;
      const message = new Message('slider', obj);
      this.drawHouseLayoutService.postMessage(message); 
      
      const objinfo = new Array<any>();
      objinfo.push('none');
      const message1 = new Message('clearSelect', objinfo);
      this.drawHouseLayoutService.postMessage(message1);
      
      slided.style.width = iL.toString()+ "px"; //滑块左边白色条目的宽度 
      return false;         
    }; 

  }

  onScrolledinfo(binfo: boolean) {
    const number = 2;
    // let zoomLevel:number;
    const zoomLevel = binfo ? 0.01 : -0.01;   
    const message = new Message('scrollZoom', zoomLevel);
    this.drawHouseLayoutService.postMessage(message);

    const objinfo = new Array<any>();
    objinfo.push('none');
    const message1 = new Message('clearSelect', objinfo);
    this.drawHouseLayoutService.postMessage(message1);

    // this.drawHouseLayoutService.scrollZoomBar(zoomLevel);
    
  }
  

  scrollZoomStatus(): (object: number) => void {
    return(object: number) => {
      
    }
     
  }

}
