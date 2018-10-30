import {BaseTool} from './tool'
import {RenderData2DComponent } from '../render-data-2d/render.2d.component'
import {Item} from 'paper'
import {Message,DrawHouseLayoutService} from '../service/hsservice'
import {BaseEntity} from '../entity/entity'
export enum ENUM_DrawStatus{
    STATUS_NOT_DEFINED = -1,
    STATUS_DRAW_READY = 0,
    STATUS_ROOM_ALLCONNECTED = 1,
    STATUS_ROOM_OUTWALLGENERATED = 2,
    STATUS_ONLY_DRAWLINES = 3

}
export class BaseHouseLayoutTool extends BaseTool {
    constructor(root: RenderData2DComponent) {
        super(root);
    }

    root(): RenderData2DComponent {
        if (this.root_ === null) {
            return null;
        }

        if (! (this.root_ instanceof RenderData2DComponent)) {
            return null;
        }

        return <RenderData2DComponent> this.root_;

    }

    /**
     * 尝试获取选中物体
     */
    protected trySelectObject(item: Item): BaseEntity {
        const result = this.root().getEntityByItem(item);
        if (result === null) {
            return null;
        }
        return  result;
    }


    /**
     * 在任何一种工具模式下，都可以清除辅助信息
     * 清除辅助线信息
     */
     informToClearAux() {
        for(let i = 0; i < 4;i++) {
            const name = 'auxinfo' + i.toString();
            const removeGeoMsg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, [name]);
            this.root().getDrawHouselayoutService().postMessage(removeGeoMsg);
        }
    }

}
