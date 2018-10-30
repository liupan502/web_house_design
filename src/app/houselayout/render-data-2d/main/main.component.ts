import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core';
import { DrawHouseLayoutService, TestMessageService, Message, MessageManagerService } from '../../service/hsservice';
import { BaseEntity } from '../../entity/entity';
import { Router } from '@angular/router';

export class Button {
  constructor(
    public btnName: string
  ) { }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  @Output() generateOuterWall = new EventEmitter();
  // 按钮状态切换
  selectedBtn: Button;
  btns: Button[];
  disabled_: boolean;
  ngOnInit() { }
  constructor(
    private drawHouseLayoutService: DrawHouseLayoutService,

    private testService: TestMessageService,
    private msgManager: MessageManagerService,
    private cdRef: ChangeDetectorRef,
    private router: Router) {
    this.btns = [
      new Button('生成外墙'),
      new Button('拆除外墙')
    ];

    this.disabled_ = false;
    //input 值和位置
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'setWallSource', this.changeInputValue());
    //input显示与隐藏
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'showWallTextSource', this.changeInputShow());
    // 激活生成墙壁，删除墙壁按钮
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'wallgenerating', this.wallgenerating());
    //切换导航栏可点击状态
    this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SWITCH_NAVS, this.switchNavs());

  }

  switchNavs(): (object: any) => void {
    return (object: any) => {
      const oNav = document.getElementById('nav');
      const aLi = oNav.getElementsByTagName('li');
      const switchToDrawLayout = object[0];
      if (switchToDrawLayout === true) {
        for (let i = 1; i < aLi.length; i++) {
          aLi[i].className = '';
        }
        aLi[0].className = 'disabled';

      } else if (switchToDrawLayout === false) {
        for (let i = 1; i < aLi.length; i++) {
          aLi[i].className = 'disabled';
        }
        aLi[0].className = '';
      }
    }
  }


  onbtGroupgenerateOuterWal(bGenerate: boolean) {
    console.log('[main.component.html]onGenerateOuterWall', bGenerate);
    this.generateOuterWall.next(bGenerate);
  }



  wallgenerating(): (object: any) => void {
    return (object: any) => {
      const id = object.id;
      const result = object.result;

      for (let i = 0; i < this.btns.length; i++) {
        if (id === this.btns[i].btnName) {
          if (result) {
            this.selectedBtn = this.btns[i];
            this.cdRef.detectChanges();
            return;
          } else {
            return;
          }
        }
      }

      this.selectedBtn = null;
    }
  }

  changeInputValue(): (pointList: Array<number>) => void {
    return (pointList: Array<number>) => {
      const wallLengthText = <HTMLInputElement>document.getElementById('wallLength');
      const inputPositionX = pointList[0] - 20;
      const inputPositionY = pointList[1] + 10;
      if (pointList[2] < 70) {
        wallLengthText.style.display = 'none';
      } else {
        wallLengthText.style.display = 'block';
      }
      const lenghtNum = pointList[2].toString();
      const index = lenghtNum.indexOf('.');
      const content = index >= 0 ? lenghtNum.substr(0, index) : lenghtNum;
      // content += 'm';
      wallLengthText.style.left = inputPositionX + 'px';
      wallLengthText.style.top = inputPositionY + 'px';
      wallLengthText.value = content;
      wallLengthText.focus();
      wallLengthText.select();
    }
  }


  changeInputShow(): (action: string) => void {
    return (action: string) => {
      const wallLengthText = <HTMLInputElement>document.getElementById('wallLength');
      if (action === 'false') {
        wallLengthText.style.display = 'none';
      } else {
        wallLengthText.style.display = 'block';
        wallLengthText.focus();
        wallLengthText.select();
      }
    }
  }




  stopClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }


  onAllKeyUp(event: any) {
    const keyCode = event.keyCode;
    const inputText = <HTMLInputElement>document.getElementById('wallLength');

    let inputValue: number;
    const textValue = inputText.value;

    // 只能输入数字和一个小数点并保留小数点后两位
    let newval = textValue.replace(/[^\d.]/g, '');
    newval = newval.replace(/\.{2,}/g, '');
    newval = newval.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    if (newval.indexOf('.') < 0 && newval !== '') {
      inputValue = parseFloat(newval);
      newval = inputValue.toString();
    }

    inputText.value = newval;

    if (event.keyCode === 13) {
      // 先使用组件间通信 考虑后期修改
      const message = new Message('setSingleWallSource', inputText.value);
      this.drawHouseLayoutService.postMessage(message);
      // this.drawHouseLayoutService.setWallLength(inputText.value);
      inputText.focus();
      inputText.select();
      this.cdRef.detectChanges();
    }
  }
}
