import {BaseHouseLayoutTool} from './base-houselayout-tool'
import {ToolEvent, Path, Point} from 'paper'
import {RenderData2DComponent } from '../render-data-2d/render.2d.component'
export class BaseDrawTool extends BaseHouseLayoutTool {

    protected isMouseDown_: boolean;
    constructor(root: RenderData2DComponent ) {
        super(root);
        this.isMouseDown_ = false;
    }

    protected onLeftMouseDown(event: ToolEvent) {
        super.onLeftMouseDown(event);
        this.isMouseDown_ = true;
    }

    protected onLeftMouseMove(event: ToolEvent) {

    }

    protected onLeftMouseUp(event: ToolEvent) {
        super.onLeftMouseUp(event);
    }
}
