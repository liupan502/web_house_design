import { HouselayoutFlagAuxEntityGeometry } from './../entity-geometry/houseflag-auxilary-geometry';
import {BaseHouseLayoutTool} from './base-houselayout-tool'

import {BaseEntity, Design, HouseLayoutDragEntity , Opening,HouseLayout} from '../entity/entity'
import {ToolEvent} from 'paper'
import {BaseWrapper, DrawHouseLayoutWrapper, BaseDragItemWrapper} from '../wrapper/wrapper'
import {Point} from '../../geometry/geometry'
import {RenderData2DComponent } from '../render-data-2d/render.2d.component'
import {OpeningAddAction} from '../action/action'
import {
    // DesignService,
    DrawHouseLayoutService, BaseMessageService, TestMessageService,
    MessageManagerService, Message} from '../service/hsservice'

import { view } from 'paper'
export class BaseDragItemTool extends BaseHouseLayoutTool {
    protected selectedObject_: BaseEntity;



    constructor(root: RenderData2DComponent, wrapper: BaseDragItemWrapper) {
        super(root);
        this.selectedObject_ = null;

        this.wrapper_ = wrapper;
    }

    onLeftMouseDown(event: ToolEvent) {

    }

    onLeftMouseDrag(event: ToolEvent) {
        //通过鼠标是否移动判断是否是够进入drag状态
        const point = event.point;
        const viewPoint = view.projectToView(point);
        const offset = viewPoint.subtract(this.dragStartPoint_);
        if(offset.x !== 0 && offset.y !== 0){
            const wrapper = <BaseDragItemWrapper> this.wrapper_;
            const result = wrapper.tryMoveItemTo(event.point);
            this.trySendTmpDrageItem();
        }
    }

    onRightMouseDown(event: ToolEvent) {
        const wrapper = <BaseDragItemWrapper> this.wrapper_;
        if (wrapper.doSelectedItem()) {
            wrapper.removeCurrentSelectedItem();
            this.root().changeToDefaultMode();

        }
    }

    onLeftMouseUp(event: ToolEvent) {

        const wrapper = <BaseDragItemWrapper> this.wrapper_;
        wrapper.eraseaux();
        const removeObjInfo = wrapper.reportTmpObjRemoveInfo();
        for(let i = 0; i < removeObjInfo.length; i++) {
            const name = removeObjInfo[i];
            const removeGeoMsg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, [name]);
            this.root().getDrawHouselayoutService().postMessage(removeGeoMsg);
        }

        if (wrapper.doSelectedItem()) {
            const currentdraggeditem =  <HouseLayoutDragEntity>wrapper.currentSelectedItem();
            // 只有在可吸附门窗吸附在房屋上时才可以定位
            if (wrapper.checkCurrentItemAttached(event.point) ) {
                if (currentdraggeditem.showEntityInfo() !== 'room') {
                    const posstatus =
                    wrapper.entityPostionedAction(this.root().getDrawHouselayoutService(), this.root().getMsgManager());
                     this.root().responseObject(currentdraggeditem);
                }

                if (currentdraggeditem.showEntityInfo() === 'DoorwayFlag') {
                    this.root().changeToDefaultMode();
                    this.root().changeToDrawMode('line');

                 } else {
                     this.root().changeToDefaultMode();
                 }

            } else {

                wrapper.resumeSelObjectToOriPos();
                this.root().changeToDefaultMode();
            }



            const dragAuxName = "dragAuxgeomerty";
            const addGeoMsg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, [dragAuxName]);
            this.root().getDrawHouselayoutService().postMessage(addGeoMsg);
        }
        this.root().changeToDefaultMode();
        wrapper.nullCurItem();
    }

    protected onMouseMoveProcess(event: ToolEvent): void {
        const wrapper = <BaseDragItemWrapper> this.wrapper_;
        const result = wrapper.tryMoveItemTo(event.point);

        this.trySendTmpDrageItem();
    }

    protected trySendTmpDrageItem() {
        if(!(this.wrapper_ instanceof BaseDragItemWrapper)) {
            return;
        }



        const wrapper = <BaseDragItemWrapper> this.wrapper_;
        const curItem = wrapper.currentSelectedItem();



        const addObjMap = wrapper.reportTmpObjAddInfo();
        const removeObjInfo = wrapper.reportTmpObjRemoveInfo();
        /// 将move过程中产生的临时信息 传递给View层渲染
        addObjMap.forEach((value, key) => {
            const tmpObjGeometry = value;
            const tmpObjName = key;
            const array = [tmpObjName, tmpObjGeometry];
            const addGeoMsg = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
            this.root().getDrawHouselayoutService().postMessage(addGeoMsg);
        });

        for(let i = 0; i < removeObjInfo.length; i++) {
            const name = removeObjInfo[i];
            const removeGeoMsg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, [name]);
            this.root().getDrawHouselayoutService().postMessage(removeGeoMsg);
        }
    }
}
