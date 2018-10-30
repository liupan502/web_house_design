import {
  Component, OnInit, ChangeDetectorRef, AfterViewInit, Type, ViewChild, ViewContainerRef
  , ComponentFactoryResolver, OnDestroy
} from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { DrawHouseLayoutService, TestMessageService, Message, MessageManagerService } from '../../service/hsservice';
import { BaseEntity, Serializable, HouseLayoutDragEntity } from '../../entity/entity';
import { NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { Segment } from '../../../geometry/geometry'
import { AdDirective } from './ad.directive';
import { PropertyItem } from './right-side-bar.item'
import { PropertyComponet } from './property.component'
import { PropertyPanelHelper } from '../prphelper.model'

import { ArcComponent } from './arc/arc.component';
import { DoorComponent } from './door/door.component';
import { LandMarkComponent } from './land-mark/land-mark.component';
import { DoorHoleComponent } from './door-hole/door-hole.component';
import { PillarComponent } from './pillar/pillar.component';
import { PurlinComponent } from './purlin/purlin.component';
import { RoundLandMarkComponent } from './round-land-mark/round-land-mark.component';
import { RoundWallMarkComponent } from './round-wall-mark/round-wall-mark.component';
import { StraightLineComponent } from './straight-line/straight-line.component';
import { WallMarkComponent } from './wall-mark/wall-mark.component';
import { WindowComponent } from './window/window.component';
import { BayWindowComponent } from './bayWindow/bayWindow.component';
import { NoneComponent } from './none/none.component'

@Component({
  selector: 'app-right-side-bar',
  templateUrl: './right-side-bar.component.html',
  styleUrls: ['./right-side-bar.component.css'],
  animations: [
    // 动画的内容
    trigger('rightShowChanged', [
      // state 控制不同的状态下对应的不同的样式
      state('active', style({ opacity: 1, 'width': '245px' })),
      state('inactive', style({ opacity: 0, 'width': '0' })),
      // transition 控制状态到状态以什么样的方式来进行转换
      transition('shown => hidden', animate('5000ms ease-in')),
      transition('hidden => shown', animate('5000ms ease-out')),
      //transition('* => *', animate(200))
    ])
  ]
})



export class RightSideBarComponent implements OnInit {
  public leftSideStatus: string;
  public pannels: Array<BaseEntity>;

  // 与 main中实体对应的属性item
  protected propertyitem: PropertyItem;
  private entityToCompent: Array<PropertyPanelHelper> =
    [
      new PropertyPanelHelper(NoneComponent, 'none', 'none'),
      new PropertyPanelHelper(StraightLineComponent, 'directeline', 'directeline'),
      new PropertyPanelHelper(ArcComponent, 'arcline', 'arcline'),
      new PropertyPanelHelper(DoorHoleComponent, 'DoorwayFlag', 'Doorway'),
      new PropertyPanelHelper(PillarComponent, 'PillarFlag', 'Pillar'),
      new PropertyPanelHelper(PillarComponent, 'FlueFlag', 'Flue'),
      new PropertyPanelHelper(PurlinComponent, 'GirderFlag', 'Girder'),
      new PropertyPanelHelper(DoorComponent, 'OneDoorFlag', 'OneDoor'),
      new PropertyPanelHelper(DoorComponent, 'TwoDoorsFlag', 'TwoDoors'),
      new PropertyPanelHelper(DoorComponent, 'SlidingDoorsFlag', 'SlidingDoors'),
      new PropertyPanelHelper(WindowComponent, 'FixedWindowFlag', 'FixedWindow'),
      new PropertyPanelHelper(WindowComponent, 'FloorWindowFlag', 'FloorWindow'),
      new PropertyPanelHelper(BayWindowComponent, 'BayWindowFlag', 'BayWindow'),
      new PropertyPanelHelper(RoundLandMarkComponent, 'FloorDrainlFlag', 'FloorDrainl'),
      new PropertyPanelHelper(RoundLandMarkComponent, 'UphillFlag', 'Uphill'),
      new PropertyPanelHelper(LandMarkComponent, 'PipelienFlag', 'Pipelien'),
      new PropertyPanelHelper(WallMarkComponent, 'StrongElectricBoxFlag', 'StrongElectricBox'),
      new PropertyPanelHelper(WallMarkComponent, 'WeakBoxFlag', 'WeakBox'),
      new PropertyPanelHelper(WallMarkComponent, 'KtFlag', 'Kt'),
      new PropertyPanelHelper(WallMarkComponent, 'RadiatorFlag', 'Radiator'),
      new PropertyPanelHelper(WallMarkComponent, 'HangingFireplaceFlag', 'HangingFireplace'),
      new PropertyPanelHelper(WallMarkComponent, 'GasMeterFlag', 'GasMeter'),
      new PropertyPanelHelper(RoundWallMarkComponent, 'WaterMeterFlag', 'WaterMeter'),
    ];

  // ViewContainer容器的helper
  @ViewChild(AdDirective) adHost: AdDirective;
  @ViewChild('foo', { read: ViewContainerRef }) foo;
  protected currentPropertyIndex = -1;

  protected currentSelectedSceneObject: HouseLayoutDragEntity = null;

  rightShowChanged: string;
  isShowRight: Boolean = false;
  shrinkRight: HTMLImageElement;
  htmlEle: HTMLElement = null;
  currentvalue;
  disabled_: boolean;

  public isShow: boolean = false;
  constructor(private drawHouseLayoutService: DrawHouseLayoutService,

    private msgManager: MessageManagerService,
    private testService: TestMessageService,
    private cdRef: ChangeDetectorRef,


    private componentFactoryResolver: ComponentFactoryResolver) {
    this.pannels = [];
    this.propertyitem = null;

    // 点击模型显示
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'sceneObjectSelected', this.clickSceneObject());

    //线段属性显示
    this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'showLastLineType', this.showLineType());

    this.disabled_ = false;
  }



  ngOnInit() {
    this.leftSideStatus = 'close';
  }

  // 右侧收缩动画
  // toggleRight() {
  //   this.rightShowChanged = this.isShowRight ? 'active' : 'inactive';
  //   this.shrinkRight = <HTMLImageElement>document.getElementById('myImgRight');

  //   if (this.isShowRight === false) {
  //     this.shrinkRight.src = 'assets/img/left_shrink_s.png';
  //   } else {
  //     this.shrinkRight.src = 'assets/img/right_shrink.png';
  //   }
  //   this.isShowRight = !this.isShowRight;
  // }

  protected dumperror(num: number) {
  }

  changepanels() {
    const componentFactory = this.componentFactoryResolver.
      resolveComponentFactory(this.propertyitem.component);

    const viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();


    // 4. 交给view 
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<PropertyComponet>componentRef.instance).data = this.propertyitem.data;
    // Inject the service 
    (<PropertyComponet>componentRef.instance).drawHouLayoutService = this.drawHouseLayoutService;
    //(<PropertyComponet>componentRef.instance).hoopup();
    this.cdRef.detectChanges();
  }

  // 点击模型显示属性设置
  clickSceneObject(): (objinfo: any) => void {
    return (objinfo: any) => {
      // 1. 类型判断 
      if (objinfo[0] === null || objinfo[0] === undefined) {
        this.dumperror(101);
        return;
      }

      if (objinfo[1] === null && objinfo[1] === undefined) {
        this.dumperror(103);
        return;
      }

      // 2. 赋值
      for (let i = 0; i < this.entityToCompent.length; i++) {
        if (this.entityToCompent[i].typename === objinfo[0]) {
          if (null === this.propertyitem) {
            this.propertyitem = new PropertyItem(this.entityToCompent[i].typespecter, objinfo[1]);
            this.isShow = false;
          } else {
            this.propertyitem.component = this.entityToCompent[i].typespecter;
            this.propertyitem.data = objinfo[1];
            this.isShow = true;
          }
        }
      }


      // 4. 实例化
      this.changepanels();
    }
  }


  //绘图时线段属性显示
  showLineType(): (object: any) => void {
    return (object: any) => {
    }
  }



  close() {
    this.isShow = false;
  }

}
