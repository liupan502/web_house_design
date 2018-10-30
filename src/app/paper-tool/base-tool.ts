import {Tool, ToolEvent, KeyEvent, MouseEvent } from 'paper'
import {BaseWrapper} from '../wrapper/wrapper'
 import {RenderData2DComponent} from '../houselayout/render-data-2d/render.2d.component'
import * as Geo from '../geometry/geometry'
import {Point as PaperPoint, view } from 'paper'


export  class BaseTool extends Tool {
    protected wrapper_: BaseWrapper;
    protected commandKeyProcessMap_: Map<string, () => void>;
    protected root_: any;
    protected isDraging_: boolean;
    protected dragStartPoint_: PaperPoint;
    protected dragStartCenter_: PaperPoint;
    protected dragStartTx_: number;
    protected dragStartTy_: number;
    protected timeStamp_: number;

    constructor(root: any) {
        super();
        this.onMouseDown = this.baseOnMouseDown;
        this.onMouseDrag = this.baseOnMouseDrag;
        this.onMouseMove = this.baseOnMouseMove;
        this.onMouseUp = this.baseOnMouseUp;
        this.onKeyDown = this.baseOnKeyDown;
        this.onKeyUp = this.baseOnKeyUp;
        this.root_ = root;
        this.isDraging_ = false;
        this.dragStartPoint_  = new PaperPoint(0.0, 0.0);
        this.commandKeyProcessMap_ = new Map<string, () => void>();
        this.commandKeyProcessMap_['ctrl+shift+D'] = this.onBackDefault();
        this.commandKeyProcessMap_['ctrl+N'] = this.newDesign();
        this.commandKeyProcessMap_['ctrl+O'] = this.openDesign();
        this.commandKeyProcessMap_['ctrl+S'] = this.saveDesign();
        this.commandKeyProcessMap_['Esc'] = this.quitDesign();
        this.commandKeyProcessMap_['space'] = this.quitDesign();
        this.commandKeyProcessMap_['ctrl+U'] = this.back();
        this.commandKeyProcessMap_['ctrl+C'] = this.selectCopy();
        this.commandKeyProcessMap_['ctrl+X'] = this.selectCut();
        this.commandKeyProcessMap_['ctrl+V'] = this.selectPaste();
        this.commandKeyProcessMap_['Delete'] = this.selectDelete();
        this.commandKeyProcessMap_['space+E'] = this.selectDelete();
        this.timeStamp_ = 0;

    }

    protected onLeftMouseDown(event: ToolEvent ) {
    }

    protected onMiddleMouseDown(event: ToolEvent) {

    }

    protected onRightMouseDown(event: ToolEvent) {

    }

    protected onLeftMouseMove(event: ToolEvent) {
        console.log('base on left mouse move');
    }

    protected onMiddleMouseMove(event: ToolEvent) {
        console.log('base on middle mouse move');
    }

    protected onRightMouseMove(event: ToolEvent) {
        console.log('base on right move');
    }

    protected onLeftMouseUp(event: ToolEvent) {

    }

    protected onMiddleMouseUp(event: ToolEvent) {
        //this.wrapper_.
    }

    protected onRightMouseUp(event: ToolEvent) {

    }

    protected onLeftMouseDrag(event: ToolEvent) {
    }

    protected onMiddleMouseDrag(event: ToolEvent) {
        const point = event.point;
        const viewPoint = view.projectToView(point);
        const offset = viewPoint.subtract(this.dragStartPoint_);
        view.matrix.tx = this.dragStartTx_ + offset.x;
        view.matrix.ty = this.dragStartTy_ + offset.y;

    }

    protected onRightMouseDrag(event: ToolEvent) {
    }

    protected getEventPoint(event: ToolEvent): Geo.Point {
        return new Geo.Point(event.point.x,  event.point.y);
    }



    private baseOnMouseDown(event: ToolEvent): void {
        const mouseEvent =  event.event;
        //event.point = view.projectToView(event.point);
        const offsetX =  event.point.x -  view.center.x;
        const offsetY =  event.point.y - view.center.y;
        event.point.x = offsetX;
        event.point.y = offsetY;
        mouseEvent.preventDefault();
        switch (mouseEvent.button) {
            case 0:
                this.onLeftMouseDown(event);
                break;

            case 1:
                this.onMiddleMouseDown(event);
                break;

            case 2:
                this.onRightMouseDown(event);
                break;

            default:
                break;
        }


    }

    private baseOnMouseDrag(event: ToolEvent): void {
        const mouseEvent = event.event;
        const offsetX =  event.point.x -  view.center.x;
        const offsetY =  event.point.y - view.center.y;
        event.point.x = offsetX;
        event.point.y = offsetY;
        if (!this.isDraging_) {
            this.isDraging_ = true;
            this.dragStartPoint_ = view.projectToView(event.point);
            this.dragStartCenter_ = view.projectToView(view.center);
            this.dragStartTx_ = view.matrix.tx;
            this.dragStartTy_ = view.matrix.ty;
        }
         switch (mouseEvent.buttons) {
            case 1:
                this.onLeftMouseDrag(event);
                break;

            case 4:
                this.onMiddleMouseDrag(event);
                break;

            case 2:
                this.onRightMouseDrag(event);
                break;

            default:
                break;
        }

    }

    protected onMouseMoveProcess(event: ToolEvent): void {

    }

    private baseOnMouseMove(event: ToolEvent): void {
        const offsetX =  event.point.x -  view.center.x;
        const offsetY =  event.point.y - view.center.y;
        event.point.x = offsetX;
        event.point.y = offsetY;
        if (event.event.timeStamp - this.timeStamp_ < 50) {
            //return;
        }
        this.timeStamp_ = event.event.timeStamp;
        this.onMouseMoveProcess(event);
    }

    private baseOnMouseUp(event: ToolEvent): void {
        const mouseEvent =  event.event;
        const offsetX =  event.point.x -  view.center.x;
        const offsetY =  event.point.y - view.center.y;
        event.point.x = offsetX;
        event.point.y = offsetY;
        this.isDraging_ = false;
        switch (mouseEvent.button) {
            case 0:
                this.onLeftMouseUp(event);
                break;

            case 1:
                this.onMiddleMouseMove(event);
                break;

            case 2:
                this.onRightMouseUp(event);
                break;

            default:
                break;
        }
    }

    protected processCommandKeyDown(event: KeyEvent): void {
        const kbEvent = event.event;
        const key = (kbEvent.ctrlKey ? 'ctrl+' : '') +
                    (kbEvent.altKey ? 'alt+' : '') +
                    (kbEvent.shiftKey ? 'shift+' : '') +
                    kbEvent.key;
        console.log(key);
        if (kbEvent.ctrlKey && kbEvent.shiftKey && kbEvent.key !== 'Shift' ) {
            const a = 0;
        }
        const processFn = this.commandKeyProcessMap_[key];
        if (processFn !== undefined && processFn !== null) {
            processFn();
        }
    }

    private baseOnKeyDown(event: KeyEvent): void {
        // console.log(event.character);
        // console.log(event.key);
        // console.log(event.toString());
        if (event.event.ctrlKey) {
            // console.log('control is pressed');
            this.processCommandKeyDown(event);
        } else {
            // console.log('control is not proessed');
        }
    }

    private baseOnKeyUp(event: KeyEvent): void {
        // console.log(event.character);
        // console.log(event.key);
        // console.log(event.toString());
        if (event.event.ctrlKey) {
            // console.log('control is pressed');
        } else {
            // console.log('control is not proessed');
        }

        // if(event.)
    }

    protected onBackDefault(): () => void {
        return () => {
            // const wrapper =  <BaseWrapper>this.wrapper_;
            const root = this.root_;
           if (root !== null) {
                root.setTool(null);
            }
        }
    }

    /*protected flipY(point: PaperPoint) {
        point.y = -point.y;
    }*/


    protected newDesign(): () => void {
        return () => {

        }
    }

    protected openDesign(): () => void {
        return () => {

        }
    }



    protected saveDesign(): () => void {
        return () => {

        }
    }


    protected quitDesign(): () => void {
        return () => {

        }
    }


    protected back(): () => void {
        return () => {

        }
    }

    protected selectCopy(): () => void {
        return () => {

        }
    }

    protected selectCut(): () => void {
        return () => {

        }
    }


    protected selectPaste(): () => void {
        return () => {

        }
    }


    protected selectDelete(): () => void {
        return () => {

        }
    }

    Wrapper(): BaseWrapper{
        return this.wrapper_;
    }

}
