import { BaseHouseLayoutTool, ENUM_DrawStatus } from './base-houselayout-tool'
import { ToolEvent, view } from 'paper'
import { RenderData2DComponent } from '../render-data-2d/render.2d.component'
import { DefaultWrapper } from '../wrapper/wrapper'
import { LayerStage, HouseLayoutDragEntity } from '../entity/entity'
import {
  // DesignService,
  DrawHouseLayoutService, BaseMessageService,
  MessageManagerService, Message
} from '../service/hsservice'


export class DefaultTool extends BaseHouseLayoutTool {


  constructor(root: RenderData2DComponent, wrapper: DefaultWrapper) {
    super(root);
    this.wrapper_ = wrapper;
    this.commandKeyProcessMap_['ctrl+alt+d'] = this.selectDoorOpening();
    this.commandKeyProcessMap_['ctrl+alt+o'] = this.createOutsideWall();
    this.commandKeyProcessMap_['ctrl+alt+c'] = this.startDrawWall();
    this.commandKeyProcessMap_['ctrl+alt+c'] = this.startDrawWall();
    this.commandKeyProcessMap_['ctrl+alt+g'] = this.createOutsideWall();


    /// DEBUG TOOL
    //       this.commandKeyProcessMap_['ctrl+alt+s'] = this.switchToNewLayer();
    //        this.commandKeyProcessMap_['ctrl+alt+h'] = this.showCurrentLayerOnly();

    /// DEBUG TOOLS

    //  回到默认状态时，需要判断当前绘图的状态，并通知控件更新
    this.alterComponentWithLayoutStatus();

  }

  protected selectDoorOpening(): () => void {
    return () => {
      const root = this.root();
      root.changeToDragMode('opening_door');
    }
  }

  protected createOutsideWall(): () => void {
    return () => {
    }
  }

  protected switchToNewLayer(): () => void {
    return () => {
      const info = ['debug', LayerStage.LAYER_STAGE_THREE];
      const msg = new Message(DrawHouseLayoutService.SWITCH_LAYER, info);
      const drawService = this.root().getDrawHouselayoutService().postMessage(msg);
    }
  }

  protected showCurrentLayerOnly(): () => void {
    return () => {
      const info = ['debug', LayerStage.LAYER_STAGE_THREE];
      const msg = new Message(DrawHouseLayoutService.SHOWCURLAYERONLY, info);
      const drawService = this.root().getDrawHouselayoutService().postMessage(msg);
    }
  }

  protected onMiddleMouseDown(event: ToolEvent) {
    this.root().responseObject(null);
  }

  protected onLeftMouseDrag(event: ToolEvent) {
    this.root().responseObject(null);
    const wrapper = <DefaultWrapper>this.wrapper_;
    const object = <HouseLayoutDragEntity>this.trySelectObject(event.item);
    this.root().changeToDragModeWithObject(object);
  }

  protected onLeftMouseDown(event: ToolEvent) {

    //拖动的时候隐藏按钮
    const wrapper = <DefaultWrapper>this.wrapper_;
    const object = this.trySelectObject(event.item);

    if (object === null) {

      const points = event.point;
      const viewpoint = view.projectToView(points);
      console.log('points');
      console.log(points);
      console.log(viewpoint);

      // 判断绘图模式是否可以执行
      if (!wrapper.outwallGenerated()) {
        this.root().changeToDrawMode('line');
      }

      wrapper.setCurrentPickedItem(null);
      this.root().informPropertyInfo(null);
      return;


    } else {
      wrapper.setCurrentPickedItem(object);
      this.root().informPropertyInfo(object);

      const pointview = view.projectToView(object.position().toPaperPoint());

      const boundRect = object.getBoundRect();
      if (boundRect !== null) {

      }
    }

  }

  protected startDrawWall(): () => void {
    return () => {
      const root = this.root();
      root.startDrawWall();
    }
  }

  /**
   * 根据当前绘图状态，更新控件相应状态
   */
  protected alterComponentWithLayoutStatus() {
    const wrapper = this.wrapper_;
    if (!wrapper) {
      console.error('[default-tool]-- alterComponentWithLayoutStatus->detects null wrapper.');
      return;
    }

    const house = wrapper.getHouseLayout();
    if (!house) {
      console.error('[default-tool]-- alterComponentWithLayoutStatus->detects null houselayout.');
      return;
    }

    // 外墙已生成
    const outWallGenerated = house.outwallGenerated();
    if (outWallGenerated) {
      this.root().informDrawStatus(ENUM_DrawStatus.STATUS_ROOM_OUTWALLGENERATED);
      return;
    }


    const tmpRoom = house.tmpRoom();
    const tmpWall = house.tmpWall();
    const singleOpneing = house.findSingleOpening();
    // 线段绘制中(房间绘制一半，有临时数据)
    if (tmpRoom && tmpRoom.length > 0) {
      this.root().informDrawStatus(ENUM_DrawStatus.STATUS_ONLY_DRAWLINES);
      return;
    }

    // 需添加门洞（房屋封闭，无可用门洞）
    if (!singleOpneing && house.roomNum() >= 1) {
      this.root().informDrawStatus(ENUM_DrawStatus.STATUS_ROOM_ALLCONNECTED);
      return;
    }

    // 画布可绘制状态（可绘制，且无临时数据）
    this.root().informDrawStatus(ENUM_DrawStatus.STATUS_DRAW_READY);

  }

}



