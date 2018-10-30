
import { urlPathConsts } from './../../service/http-service/url-path.const';
import { structForDetailData } from './houselayout-library/detail-edit/detail-edit.module';
import {HouselayoutFlagAuxEntityGeometry} from './../entity-geometry/houseflag-auxilary-geometry';
import {Wall} from './../entity/wall';
import {FlagModifyAction} from './../action/flag-action';
import {OpeningModifyAction} from './../action/opening-action';
import {HouseLayoutFlag} from './../entity/houselayout-flag';
import {
    Component,
    OnInit,
    AfterViewInit,
    AfterContentInit,
    AfterContentChecked,
    OnDestroy,
    ViewChild,
    HostListener
} from '@angular/core'
import * as Paper from 'paper'
import {Background, Opening, Design, HouseLayoutDragEntity, LandMark, BaseEntity, LayerStage} from '../entity/entity'
import * as Tool from '../paper-tool/tool'
import {Point, Rect, Segment} from '../../geometry/geometry'
import {
    DrawHouseLayoutService, BaseMessageService,
    MessageManagerService, Message
    , HouseLayoutActionManagerService, WrapperService
} from '../service/hsservice'

import {DesignService} from '../../service/design.service'
import {BaseWrapper, DrawHouseLayoutWrapper, BaseDragItemWrapper, DefaultWrapper} from '../wrapper/wrapper'
import {BaseDragItemTool, DrawHouseLayoutTool, ENUM_DrawStatus} from '../paper-tool/tool'
import {BaseAction, LayoutOuterWallAddAction, LayoutOuterWallDeleteAction} from '../action/action'

import {FlagFactory} from '../entity/entity'
import {Router} from '@angular/router';

import {Scene2D, BaseEntityGeometry, HouseLayoutGeometryFactory} from '../entity-geometry/entity-geometry'
import {view, Item} from 'paper'

import {HttpService} from '../../service/http-service/http-service'

import {MainComponent} from './main/main.component'
import {LeftSideBarComponent} from './left-side-bar/left-side-bar.component'
import {RightSideBarComponent} from './right-side-bar/right-side-bar.component'

import {PropertyPanelHelper} from './prphelper.model'
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

@Component({
    selector: 'render2d',
    templateUrl: './render.2d.component.html',
    styleUrls: ['./render.2d.component.css'],

    providers: [DrawHouseLayoutService,
        BaseMessageService,
        MessageManagerService,
        WrapperService,
        HouseLayoutActionManagerService
    ],
})

export class RenderData2DComponent implements OnInit, OnDestroy {
    private canvas: HTMLCanvasElement;
    private a: number;
    protected background_: Background;
    protected opening_: Opening;
    protected tool_: Paper.Tool;
    protected wrapper_: BaseWrapper;
    protected test_: boolean;
    private currentTime_: number = -1;
    protected scene_: Scene2D = null;
    public showPopPlane = {

        isShowMyHouselayout: false,


        isShowDetailEdit: false,
        isShowSearchBar: false



    }
    public selectHouselayoutNo: string = '';


        isShowMyHouselayout: false
        isShowDetailEdit: false


    // acquire child component with the helf of @VIEWCHILD
    @ViewChild(MainComponent) maincomponent_: MainComponent;
    @ViewChild(LeftSideBarComponent) leftSideBarComponent_: LeftSideBarComponent;
    @ViewChild(RightSideBarComponent) rightSideBarComponent_: RightSideBarComponent;
    protected disabled = [true, true, true];
    // 当前图层名称
    protected currentLayerStage: LayerStage;

    /**        public typespecter: Type<any>,
     public typename: string,
     public id:  string */
    private entityToCompent: Array<PropertyPanelHelper> =
        [];

    constructor(private designService: DesignService,
                private wrapperService: WrapperService,
                private drawHouseLayoutService: DrawHouseLayoutService,
                private msgManager: MessageManagerService,
                private actionManagerService: HouseLayoutActionManagerService,
                public router: Router,
                public http: HttpClient) {
        this.scene_ = new Scene2D();
        this.currentLayerStage = LayerStage.LAYER_STAGE_ONE;

        this.addMessageHandler();


    }


    // 注册消息回调方法
    protected addMessageHandler() {
        //画模型
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.DRAG_OBJECT_SELECTED,
            this.onDrawObjectSeclected());

        //滑动
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SLIDER, this.slidersmoved());
        //绘制户型时的动作选择
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.DRAW_ACTION_CHANGED,
            this.onDrawActionChanged());
        //刷新场景
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.REFRESH_SCENE,
            this.onRefreshScene());
        // 接收最后一面墙长度设置
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SET_SINGLE_WALL_SOURCE,
            this.onRefreshLastWall());
        //滚轮缩放
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SCROLL_ZOOM, this.onZoomHappened());


        //线段属性修改
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.LINE_TYPE_CHANGED,
            this.LineTypeChanged());

        // 添加动作
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.ADD_ACTION, this.onAddAction());

        // entity数据修改时的消息响应
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.ModifyEntityIn_HouseLayout, this.onModifyHouseLayout());

        // undo
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.UNDO, this.onUndo());

        // redo
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.REDO, this.onRedo());

        // add geometry
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.ADD_GEOMETRY, this.onAddGeometry());

        // remove geometry
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.REMOVE_GEOMETRY, this.onRemoveGeometry());

        // left bar 户型绘制控件，初始化时必须知道当前绘图状态
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.ASK_LAYOUTDRAWSTATUS, this.onAskStaus());

        //清空状态
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.CLEAR_SELRCT, this.clearSelectedStyle());

        //更改模型样式
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.CHANGE_STYLE, this.changeSelectStyle());

        //切换图层
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SWITCH_LAYER, this.switchLayers());

        //更新激活点
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.INIT_ACTIVATEDPOINTS, this.OnInitActivatePoints());

        //切换tool状态
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.DETECT_TOOL_STATUS, this.OnDetectToolStatus());

        // 禁用/激活 rootComponent的子组件（当前为3个
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SWITCH_CHILDCOMPONENTS, this.onSwitchChildComponents());


        // 翻转一次当前选中的实体
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.FLIP_CURRENT_ENTITY, this.OnFlipCurrentEntity());

        // debug tool SHOWCURLAYERONLY
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.SHOWCURLAYERONLY, this.showLayerOnly());

        // 处理弹窗显示（我的户型、搜索户型）
        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.OPEN_POP_PLANE, this.openPopPlane())

    }

    //滑动滑块画布放大缩小
    slidersmoved(): (objinfo: any) => void {
        return (objinfo: any) => {
            const scaleinfo = objinfo.percentage;
            Paper.view.zoom = 0.5 + (2.2 - 0.5) * scaleinfo;
        }
    }

    /**
     * 刷新时如果有数据则执行绘图
     * @param design
     */
    informReceievedDesign(design: Design) {
        const entityGeoMap = design.generateEntityGeometries();
        if (null !== entityGeoMap) {
            entityGeoMap.forEach((value, key) => {
                const array = [key, value];

                const msginfo = new Message(DrawHouseLayoutService.ADD_GEOMETRY, array);
                this.drawHouseLayoutService.postMessage(msginfo);
            });

            // 发送消息，让rootComponent根据数据情况判断进入对应的绘图状态
            const msginfo = null;
            const msgtool = new Message(DrawHouseLayoutService.DETECT_TOOL_STATUS, msginfo);
            this.drawHouseLayoutService.postMessage(msgtool);

            //this.changeWallEnable('拆除外墙');
            this.informHouselayoutType('拆除外墙', 1, 'wallgenerating');

            // SHOULD NOT CALL THESE TWO FUNCTIONS HERE!!
            // because same logical have already been done in HouseLayout::generateOuterWalls()
            //design.houseLayout().createRoomEntities();
            //design.houseLayout().createWallEntities();
        }
    }


    ngOnInit() {

        // 阻止右键默认菜单弹出
        document.oncontextmenu = function () {
            return false;
        }


        this.router.navigate(['houselayout/house-type']);

        this.canvas = <HTMLCanvasElement> document.getElementById('myCanvas');
        this.canvas.style.borderWidth = '0';
        this.canvas.style.borderTop = '0';
        this.canvas.style.margin = '[0,0,0,0]';
        this.wrapper_ = null;

        Paper.setup('myCanvas');
        // Paper.view.onFrameonFrame
        Paper.view.center = new Point(0,0).toPaperPoint();
        Paper.view.onFrame = this.onPaperFrame();

        const design_ = this.designService.getDesign();
        if (design_.houseLayout().roomNum() > 0) {
            console.log(design_.houseLayout().rooms()[0].walls());
        }


        this.informReceievedDesign(design_);
        this.wrapper_ = this.wrapperService.getDrawHouseLayoutWrapper();

        this.changeToDefaultMode();

        //this.startDrawWall();


        // 获取当前的放大 倍数
        const zoomval = Paper.view.zoom;
        const rate = 141 - (zoomval - 0.5) / 1.7 * 141;
        const newcontent = document.getElementById('zoomsliderbar');
        const slided = document.getElementById('slideACtive');
        newcontent.style.left = rate.toString() + 'px';
        slided.style.width = rate.toString() + 'px';

        // 设定中心
        const viewCenterX = Paper.view.bounds.center.x;
        const viewCenterY = Paper.view.bounds.center.y;
        console.log('Current view center x,y');
        console.log(viewCenterX);
        console.log(viewCenterY);


        // 添加网格
        const centerX = Paper.view.bounds.center.x;
        const centerY = Paper.view.bounds.center.y;
        const grid = new Background(100, 100, centerX, centerY);
        grid.setStrokeColor('#cccccc');

        grid.updatePath();


        Paper.view.draw();
        // Paper.project.activeLayer.fillColor = '#F6F6F6';
        // Paper.project.activeLayer.selectedColor = 'purple';

    }


    ngOnDestroy() {
        // 清空动作队列
        if (this.actionManagerService.houseLayoutActionManager())
            this.actionManagerService.houseLayoutActionManager().releaseActions();
    }

    // 设置当前的tool， 如果传入null,则设为DefaultTool
    setTool(tool: Tool.BaseTool) {
        if (tool === null) {
            tool = new Tool.DefaultTool(this, this.wrapperService.getDefaultWrapper());
        }
        this.wrapper_ = tool.Wrapper();
        this.tool_ = tool;
        this.tool_.activate();
    }

    saveDetail(event: any){
        /*
        this.showPopPlane.isShowDetailEdit=false;
        // 保存数据
        console.log(event);
        const detailData = <structForDetailData>event.data;
        //const walls = this.designService.getHouseLayout().wallEntities();
        //const entityInfos = walls.dumpWallEntities();

        const designinfo = this.designService.getDesign();

        const jsonresult = designinfo.toJSON();

        //this.fa.updateElements(entityInfos, roomInfos);

        const timestamp = Number(new Date());
        const data = {
            'no': uuid(),
            'data': jsonresult
        };


        //console.log(JSON.stringify(this.faimSVC.getBIMdata()));
        this.http.post(environment.urlBase + urlPathConsts.saveDesign, data).subscribe((res: any) => {
            const data = JSON.stringify(res);
            console.log(res);

        }, (err: any) => {
            console.log('An error occurred:', err.error.no);
        });
        */

    }

    scaleDesign(event: WheelEvent) {
        // console.log('mouse wheeling');
        event.preventDefault();
        const flag = event.deltaY > 0 ? 1.0 : -1.0;

        let value = 0.01 * flag + Paper.view.zoom;
        if (value > 2.2) {
            value = 2.2;
        }

        if (value < 0.5) {
            value = 0.5;
        }

        const vals = 141 - (value - 0.5) / 1.7 * 141;
        // converting scale value to main components
        const newcontent = document.getElementById('zoomsliderbar');
        const slided = document.getElementById("slideACtive");
        if (newcontent && slided) {
            newcontent.style.left = vals.toString() + 'px';
            slided.style.width = vals.toString() + 'px';
        }
        Paper.view.zoom = value;
    }

    setFocus() {
        document.getElementById('myInput').focus();
    }

    loseFocus() {
        document.getElementById('myInput').blur();
    }

    startDrawWall() {
        if (this.wrapper_ !== null) {
            (<DrawHouseLayoutWrapper>this.wrapper_).initActivatedPoints();
        }
        const tool = new Tool.DrawHouseLayoutTool(this, <DrawHouseLayoutWrapper>this.wrapper_);
        this.setTool(tool);
    }

    onRefreshScene(): (refreshProperty: any) => void {
        return (refreshProperty: any) => {
            if (this.wrapper_ instanceof DefaultWrapper) {
                const wrapper = <DefaultWrapper> this.wrapper_;
            }
        }
    }


    //画布放大缩小
    onZoomHappened(): (zoomlevel: any) => void {

        //    Paper.view.zoom = zoomlevel;
        return (zoomlevel: any) => {
            console.log('画布布尔值：', zoomlevel);
            const currentZoom = Paper.view.zoom;
            console.log('当前缩放值:', currentZoom);
            //按钮缩放
            let zoomTargeValue = ( 1 + zoomlevel ) * currentZoom;

            if (zoomTargeValue > 2.2) {
                zoomTargeValue = 2.2;
            }

            if (zoomTargeValue < 0.5) {
                zoomTargeValue = 0.5;
            }

            const vals = 141 - (zoomTargeValue - 0.5) / 1.7 * 141;
            // converting scale value to main components
            const newcontent = document.getElementById('zoomsliderbar');
            const slided = document.getElementById('slideACtive');
            if (newcontent && slided) {
                newcontent.style.left = vals.toString() + 'px';
                slided.style.width = vals.toString() + 'px';
            }


            Paper.view.zoom = zoomTargeValue;
        }
    }


    /**
     * 绘制模式发生变化时的响应
     */
    onDrawActionChanged(): (drawAction: string) => void {
        return (drawAction: string) => {
            if (this.wrapper_ === null) {
                this.informHouselayoutType(drawAction, 0);
                return;
            }

            let bresult = false;

            if (this.wrapper_ instanceof DrawHouseLayoutWrapper) {
                const wrapper = <DrawHouseLayoutWrapper> this.wrapper_;

                if (!DrawHouseLayoutWrapper.wallTypeSet.has(drawAction)) {
                    bresult = false;
                } else {
                    bresult = true;
                    const result = this.wrapper_.setCurrentWallType(drawAction);
                    const tool = <DrawHouseLayoutTool>this.tool_;
                    tool.tryRenderTipInfo();
                }
            }

            if (this.wrapper_ instanceof DefaultWrapper) {
                const wrapper = <DefaultWrapper> this.wrapper_;
                if (DrawHouseLayoutWrapper.wallTypeSet.has(drawAction)) {
                    bresult = true;
                    this.changeToDrawMode(drawAction);
                } else if (drawAction === 'addOpening') {
                    bresult = true;
                    this.changeToDragMode('opening_door');

                }
            }

            const nresult = (bresult) ? 1 : 0;
            this.informHouselayoutType(drawAction, nresult);
        }
    }


    //线段属性修改刷新页面
    LineTypeChanged(): (object: any) => void {
        return (object: any) => {
            if (this.wrapper_ instanceof DrawHouseLayoutWrapper) {
                //  const wrapper = <DrawHouseLayoutWrapper> this.wrapper_;
                //  const tmpwall = wrapper.currentWall();
                //  tmpwall.updatePath();


            }


        }

    }

    // Modifying: 1. adding process: result of select operation
    onDrawObjectSeclected(): (objectName: string) => void {
        return (objectName: string) => {
            /// 选择了创建新的实体，则隐藏之前实体属性
           // this.informPropertyInfo(null);

            if (this.wrapper_ === null) {
                return;
            }

            if (!(this.wrapper_ instanceof BaseDragItemWrapper)) {
                if (!(this.wrapper_ instanceof DefaultWrapper)) {
                    return;
                }

                const tmpWrapper = this.wrapperService.getDragItemWrapper();
                const tool = new BaseDragItemTool(this, tmpWrapper);
                this.setTool(tool);

            }
            this.setItem(objectName);
        }
    }

    sceneActionOccurred(action: string) {
        // this.drawHouseLayoutService.postSceneActionOccurred(action);
        const message = new Message('sceneActionOccured', action);
        this.drawHouseLayoutService.postMessage(message);
    }

    onGenerateOuterWall(bGenerate: boolean) {

        if (this.wrapper_ === null) {
            return;
        }

        if (!(this.wrapper_ instanceof DefaultWrapper)) {
            /// 允许在添加门洞后的绘图状态下绘制外墙，此时首先要恢复为default模式
            if (this.wrapper_ instanceof DrawHouseLayoutWrapper) {
                // 刚画完一个房间， 而没有绘制任何新的墙壁时
                if (this.wrapper_.haveJustFinishedRoom()) {
                    this.changeToDefaultMode();
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        const wrapper = <DefaultWrapper> this.wrapper_;

        if (bGenerate) {
            // 在wrapper中处理外墙的逻辑已经被弃用，生成/删除外墙的操作由houselayout自己维护
            const addwallaction = new LayoutOuterWallAddAction(this);
            const msg = new Message(DrawHouseLayoutService.ADD_ACTION, addwallaction);
            this.drawHouseLayoutService.postMessage(msg);
        } else {
            //   wrapper.eliminateOuterWalls();
            const delwalAction = new LayoutOuterWallDeleteAction(this);
            const msg = new Message(DrawHouseLayoutService.ADD_ACTION, delwalAction);
            this.drawHouseLayoutService.postMessage(msg);
        }
    }

    /**
     * 发送当前画布状态，
     * 通知相关控件更新
     * @param bfinished
     */
    informDrawStatus(bfinished: ENUM_DrawStatus) {
        this.informHouselayoutType('roomdrawed', bfinished, 'roomdrawed');
    }

    /**
     * @function 改变删除外墙，生成外墙按钮的可点击状态
     * @param wallallowedinfo
     */
    changeWallEnable(wallallowedinfo: string) {
        if (null !== this.wrapper_) {
            if ((this.wrapper_ instanceof DefaultWrapper)) {
                const wrapper = <DefaultWrapper> this.wrapper_;
                if (!(wrapper.outwallGenerated()) && wallallowedinfo === '生成外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                } else if (wrapper.outwallGenerated() && wallallowedinfo === '拆除外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                } else if (wallallowedinfo !== '生成外墙' && wallallowedinfo !== '拆除外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                }
            } else if ((this.wrapper_ instanceof DrawHouseLayoutWrapper)) {
                const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
                if (!(wrapper.isDrawing()) && wallallowedinfo === '生成外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                } else if (!wrapper.isDrawing() && wallallowedinfo === '拆除外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                } else if (wallallowedinfo !== '生成外墙' && wallallowedinfo !== '拆除外墙') {
                    this.informHouselayoutType(wallallowedinfo, 1, 'wallgenerating');
                }

            } else if ((this.wrapper_ instanceof BaseDragItemWrapper)) {


            }
        }

    }

    //确定恢复和撤销按钮的状态
    getStepButttonInfo() {
        const hasNext = this.actionManagerService.houseLayoutActionManager().hasNext();
        const hasPrev = this.actionManagerService.houseLayoutActionManager().hasPrev();
        let result = null;
        if (hasPrev === true && hasNext === true) {
            result = '全部激活';
        } else if (hasPrev === false && hasNext === true) {
            result = '激活恢复按钮';

        } else if (hasPrev === true && hasNext === false) {
            result = '激活撤销按钮';
        } else if (hasPrev === false && hasNext === false) {
            result = '无法点击';
        }
        return result;

    }

    //通过状态给按钮组件发送对应消息
    changeStepButtonEnable(stepButttonInfo: string) {
        if (null !== this.wrapper_) {
            if ((this.wrapper_ instanceof DrawHouseLayoutWrapper)) {
                const wrapper = <DrawHouseLayoutWrapper> this.wrapper_;
                if (stepButttonInfo === '无法点击') {
                    const statusArry = new Array<boolean>();
                    statusArry.push(false);
                    statusArry.push(false);
                    this.informHouselayoutType(stepButttonInfo, statusArry, 'stepButtonStatus');
                } else if (stepButttonInfo === '激活撤销按钮') {
                    const statusArry = new Array<boolean>();
                    statusArry.push(true);
                    statusArry.push(false);
                    this.informHouselayoutType(stepButttonInfo, statusArry, 'stepButtonStatus');
                } else if (stepButttonInfo === '激活恢复按钮') {
                    const statusArry = new Array<boolean>();
                    statusArry.push(false);
                    statusArry.push(true);
                    this.informHouselayoutType(stepButttonInfo, statusArry, 'stepButtonStatus');
                } else if (stepButttonInfo === '全部激活') {
                    const statusArry = new Array<boolean>();
                    statusArry.push(true);
                    statusArry.push(true);
                    this.informHouselayoutType(stepButttonInfo, statusArry, 'stepButtonStatus');
                }
            }
        }
    }

    changeToDefaultMode(roomdrawed = false) {
        this.setTool(null);
        this.informHouselayoutType('none', 0);
    }


    //BaseEnyity为null时发送清空消息 否则根据实体响应对应消息
    responseObject(BaseEnyity: any) {
        if (BaseEnyity === undefined) {
            return;
        }

        if (BaseEnyity === null) {
            this.informActionInfo(null);
           // this.informPropertyInfo(null);
            this.informStyleInfo(null);
            return;
        }

        this.informActionInfo(BaseEnyity);
        this.informPropertyInfo(BaseEnyity);
        this.informStyleInfo(BaseEnyity);
    }

    /**
     * @function 用于向属性组件发送当前实体信息
     * @param dragEntity
     */
    informPropertyInfo(dragEntity: any) {
        if (dragEntity === null) {
            const objinfo = new Array<any>();
            objinfo.push('none');
            objinfo.push('none');
            const message1 = new Message('sceneObjectSelected', objinfo);
            this.drawHouseLayoutService.postMessage(message1);
            return;
        }

        const info = dragEntity.showEntityInfo();

        /// 设置配置项来对应实体类型和前端component对应关系

        const objinfo = new Array<any>();
        objinfo.push(info);
        objinfo.push(dragEntity);


        const message1 = new Message('sceneObjectSelected', objinfo);
        this.drawHouseLayoutService.postMessage(message1);


    }

    /**
     * @function 向main组件发送当前选中元素，以用于控制显示控件组的位置
     * @param dragEntity
     */
    informActionInfo(dragEntity: any) {
        if (dragEntity === null) {
            const objinfo = new Array<any>();
            objinfo.push(false);
            objinfo.push('none');
            const message = new Message('actionButton', objinfo);
            this.drawHouseLayoutService.postMessage(message);
            return;
        }

        /// 通过位置显示操作栏
        const objinfo = new Array<any>();
        objinfo.push(true);
        objinfo.push(dragEntity);
        const message = new Message('actionButton', objinfo);
        this.drawHouseLayoutService.postMessage(message);


    }


    /**
     * @function 向render2d组件发送当前选中元素，以用于更改选中模型样式
     * @param dragEntity
     */
    informStyleInfo(dragEntity: any) {
        if (dragEntity === null) {
            const objinfo = new Array<any>();
            objinfo.push("none");
            const message = new Message('changestyle', objinfo);
            this.drawHouseLayoutService.postMessage(message);
            return;
        }
        const objinfo = new Array<any>();
        objinfo.push(dragEntity);
        const message = new Message('changestyle', objinfo);
        this.drawHouseLayoutService.postMessage(message);
        // this.designService.getDragItemWrapper().gethouselayout()
    }

    onSwitchChildComponents(): (object: any) => void {
        return (object: any) => {
            const mainStatus = object[0];
            const leftStatus = object[1];
            const rightStatus = object[2];
            this.leftSideBarComponent_.disabled_ = leftStatus;
            this.maincomponent_.disabled_ = mainStatus;
            this.rightSideBarComponent_.disabled_ = rightStatus;
            // this.maincomponent_.
        }
    }

    /**
     * 翻转当前选中实体一次
     */
    OnFlipCurrentEntity(): (object: any) => void {
        return (object: any) => {
            if (this.wrapper_ instanceof DefaultWrapper) {
                const wrapper = <DefaultWrapper> this.wrapper_;

                const targetEntity = object[0];
                if (targetEntity instanceof Opening) {
                    const preinfo = targetEntity.shallowclone();
                    targetEntity.flip();

                    const modify = new OpeningModifyAction(preinfo, targetEntity);
                    const modifyMsg = new Message(DrawHouseLayoutService.ADD_ACTION, modify);
                    this.drawHouseLayoutService.postMessage(modifyMsg);
                }

            }
        }
    }

    /**
     * 根据当前数据状态，设置对应Tool，控件的状态
     */
    OnDetectToolStatus(): (object: any) => void {
        return (object: any) => {
            // 判断数据对应的绘图状态
            const candraw = this.designService.getDesign().houseLayout().outwallGenerated();
            if (this.wrapper_ instanceof DrawHouseLayoutWrapper) {
                const wrapper = this.wrapper_;
                if (wrapper.isDrawing()) {
                    return;
                }
            }
            const tmpWrapper = this.wrapperService.getDrawHouseLayoutWrapper();


            const tool = new DrawHouseLayoutTool(this, tmpWrapper);
            tool.informToClearAux();


            // 确保tool准确就绪（新建DefaultTool）
            this.changeToDefaultMode();

            //Begin: 通知相应控件状态就绪
            //1. 是否切换至绘图工具
            // 如是，当前是否能绘制墙体,还是能绘制门洞
            //2. 生成外墙/拆除外墙的状态

            //切换导航栏状态
            const navMsgInfo = [candraw];
            const navMsg = new Message(DrawHouseLayoutService.SWITCH_NAVS, navMsgInfo);
            this.drawHouseLayoutService.postMessage(navMsg);

            //End

        }
    }

    OnInitActivatePoints(): (object: any) => void {
        return (object: any) => {
            if (this.wrapper_ === null || !(this.wrapper_ instanceof DrawHouseLayoutWrapper)) {
                return;
            }

            const wrapper = <DrawHouseLayoutWrapper>this.wrapper_;
            wrapper.initActivatedPoints();
        }
    }

    //选中样式
    changeSelectStyle(): (object: any) => void {
        return (object: any) => {
            const houselayout = this.wrapperService.getDragItemWrapper().gethouselayout();
        }
    }

    /**
     * 切换图层
     * 只记录管理图层有关的数据
     * 这个数据对应（决定）图元被添加到scene2D时的图层名称
     */
    switchLayers(): (object: any) => void {
        return (object: any) => {
            this.currentLayerStage = object[1];
        }
    }

    showLayerOnly(): (object: any) => void {
        return (object: any) => {
            this.scene_.setLayerSelected(object[1]);
        }
    }

    //


    /**
     * @function 对发送消息函数的封装
     * @param layoutype
     * @param result
     * @param messagetype
     *
     */
    informHouselayoutType(layoutype = 'none', result: any, messagetype = 'dragStatusSelected') {
        const obj = new Object();
        obj['id'] = layoutype;
        obj['result'] = result;
        const message1 = new Message(messagetype, obj);
        this.drawHouseLayoutService.postMessage(message1);
    }

    changeToDrawMode(wallType: string) {

        const tmpWrapper = this.wrapperService.getDrawHouseLayoutWrapper();
        tmpWrapper.setCurrentWallType(wallType);
        const initedpoints = tmpWrapper.initActivatedPoints();


        const tool = new DrawHouseLayoutTool(this, tmpWrapper);
        this.setTool(tool);
        this.informHouselayoutType(wallType, 1);
    }

    changeToDragMode(item: string) {
        const tmpWrapper = this.wrapperService.getDragItemWrapper();
        const tool = new BaseDragItemTool(this, tmpWrapper);
        this.setTool(tool);
        this.setItem(item);

        if (item === 'opening_door') {
            this.informHouselayoutType('addOpening', 1);
        }
    }

    /**
     * @function 根据选择的实体切换到drag模式
     * @param selectedItem
     * @description
     */
    changeToDragModeWithObject(selectedItem: HouseLayoutDragEntity) {
        const tmpWrapper = this.wrapperService.getDragItemWrapper();
        //this.informActionInfo(selectedItem);
        tmpWrapper.setCurrentSelectedItem(selectedItem);

        if (selectedItem && selectedItem instanceof HouseLayoutFlag) {
            const curItemDragAuxGeometry = new HouselayoutFlagAuxEntityGeometry(selectedItem, tmpWrapper.gethouselayout());
            const dragAuxName = "dragAuxgeomerty";
            const dragAuxInfo = [dragAuxName, curItemDragAuxGeometry];
            const addGeoMsg = new Message(DrawHouseLayoutService.ADD_GEOMETRY, dragAuxInfo);
            this.getDrawHouselayoutService().postMessage(addGeoMsg);
        }

        const tool = new BaseDragItemTool(this, tmpWrapper);
        this.setTool(tool);
        //this.informPropertyInfo(selectedItem);

        this.informHouselayoutType('none', selectedItem, 'sceneObjectSelected');
    }

    //墙长度同步input
    changeWallLengthText(pointList: Array<number>) {
        //this.drawHouseLayoutService.setWallAction(pointList);
        const message = new Message('setWallSource', pointList);
        this.drawHouseLayoutService.postMessage(message);
    }

    //墙input显示与隐藏
    changeWallLengthTextShow(showTag: string) {
        const message = new Message('showWallTextSource', showTag);
        this.drawHouseLayoutService.postMessage(message);
    }

    //通过input修改最后一段墙
    onRefreshLastWall(): (wallTargetLength: string) => void {
        return (wallTargetLength: string) => {
            if (!(this.tool_ instanceof DrawHouseLayoutTool)) {
                return;
            }

            (<DrawHouseLayoutTool>this.tool_).drawWallByInput(wallTargetLength, this.drawHouseLayoutService);
        }
    }

    // 直接使用add action ，准备弃用
    directAddAction(object: any) {
        if (!(object instanceof BaseAction)) {
            return;
        }
        const action = <BaseAction> object;
        this.actionManagerService.houseLayoutActionManager().add(action);
        const hasNext = this.actionManagerService.houseLayoutActionManager().hasNext();
        this.sendWorkFlowStatus(true, hasNext);
    }

    onModifyHouseLayout(): (object: any) => void {
        return (object: any) => {
            const preEntity = object[0];
            const currentEntity = object[1];

            if (preEntity instanceof Opening && currentEntity instanceof Opening) {
                // Opening具备可变换的特性，则其自身提供一个检查并必要时返回变换后实体对象的方法
                const resultPreEntity = preEntity.CheckTypeTransform();
                const resultEntity = currentEntity.CheckTypeTransform();
                const openingModify = new OpeningModifyAction(preEntity, resultEntity);
                const modifyMsg = new Message(DrawHouseLayoutService.ADD_ACTION, openingModify);
                this.drawHouseLayoutService.postMessage(modifyMsg);

            } else if (preEntity instanceof HouseLayoutFlag && currentEntity instanceof HouseLayoutFlag) {
                const flagModify = new FlagModifyAction(preEntity, currentEntity);
                const modifyMsg = new Message(DrawHouseLayoutService.ADD_ACTION, flagModify);
                this.drawHouseLayoutService.postMessage(modifyMsg);
            }


        }
    }

    // 当添加动作时的处理
    onAddAction(): (object: any) => void {
        return (object: any) => {
            if (!(object instanceof BaseAction)) {
                return;
            }
            const action = <BaseAction> object;
            this.actionManagerService.houseLayoutActionManager().add(action);
            const hasNext = this.actionManagerService.houseLayoutActionManager().hasNext();
            this.sendWorkFlowStatus(true, hasNext);
            /// Begin: test code
            // this.scene_.switchToLayer('none');
            /// End: test code
        }
    }

    // 当上一步的时候处理
    onUndo(): (object: any) => void {
        return (object: any) => {
            const morePreAllowed = this.actionManagerService.houseLayoutActionManager().undo();
            const moreNextAllowed = this.actionManagerService.houseLayoutActionManager().hasNext();
            // 接下来或者已经不能再进行上一步时发送消息

            this.sendWorkFlowStatus(morePreAllowed, moreNextAllowed);
        }
    }

    // 当下一步的时候处理
    onRedo(): (object: any) => void {
        return (object: any) => {
            const moreNextAllowed = this.actionManagerService.houseLayoutActionManager().redo();
            const morePrevAllowed = this.actionManagerService.houseLayoutActionManager().hasPrev();
            this.sendWorkFlowStatus(morePrevAllowed, moreNextAllowed);

        }
    }

    /**
     * @function 用来响应消息，在绘图组件加载的时候让其获知当前可用的绘图工具
     */
    onAskStaus(): (object: any) => void {
        return (object: any) => {
            // 根据是否有多余激活点，判断能否进入画线状态
            if (this.wrapper_ === null) {
                return;
            }
            const tmpWrapper = this.wrapperService.getDrawHouseLayoutWrapper();
            if (tmpWrapper === null) {
                return;
            }
            // 查找激活点信息，并获取激活点信息
            const existActivatePoint = tmpWrapper.initActivatedPoints();
            if (existActivatePoint) {
                this.informDrawStatus(ENUM_DrawStatus.STATUS_NOT_DEFINED);
            } else {
                const roomnum = tmpWrapper.getHouseLayout().roomNum();
                const tmproomnum = tmpWrapper.getHouseLayout().tmpRoom().length;
                if (roomnum === 0 && tmproomnum === 0) {
                    this.informDrawStatus(ENUM_DrawStatus.STATUS_DRAW_READY);
                } else {
                    this.informDrawStatus(ENUM_DrawStatus.STATUS_ROOM_ALLCONNECTED);
                }

            }

        }
    }

    // 清空选中样式
    clearSelectedStyle(): (object: any) => void {
        return (object: any) => {
            this.responseObject(null);
        }
    }

    // 获取撤销，恢复按钮的可点击状态
    sendWorkFlowStatus(prev: any, next: any) {
        const obj = {} as any;
        obj.id = Math.random().toString();
        obj.preEnabled = prev;
        obj.nextEnabled = next;

        const message = new Message(DrawHouseLayoutService.STEP_STATUSS, obj);
        this.drawHouseLayoutService.postMessage(message);

        const wrapp = this.wrapperService.getDefaultWrapper();
        if (wrapp.outwallGenerated()) {
            // this.onGenerateOuterWall(true);
        } else {
            // this.onGenerateOuterWall(false);
        }
    }

    /**
     * 添加图元时的处理
     */
    onAddGeometry(): (object: any) => void {
        return (object: any) => {
            const name = <string>object[0];
            const geometry = <BaseEntityGeometry> object[1];
            geometry.setLayerStage(this.currentLayerStage);
            this.scene_.addObject(name, geometry);
        }
    }

    /**
     * 删除图元时的处理
     */
    onRemoveGeometry(): (object: any) => void {
        return (object: any) => {
            const name = <string> object[0];
            this.scene_.removeObject(name);
        }
    }


    /**
     * paper  刷新时的处理
     * 初始化激活点
     */
    initActivatedPoints(): boolean {
        const wrapper = this.wrapperService.getDrawHouseLayoutWrapper();
        if (wrapper === null) {
            return false;
        }

        return wrapper.initActivatedPoints();
    }

    /**
     * @function 给予drawHouseLayoutService信息
     */
    onPaperFrame(): () => void {
        return () => {
            this.scene_.render();
        }
    }

    getDrawHouselayoutService() {
        return this.drawHouseLayoutService;
    }

    getMsgManager() {
        return this.msgManager;
    }

    /**
     * 找出包含几何体的元素
     * @param item
     */
    getEntityByItem(item: Item): BaseEntity {
        const result = this.scene_.getObject(item);
        return this.scene_.getObject(item);
    }

    protected setItem(name: string) {
        if (this.wrapper_ === null || !(this.wrapper_ instanceof BaseDragItemWrapper)) {
            return;
        }
        const wrapper = <BaseDragItemWrapper> this.wrapper_;
        const item = wrapper.createItem(name);
        if (item === null) {
            return;
        }

        const itemGeo = HouseLayoutGeometryFactory.CreateGeometry(item);
        if (itemGeo !== null) {
            const name = item.showEntityInfo() + item.id().toString();
            this.scene_.addObject(name, itemGeo);
        }


        if (wrapper.doSelectedItem()) {
            const selectedItem = wrapper.currentSelectedItem();
            const name = selectedItem.showEntityInfo() + selectedItem.id().toString();
            this.scene_.removeObject(name);
        }

        wrapper.setCurrentSelectedItem(<HouseLayoutDragEntity>item);
    }

    /**
     * 处理弹窗显示（我的户型、搜索户型）
     * @returns {(popType:string)=>undefined}
     */
    openPopPlane(): (popInfo: any) => void {
        return (popInfo: any) => {
            const name = <string> popInfo[0];
            switch (name) {
                case 'MyHouseLayout':
                    this.showPopPlane.isShowMyHouselayout = true;
                    break;
                case 'DetailEdit':

                    this.showPopPlane.isShowDetailEdit = true;
                    if (popInfo.length < 2) {
                        return
                    }
                    this.selectHouselayoutNo = popInfo[1];
                    break;
                case 'SearchHouselayout':
                    this.showPopPlane.isShowSearchBar = true;
                    break;
                case 'SearchHouselayout':
                    this.showPopPlane.isShowSearchBar = true;


                    break;
                default:
                    break;
            }
        }
    }

    @HostListener('wheel', ['$event'])
    onMousewheel(event) {
            console.log(234234);
            this.scaleDesign(event);
            this.responseObject(null);
    }
}
