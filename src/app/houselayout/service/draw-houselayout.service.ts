import {Injectable} from '@angular/core'
import {Design, HouseLayout} from '../entity/entity'
import { Subject } from 'rxjs/Subject'
import {BaseEntity} from '../entity/entity'
import {Point } from 'paper'

import {BaseMessageService, MessageManagerService} from '../service/hsservice'

@Injectable()
export class DrawHouseLayoutService extends BaseMessageService {

    static readonly id = 'drawHouseLayout';

    // 墙标地标等被选中添加到设计中
    static readonly DRAG_OBJECT_SELECTED = 'dragObjectSelected';

    // 控制缩放的滑块移动
    static readonly SLIDER = 'slider';

    // 绘制墙体的动作发生改变
    static readonly DRAW_ACTION_CHANGED = 'drawActionChanged';

    // 刷新场景
    static readonly REFRESH_SCENE = 'refreshScene';

    // 接收最后一面墙长度设置
    static readonly SET_SINGLE_WALL_SOURCE = 'setSingleWallSource';

    // 滚轮缩放
    static readonly SCROLL_ZOOM = 'scrollZoom';


    // 线段属性修改
    static readonly LINE_TYPE_CHANGED = 'LineTypeChanged';

    // 添加动作
    static readonly ADD_ACTION = 'addAction';

    // 修改画布实体， 很多组件需要提交数据修改请求
    static readonly ModifyEntityIn_HouseLayout = 'ModifyEntityIn_HouseLayout';

    // undo
    static readonly UNDO = 'undo';

    // redo
    static readonly REDO = 'redo';

    // 发送撤销，恢复动作的可执行状态
    static readonly  STEP_STATUSS= 'stepStatus';

    // 添加图元
    static readonly ADD_GEOMETRY = 'addGeometry';

    // 移除图元
    static readonly REMOVE_GEOMETRY = 'removeGeometry';

    // left bar 户型绘制控件加载时，用此消息询问绘图状态
    static readonly  ASK_LAYOUTDRAWSTATUS = 'asklayoutdrawstatus';

    //清空状态
    static readonly  CLEAR_SELRCT = 'clearSelect';

    //样式清除
    static readonly  CHANGE_STYLE = 'changestyle';

    // 切换图层
    static readonly SWITCH_LAYER = 'switchlayers';

    // 更新激活点
    static readonly INIT_ACTIVATEDPOINTS = 'initactivatedpoints';

    // rootComponent根据当前数据状态，准备绘图工具
    static readonly DETECT_TOOL_STATUS = 'detect_tool_status';

    // 切换导航栏的可点击状态()
    static readonly SWITCH_NAVS = 'switch_navigation';

    // （依次）切换当前选中实体的指向
    static readonly FLIP_CURRENT_ENTITY = 'FLIP_CURRENT_ENTITY';

    static readonly SWITCH_CHILDCOMPONENTS = 'switch_child_components';
    // DEBUG TOOL
    static readonly SHOWCURLAYERONLY = 'showcurlayeronly';

    // 绘制墙体时的贴近距离
    static readonly DRAWROOM_ATTACH_DISTANCE = 5;

    // 打开我的户型弹窗
    static readonly OPEN_POP_PLANE = 'openPopPlane';

    // Trigger 3D Render
    static readonly TRIGGER_3D_RENDER = 'TRIGGER_3D_RENDER';

    constructor(protected messageManager: MessageManagerService ) {

        super(messageManager);
        this.id_ = DrawHouseLayoutService.id;
        this.register();
    }
}






