import { DrawroomAddAction } from './../action/drawroom-action';
//import { WallEntities } from './../entity/wall-entities';
import { InnerWallGeometry } from './../entity-geometry/inner-wall-geometry';
import {Tool, ToolEvent, KeyEvent, Point as PaperPoint} from 'paper'
import { BaseDrawTool } from './base-draw-tool'
import {HouseLayout, Design, InnerWall} from '../entity/entity'
import * as Geo from '../../geometry/geometry'
import {
    // DesignService,
    DrawHouseLayoutService, BaseMessageService, TestMessageService,
    MessageManagerService, Message} from '../service/hsservice'
import {DrawHouseLayoutWrapper, BaseDragItemWrapper} from '../wrapper/wrapper'
import {RenderData2DComponent } from '../render-data-2d/render.2d.component'
import {WallAddAction} from '../action/action'
import {BasePath,BasePathFactory} from '../path/path'
import {HouseLayoutGeometryFactory, AuxilityLineGeometry, AuxliityRectGeometry} from '../entity-geometry/entity-geometry'

import { CompoundPath, PathItem, Path, PointText, Point, view } from 'paper'



export class DrawHouseLayoutTool extends BaseDrawTool {

    protected houseLayout_: HouseLayout;


    protected isDrawingWall_: boolean;
    constructor(root: RenderData2DComponent , wrapper: DrawHouseLayoutWrapper) {
        super(root);
        this.houseLayout_ = new HouseLayout();
        this.isDrawingWall_ = false;
        this.wrapper_ = wrapper;
        this.houseLayout_ = (<DrawHouseLayoutWrapper>this.wrapper_).getHouseLayout();
        this.commandKeyProcessMap_['ctrl+shift+L'] = this.changeToLine();
        this.commandKeyProcessMap_['ctrl+shift+A'] = this.changeToArc();



        this.commandKeyProcessMap_['space+L'] = this.startDrawLine();
        this.commandKeyProcessMap_['space+A'] = this.startDrawArc();
        this.commandKeyProcessMap_['space+H'] = this.selectDoorWay();
        this.commandKeyProcessMap_['space+O'] = this.createOutsideWall();
        this.commandKeyProcessMap_['space+I'] = this.deleteOutsideWall();

        this.tryRenderTipInfo();

    }



    protected onLeftMouseDown(event: ToolEvent) {
        // 清空实体选中效果
        this.root().responseObject(null);

        this.root().changeWallEnable('none');

        // 禁止撤销按钮使能
        this.root().changeStepButtonEnable('无法点击');
    }

    protected onLeftMouseDrag(event: ToolEvent) {
        // 1. 确定当前处于绘制房间状态

        // 2. 根据起点，终点渲染临时房间
    }

    protected onMiddleMouseUp(event: ToolEvent) {
        this.root().responseObject(null);
    }

    protected onRightMouseUp(event: ToolEvent) {
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        if  (!wrapper.isDrawing()) {
            return;
        }

        wrapper.hideAuxiliaryLine();
        wrapper.hidePotentialAttachLine();
        wrapper.hideGridLine();
        wrapper.showAuxiPoint(new Geo.Point(0, 0));

        this.informToClearAux();


        this.root().changeWallLengthTextShow('false');
        this.root().changeStepButtonEnable(this.root().getStepButttonInfo());

        const pausedWalls = wrapper.pauseDrawWall();
        if(pausedWalls){
            for(let i = 0; i < pausedWalls.length; i++) {
                const name = pausedWalls[i].showEntityInfo() + pausedWalls[i].id().toString();
                const removeMsg = new Message(DrawHouseLayoutService.REMOVE_GEOMETRY, [name]);
                this.root().getDrawHouselayoutService().postMessage(removeMsg);
            }
        }

        /// 暂停绘制墙体后，根据当前绘图模式重新给出辅助提示信息
        this.tryRenderTipInfo();

        this.root().changeToDefaultMode();

        if (wrapper.haveJustFinishedRoom()) {
            this.root().changeWallEnable('生成外墙');
            //this.root().informDrawRoomFinished(1);
        }


    }

    protected doAddWallAction(point: Geo.Point) {
        const drawHouseLayoutService  = this.root().getDrawHouselayoutService();
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        let result = false;


        // Wall ACTION 有不同情况
        const currentWallType = wrapper.getCurrentWallType();
        if(currentWallType === 'arc' || currentWallType === 'line'){
            const newWall = wrapper.getHouseLayout().tmpWall();

            /// 将 setEndPoint封装为 innterWall的接口
            newWall.segment().setEndPoint(point);

            // newWall.setEndPoint(point);
            const walladd = new WallAddAction(newWall, wrapper.roomRefOpening(), wrapper.roomRefOpeningWall());
            const msg = new Message(DrawHouseLayoutService.ADD_ACTION, walladd);
            newWall.setIsTmp(false);
            drawHouseLayoutService.postMessage(msg);
        } else if(currentWallType === 'addByRoom') {
            const tmpRoom = this.houseLayout_.tmpRoom();
            const tmpWall = this.houseLayout_.tmpWall();
            const walls = new Array<InnerWall>();
            for(let i = 0; i < tmpRoom.length; i++) {
                walls.push(tmpRoom[i]);
            }
            walls.push(tmpWall);

            const roomWallAddAction = new DrawroomAddAction(walls,wrapper.roomRefOpening(), wrapper.roomRefOpeningWall());
            const msg = new Message(DrawHouseLayoutService.ADD_ACTION, roomWallAddAction);
            drawHouseLayoutService.postMessage(msg);
        }
    }

    tryRenderTipInfo(){
        // 切换到不同模式是需要考虑，辅助信息的渲染
        // 线划模式： 激活点的提示渲染
        // 绘制房间模式： 可吸附直线的渲染
        this.informToClearAux();
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        const auxilityResults = wrapper.currentAuxObject();
        if(auxilityResults) {
            this.sendAuxInfoToRender(auxilityResults,[4,4], 'black');
        }
    }


    /**
     * 在point处创建一个临时墙
     * 根据controller当前的绘图模式，创建临时墙
     * line  ------  起点为point的直线墙       -> 对应setTmpWall
     * arc   ------  起点为point的弧线墙       -> 对应setTmpWall
     * addByRoom --  以point为左上角点的4面墙  -> 对应setTmpRoom
     * @param point
     */
    protected createTmpWall(point: Geo.Point) {
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;

        // wrapper负责按照当前绘图模式绘制墙体
        const walls = wrapper.createNewWall(point, point);
        if(walls.length === 1) {
            const newWall = walls[0];
            wrapper.getHouseLayout().setTmpWall(newWall);
            const innerWallGeometry = HouseLayoutGeometryFactory.CreateGeometry(newWall);
            const newWallName = newWall.showEntityInfo() + newWall.id().toString();

            const array = [newWallName, innerWallGeometry];
            const addGeoMsg = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
            this.root().getDrawHouselayoutService().postMessage(addGeoMsg);
        } else {
            // 将前置的（3面）墙直接添加到tmpRoom,最后一面设置为tmpWall
            const arraylength = walls.length;
            for(let i = 0; i < arraylength - 1; i++) {
                wrapper.getHouseLayout().addWall(walls[i]);

            }

            wrapper.getHouseLayout().setTmpWall(walls[arraylength - 1]);
            for(let i = 0; i < arraylength; i++) {
                const innerWallGeometry = HouseLayoutGeometryFactory.CreateGeometry(walls[i]);
                const newWallName = walls[i].showEntityInfo() + walls[i].id().toString();

                const array = [newWallName, innerWallGeometry];
                const addGeoMsg = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
                this.root().getDrawHouselayoutService().postMessage(addGeoMsg);

            }

        }


    }

    /**
     * 确认绘制线段终点
     * @param curPoint
     */
    protected findEndPointForDrawingLine(curPoint: Point): Geo.Point{
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        const availavlePoint = wrapper.getAvailablePoint(curPoint);

        // 获取辅助线信息
        const auxinfo = wrapper.showAuxInfo(new Geo.Point(availavlePoint.x(), availavlePoint.y()));
        let auxpoint = null;
        const checkpoint = auxinfo[0];
        if(checkpoint instanceof Geo.Point) {
            auxpoint = <Geo.Point>checkpoint;
            availavlePoint.setX(auxpoint.x());
            availavlePoint.setY(auxpoint.y());
        }

        //获取其他墙的吸附辅助线信息
        const newPointinfo = wrapper.getAdsorptionWallPoint(availavlePoint);
        if (newPointinfo !== null) {
            const checkpoint2 = newPointinfo[0];
            if(checkpoint2 instanceof Geo.Point) {
                availavlePoint.setX(checkpoint2.x());
                availavlePoint.setY(checkpoint2.y());
            }
        }

        // 获取辅助点
        const refPoint = wrapper.getReferencedPoint(availavlePoint);
        if  (refPoint !== null ) {
            availavlePoint.setX(refPoint.x());
            availavlePoint.setY(refPoint.y());
        }

        // 未结束绘制，则可显示直线属性
        //this.root().informPropertyInfo(this.houseLayout_.tmpWall());

        return availavlePoint;
    }



    /**
     *
     * @param event
     * 绘制时左键弹起，说明绘制好一段墙体，
     * 非绘制状态下，左键弹起，尝试开启绘制
     * @updating  维护中
     */
    protected onLeftMouseUp(event: ToolEvent) {
        super.onLeftMouseUp(event);
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;

        // 清楚辅助信息
        this.informToClearAux();

        if (wrapper.isDrawing()) {
            // 根据业务需求确定绘图的实际终点
            const availavlePoint = this.findEndPointForDrawingLine(event.point);
            // 如果实际终点不符合成图条件则不作图
            if(!wrapper.checkPointDropable(availavlePoint.toPaperPoint())) {
                return;
            }
            // 未结束绘制，则可显示直线属性
            this.root().informPropertyInfo(this.houseLayout_.tmpWall());

            // 判断绘图完毕后房间是否能封闭
            const roomConnnected = wrapper.getHouseLayout().isTmpRoomConnected();
            const canbeconnected  = wrapper.canbeConnected(availavlePoint);
            this.doAddWallAction(availavlePoint);

            if (roomConnnected === true || canbeconnected === true) {
                // 停止显示线段长度控件
                this.root().changeWallLengthTextShow('false');
                // 切换回默认绘图模式
                this.root().changeToDefaultMode(true);
                // 激活生成外墙按钮
                this.root().changeWallEnable('生成外墙');
                // 更新左侧绘图控件可用状态
                //this.root().informDrawRoomFinished(1);
                this.root().responseObject(null);

                // 激活撤销按钮
                this.root().changeStepButtonEnable('激活撤销按钮');

                // 房间封闭后，激活点清空
                wrapper.clearActivatedPoints();
            } else {
                // 房间绘制中
                //this.root().informDrawRoomFinished(0);
                // 生成新墙壁
                this.createTmpWall(availavlePoint);
                // 更新按钮状态
                this.root().changeStepButtonEnable('无法点击');
            }
     } else {
            // wrapper计算不同模式下绘图起始位置
            const  startPoint = wrapper.tryStartDrawWall(event.point);
            if (startPoint !== null) {
                this.createTmpWall(startPoint);
            }

            const activatedPoints = wrapper.initActivatedPoints();
            // 如果当前没有激活点，则要退出绘图状态，否则页面会在户型绘制情况下挂住
            if(!activatedPoints && startPoint === null) {
                this.root().changeToDefaultMode();
                return;
            }

            this.tryRenderTipInfo();
            this.root().changeWallLengthTextShow('false');
            //this.root().informDrawRoomFinished(0);
            this.root().changeStepButtonEnable('无法点击');


        }
    }


    protected moveProcess(availavlePoint: Geo.Point): Array<Geo.BaseGeometry>{
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        this.informToClearAux();

        const currentWallSegment = wrapper.getHouseLayout().tmpWall().segment();
        const auxinfo = wrapper.showAuxInfo(new Geo.Point(availavlePoint.x(), availavlePoint.y()));
        let auxpoint = null;
        const checkpoint = auxinfo[0];
        if(checkpoint instanceof Geo.Point) {
            auxpoint = <Geo.Point>checkpoint;
            availavlePoint.setX(auxpoint.x());
            availavlePoint.setY(auxpoint.y());
        }

        if  (auxpoint !== null ) {
            availavlePoint.setX(auxpoint.x());
            availavlePoint.setY(auxpoint.y());
        }

        //根据满足吸附条件的其它墙生成新的吸附点和辅助线
        //获取需要检查的墙壁的起点
        const pointShouldBecheck = wrapper.getAdaptingWallPoint();

        //计算需要显示的辅助信息
        const auxilaryInfo  =  wrapper.getAdaptingWallAuxilary(availavlePoint,pointShouldBecheck);
        if(auxilaryInfo && auxilaryInfo instanceof Array) {
            for(let i = 0; i < auxilaryInfo.length;i++) {
                auxinfo.push(auxilaryInfo[i]);
            }
        }

        const refPoint = wrapper.getReferencedPoint(availavlePoint);
        if (refPoint !== null) {
            availavlePoint.setX(refPoint.x());
            availavlePoint.setY(refPoint.y());
            const startPoint = wrapper.getStartPoint();
            // wrapper.showAuxiliaryLine(refPoint, startPoint);
            const refLine = new Geo.Line(availavlePoint, startPoint);
            auxinfo.push(refLine);
        } else {
            wrapper.hideAuxiliaryLine();
        }

        return auxinfo;
    }

    /**
     * 负责整个绘图状态时，不同模式下辅助信息的渲染
     * @param auxinfo
     * @param dashArray
     * @param strokeColor
     */
    protected sendAuxInfoToRender(auxinfo: Array<Geo.BaseGeometry>,dashArray=[5,5]
    , strokeColor='green') {
        // 让root通知视图刷新
        for(let i = 1; i < auxinfo.length; i++) {
            const tempgeo = auxinfo[i];
            let innerWallGeometry = null;
            if(tempgeo instanceof Geo.Line) {
                innerWallGeometry = new AuxilityLineGeometry(tempgeo);
            } else if (tempgeo instanceof Geo.Rect) {
                innerWallGeometry = new AuxliityRectGeometry(tempgeo);
            }

            if(!innerWallGeometry) {
                continue;
            }


            innerWallGeometry.style().dashArray = dashArray
            innerWallGeometry.style().strokeColor = strokeColor;

            const newWallName = 'auxinfo' + i.toString();
            const array = [newWallName, innerWallGeometry];
            const addGeoMsg = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
            this.root().getDrawHouselayoutService().postMessage(addGeoMsg);
        }
    }

    /**
     *
     * @param event
     * 绘制墙体是如果鼠标移动，新建的墙的终点被绘制在这里
     */
    protected onMouseMoveProcess(event: ToolEvent): void {
        const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
         // Always record the first starting point
        if (wrapper.isDrawing()) {
            this.informToClearAux();
            const currentWallSegment = wrapper.getHouseLayout().tmpWall().segment();
            const availavlePoint = wrapper.getAvailablePoint(event.point);
            // 处理

            const auxinfo = this.moveProcess(availavlePoint);

            this.sendAuxInfoToRender(auxinfo);
            // 设置tmpwall的终点
            wrapper.drawWalloperation(availavlePoint);

            //currentWallSegment.setEndPoint(availavlePoint);


            /// 设置长度控件的位置
            const wallLength = currentWallSegment.length();
            const point1 = view.projectToView(currentWallSegment.startPoint().toPaperPoint());
            const point2 = view.projectToView(currentWallSegment.endPoint().toPaperPoint());
            const middlePointX = (point1.x + point2.x) / 2;
            const middlePointY = (point1.y + point2.y) / 2; // wallLength in main coordinate

            const pointList: Array<number> = [middlePointX, middlePointY, wallLength];
            this.root().changeWallLengthText(pointList);
        }
    }


    protected changeToLine(): () => void {
        return () =>  {
            const wrapper = <DrawHouseLayoutWrapper> this.wrapper_;
            const result = wrapper.setCurrentWallType('line');
        }
    }

    protected changeToArc(): () => void  {
        return () =>  {
            const wrapper = <DrawHouseLayoutWrapper> this.wrapper_;
            const result = wrapper.setCurrentWallType('arc');
        }
    }


    protected startDrawLine(): () => void {
        return () => {

        }
    }

    protected startDrawArc(): () => void {
        return () => {

        }
    }

    protected selectDoorWay(): () => void {
        return () => {

        }
    }

    protected createOutsideWall(): () => void {
        return () => {

        }
    }

    protected deleteOutsideWall(): () => void {
        return () => {

        }
    }

   /**
     * 根据输入长度画墙
     */
    drawWallByInput(wallTargetLength: string, drawHouseLayoutService: DrawHouseLayoutService){
        const tmpWrapper = <DrawHouseLayoutWrapper>this.wrapper_;
        // 显示线段信息（ 在完成画墙时会控件会被配置为None)
        this.root().informPropertyInfo(tmpWrapper.getLastLine());
        const result = tmpWrapper.drawWallByInput(wallTargetLength);
        if (result === true) {
            const currentWall = tmpWrapper.getHouseLayout().tmpWall();
            const availavlePoint = currentWall.segment().endPoint();
            this.doAddWallAction(availavlePoint);
            this.root().informPropertyInfo(currentWall);
            if (tmpWrapper.getHouseLayout().isTmpRoomConnected()) {
                this.root().changeWallLengthTextShow('false');
                this.root().changeToDefaultMode(true);
                this.root().changeWallEnable('生成外墙');
                //this.root().informDrawRoomFinished(1);
                this.root().responseObject(null);
            } else {
                //this.root().informDrawRoomFinished(0);
                this.createTmpWall(availavlePoint);
            }

        }
    }
}
