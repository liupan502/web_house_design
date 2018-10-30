import { InnerWall } from './../entity/inner-wall';
import {BaseWrapper, BaseHouseLayoutWrapper} from './wrapper';
import {BaseEntity, Design, Opening, HouseLayoutDragEntity, AuxilaryRect, FlagFactory, Room,
    HouseLayout, DoorwayFlag, HouseLayoutFlag} from '../entity/entity'
import {Point as PaperPoint, Path, Item} from 'paper'
import {Point, Segment, Line} from '../../geometry/geometry'
import { DrawHouseLayoutService, BaseMessageService,
    MessageManagerService, Message} from '../service/hsservice'
import {OpeningAddAction, OpeningDeleteAction , OpeningModifyAction,
    FlagAddAction, FlagDeleteAction, FlagModifyAction} from '../action/action'

import {HouseLayoutGeometryFactory, BaseEntityGeometry, LinemarkerEntityGeometry} from '../entity-geometry/entity-geometry'


export class JSonOpening {
    infos_: Array<Object>;

    constructor (inputs: Array<Opening>) {
        this.infos_ = new Array<Object>();

        for (let i = 0; i < inputs.length; i++) {
            const thisobj = new Object(inputs[i]) ;
            const attachedrms = thisobj['connectedRooms_'];
            thisobj['connectedRooms_'] = null;
            thisobj['connectedRooms_'] = new Array<number>();

            for (let j = 0; j < attachedrms.length; j++) {
                thisobj['connectedRooms_'].push(attachedrms[j].id_);
            }

            this.infos_.push(thisobj);

        }
    }
}

export class Jsoncomplexset {
    infos_: Array<Object>;
    infoswall_: Array<Segment>;

    constructor (inputs: Set<Array<any>>) {
        this.infos_ = new Array<Object>();
        this.infoswall_ = new Array<Segment>();
        const tmparray = Array.from(inputs);
        for (let i = 0; i < tmparray.length; i++) {
            const thisobj = (tmparray[i][0]);
            const attachedrms = thisobj['connectedRooms_'];
            thisobj['connectedRooms_'] = null;
            thisobj['connectedRooms_'] = new Array<number>();

            for (let j = 0 ; j < attachedrms.length; j++) {
                thisobj['connectedRooms_'].push(attachedrms[j].id_);
            }
            this.infos_.push(thisobj);
            this.infoswall_.push(<Segment>(tmparray[i][1]));
        }
    }
}

export class BaseDragItemWrapper extends  BaseHouseLayoutWrapper{

    protected currentSelectedItem_: HouseLayoutDragEntity;


    /// a swapper for condition like
    /// 1： currentSelectedItem_被clone出给modifyingItem_, 为了向类似moveProcess这类应用屏蔽这一clone动作，modifyingItem_
    /// 会再赋给currentSelectedItem_.此时保留原有状态给preActionItem_
    protected preActionItem_: HouseLayoutDragEntity;

    // Begin: Added by fangchen 20170828
    // modified in 20170928  array?
    // protected broone_: AuxilaryRect;
    // protected brotwo_: AuxilaryRect;
    protected rangeAuxHelper_: Array<AuxilaryRect>;
    protected tmpObjRemoveHelper_: Array<string>;
    protected tmpObjAddListener_: Map<string, BaseEntityGeometry>;
    // End
    protected backup_: Object;
    protected backuphl_: HouseLayout;
    protected backuprooms_: Array<Room>;

    protected objLastPosition_: Point;

    protected drawhouseService_: DrawHouseLayoutService;
    protected msgManager_: MessageManagerService;

    constructor(design: Design) {
        super(design);
        this.currentSelectedItem_ = null;

        this.preActionItem_ = null;

        this.rangeAuxHelper_ = new Array<AuxilaryRect>();
        this.tmpObjRemoveHelper_ = new Array<string>();
        this.tmpObjAddListener_ = new Map<string, BaseEntityGeometry>();

        this.backuprooms_ = new Array<Room>();
        this.backup_ = null;
        this.backuphl_ = null;
        this.objLastPosition_ = null;
    }

    gethouselayout():HouseLayout{
        return this.design_.houseLayout();
    }

    mapReplacerWithOpening(key, value) {
        if (value instanceof Set) {
            const arrays = Array.from(value);
            let needmore = false;
            for (let i = 0; i < arrays.length; i++) {
                if (arrays[i] instanceof Opening) {
                    needmore = true;
                    break;
                }
            }

            if (needmore) {
                const hi = new JSonOpening(arrays);
                return  hi;
            } else {
                return arrays;
            }
        }

        if (value instanceof Opening) {
            const thisobj = new Object(value);
            const attachedrms = thisobj['connectedRooms_'];
            thisobj['connectedRooms_'] = null;
            thisobj['connectedRooms_'] = new Array<number>();

            for (let j = 0 ; j < attachedrms.length; j++) {
                if (attachedrms[j] instanceof Room) {
                    thisobj['connectedRooms_'].push(attachedrms[j].id_);
                }
            }

            return thisobj;
        }

        return value;
    }

    /**
     * 设置距离指示器对应的数据信息
     * @param lineArray 指示线
     * @param room 所关联房间
     */
    protected setAuxRange(lineArray: Array<Line>, room: Room, range: number) {
        const curNum = lineArray.length ;
        // 判断是创建还是更新
        if (this.rangeAuxHelper_.length !== curNum) {
            this.eraseaux();

            for (let i = 0; i < lineArray.length; i++) {
                const auxRect = new AuxilaryRect(lineArray[i].startPoint(),
                lineArray[i].endPoint(), range, room);
                auxRect.updateView();

                this.rangeAuxHelper_.push(auxRect);
                const strinfo = auxRect.showEntityInfo() + auxRect.id();
                const auxEntityGeometry = new LinemarkerEntityGeometry(auxRect);
                this.tmpObjAddListener_.set(strinfo, auxEntityGeometry);

            }
        } else {
            // 已有则直接更新, entity的更新会直接反馈到View上的渲染
            for (let i = 0; i < lineArray.length; i++) {

                if (lineArray[i].length() < 10) {
                    this.eraseaux();
                    break;
                }

                this.rangeAuxHelper_[i].setStartPoint(lineArray[i].startPoint());
                this.rangeAuxHelper_[i].setEndPoint(lineArray[i].endPoint());
                this.rangeAuxHelper_[i].setRangeWidth(range);
            }
        }
    }

    mapReplacer(key, value) {
        if (value instanceof Set) {
            const arrays =  Array.from(value);
            const testjson = JSON.stringify(arrays);

            let needmore = false;
            for (let i = 0; i < arrays.length; i++) {
                if (arrays[i] instanceof Array) {
                    needmore = true;
                }
            }

            if (needmore) {
                const hi = new Jsoncomplexset(value);
                return hi;
            } else {
                return arrays;
            }
            // of course you can separate cases to turn Maps into objects
        }

        if (value instanceof Function) {
            return '';
        }
        return value;
    }

    showHouseLayoutByJson() {
        if (null === this.backuphl_) {
            const infobj = this.design_.houseLayout();
            const objinfos = this.design_.houseLayout().toJSON();
            const strinfo = JSON.stringify(objinfos);
            const info = JSON.stringify(infobj, this.mapReplacerWithOpening);
            const objinfo = JSON.parse(strinfo);
            const houselayo = new HouseLayout().fromJSON(objinfo);
            this.backuphl_ = houselayo;
           // const data = new File([strinfo], 'helloworld.txt' , {type: 'text/plain;charset=utf-8'});
           // const datas = new Blob([strinfo], {type: 'text/plain;charset=utf-8'});
            // const filename = 'hello world.txt';
            // const disableAutoBOM = true;

            //filesinfo.saveAs(datas, filename, disableAutoBOM);
        } else {
        }


    }

    /**
     * 清除辅助线信息
     */
    eraseaux() {
        while (this.rangeAuxHelper_.length > 0) {
            const user = this.rangeAuxHelper_.pop();
            this.tmpObjRemoveHelper_.push(user.showEntityInfo() + user.id());
        }
        // this.updateView();
    }

    /**
     * 检查物体是否符合放置条件
     * @param paperPoint
     */
    checkCurrentItemAttached(paperPoint: PaperPoint): boolean {
        if (this.currentSelectedItem_ === null ) {
            return false;
        }


        // const point = new Point(paperPoint.x, paperPoint.y);
        const point = this.currentSelectedItem_.position();
        const array = this.design_.houseLayout().getNearestWall(point);
        const wall = (<InnerWall>array[0]).segment();
        const rooms = this.design_.houseLayout().rooms();

        // 取得对应房间
        const attachRoom = this.design_.houseLayout().getRoomByWall(wall);


        // 贴墙物体，找opening
        if (this.currentSelectedItem_.isAttachedToWall()) {
            if (wall !== null && (array[1] < (this.currentSelectedItem_.width() / 2.0 + 30))) {
                // 判断是否和房间其他opening重叠
                const testresult = false;
                if (testresult) {
                    return false;
                } else {
                return true;
                }
                // return true;
            }  else {
                return false;
            }
        } else {
            // 不贴墙物体 找flag
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].containsPoint(this.currentSelectedItem_.position())) {
                    /* this.currentSelectedItem_.initPath();
                    const testresult = attachRoom.entityOverLap(this.currentSelectedItem_);
                    this.currentSelectedItem_.destoryPath();

                    if(testresult) {
                        return false;
                    } else {
                        return true;
                    }*/
                    return true;
                }
           }
            return false;
        }
    }

    // always move(modify) currentSelectedItem , no need to change that
    tryMoveItemTo(paperPoint: PaperPoint): boolean {
        if (this.currentSelectedItem_ === null) {
            return true;
        }


        /// clone出一个快照给modifyingItem_
        this.photoCuritem();

        // 如果选中的单元是门洞并且外墙已经生成
        const entityinfo = this.currentSelectedItem_.showEntityInfo();
        const outerwall = this.design_.houseLayout().outerWall();


        if ((entityinfo === 'Opening' && null !== outerwall) || entityinfo === 'room') {
            return false;
        }

        const point = new Point(paperPoint.x, paperPoint.y);
        this.currentSelectedItem_.moveTo(point);
        // 根据实体逻辑和当前画布状态决定是否自适应的改变实体的状态信息（位置，宽度等)
        this.currentSelectedItem_.autoAdapt(this.design_.houseLayout(), point);

        if (this.currentSelectedItem_.isAttachedToWall()) {
            const array = this.design_.houseLayout().getNearestWall(point);
            const wall = array[0];
            if (wall !== null && (array[1] < (this.currentSelectedItem_.width() / 2.0 + 30))) {
                // 获取当前选择实体的顶点信息
                const wallseg = (<InnerWall>wall).segment();
                // 设定距离边缘的阈值
                const thresoldtoEdge = 10;
                const pl = new Point(0,0);
                const pr = new Point(0,0);
                const isOnline =  this.currentSelectedItem_.isOnline(wallseg,thresoldtoEdge,pl,pr);
                if (isOnline === true) {
                    const dis1 = pl.distanceTo(wallseg.startPoint());
                    const dis2 = pr.distanceTo(wallseg.startPoint());
                    const lineone = (dis1 > dis2) ?  new Line(wallseg.startPoint(), pr) : new Line(wallseg.startPoint(), pl);
                    const linetwo = (dis1 > dis2) ?  new Line(pl, wallseg.endPoint()) : new Line(wallseg.endPoint(), pr);
                    const linearray = new Array<Line>();
                    const curRoom = this.design_.houseLayout().getRoomByWall(wallseg);
                    linearray.push(lineone);
                    linearray.push(linetwo);

                    this.setAuxRange(linearray, curRoom, this.currentSelectedItem_.width());
                } else {
                    this.eraseaux();
                }
            } else {
                this.eraseaux();
                // this.updateView();
                this.currentSelectedItem_.setAllowToAdded(true);
            }
        } else {
            this.eraseaux();
        }

        return true;
    }

    nullCurItem() {
        if(this.currentSelectedItem_) {
            this.currentSelectedItem_.setIsDragged(false);
            this.currentSelectedItem_ = null;
        }
        this.preActionItem_ = null;
    }


    /**
     * 将item 添加到户型数据中，如果添加成功则将当前选中置为空，失败则不处理
     * @param paperPoint
     */
    tryAddItemToHouseLayout(paperPoint: PaperPoint): boolean {
        if (this.currentSelectedItem_ === null || this.currentSelectedItem_.allowToAdded() == false) {
            return;
        }

        const result = this.currentSelectedItem_.addToHouseLayout(this.design_.houseLayout());
        if (result) {
           // this.lastSelectedItem_ = this.currentSelectedItem_;
           this.currentSelectedItem_.setIsDragged(false);
           this.currentSelectedItem_ = null;
        }

        return result;
    }

    doSelectedItem(): boolean {
        return (this.currentSelectedItem_ !== null);
    }


    photoCuritem(): boolean {
        if ( this.preActionItem_ !== null) {
            // 已经做过拷贝，不需要重复执行
            return false;
        }
        if (this.currentSelectedItem_ === null) {
            return false;
        }
        this.preActionItem_ = this.currentSelectedItem_.shallowclone();
        return true;


    }


    sendDeletionAction(entityInfo: any) {
        if (this.drawhouseService_ === null) {
            return;
        }

        if (entityInfo !== null) {
            if (entityInfo instanceof Opening) {
                const actions = new OpeningDeleteAction(entityInfo);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
            } else if (entityInfo instanceof HouseLayoutFlag) {
                const actions = new FlagDeleteAction(entityInfo);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
            }
        }
    }

    sendModifyAction(prevEntity: any, curEntity: any) {
        if (this.drawhouseService_ === null) {
            return;
        }
        if (prevEntity !== null && curEntity !== null) {
            if (prevEntity instanceof Opening && curEntity instanceof Opening) {
                const actions = new OpeningModifyAction(prevEntity, curEntity);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
            } else if (prevEntity instanceof HouseLayoutFlag && curEntity instanceof HouseLayoutFlag) {
                const actions = new FlagModifyAction(prevEntity, curEntity);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
            }
        }
    }


    entityPostionedAction(drawhouseServices?: DrawHouseLayoutService, messagers?: MessageManagerService): boolean{
        if(drawhouseServices) {
            this.drawhouseService_ = drawhouseServices;
        }

        if (messagers) {
            this.msgManager_ = messagers;
        }

        if (this.currentSelectedItem_ === null || this.preActionItem_ === null) {
            // return false;
        }

        // 根据当前实体状态，判断发送哪一种action
        // 如果没有镜像，发送新增action
        // let actioned = false;
        // 如果没有前置信息, 不做任何处理，因为'add'也被认为是modifyaction
        // 因此没有前置信息，就没有action，do nothing

        // if (this.preActionItem_ === null) {
        //     // actioned = true;
        //  } else
        if (this.preActionItem_ !== null) {
            // 如果有镜像， 发送modifyaction
            if (this.preActionItem_ instanceof Opening && this.currentSelectedItem_ instanceof Opening) {

                const actions = new OpeningModifyAction(this.preActionItem_, this.currentSelectedItem_);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
             //   actioned = true;
            } else if (this.preActionItem_ instanceof HouseLayoutFlag && this.currentSelectedItem_ instanceof HouseLayoutFlag) {
                const actions = new FlagModifyAction(this.preActionItem_, this.currentSelectedItem_);
                const msg = new Message(DrawHouseLayoutService.ADD_ACTION, actions);
                this.drawhouseService_.postMessage(msg);
             //   actioned = true;
            }
        }

        // if (!actioned) {
        //    this.tryAddItemToHouseLayout((new Point(0, 0).toPaperPoint()));
        // }

        return true;
    }

    setCurrentSelectedItem(selectedItem: HouseLayoutDragEntity) {
        if(this.currentSelectedItem_ !== null) {
            this.currentSelectedItem_.setIsDragged(false);
        }
        this.currentSelectedItem_ = selectedItem;
        if (selectedItem != null) {
          this.currentSelectedItem_.setIsDragged(true);
          // 记录实体当前位置
          this.objLastPosition_  = this.currentSelectedItem_.position();
        }




    }

    currentSelectedItem(): HouseLayoutDragEntity{
        return this.currentSelectedItem_;
    }

    // 恢复实体到原有位置
    resumeSelObjectToOriPos(): Boolean {
        // 判断选中状态
        if (this.currentSelectedItem_ === null ) {
            return true;
        }

        if (this.preActionItem_ === null ) {

        } else {
            // 移动到非法地方放置（已经是added obj）
            // yeah, give me your datum pre. and goodbye to all the moving that have done
            this.currentSelectedItem_.shallowCopy(this.preActionItem_);
        }

        this.currentSelectedItem_.setIsDragged(false);
        this.preActionItem_ = null;
        this.currentSelectedItem_ = null;
    }

    /**
     * 删除当前选中的物体
     */
    removeCurrentSelectedItem() {
        // 从设计数据中删除当前物体
        if (!this.currentSelectedItem_.isTmp()) {
            this.currentSelectedItem_.removeFromHouseLayout(this.design_.houseLayout());
        } else {
        // 从临时数据中删除当前物体
            const keys = this.outSceneObject_.keys();
            for (const key in keys) {
                if (this.outSceneObject_[key] === this.currentSelectedItem_) {
                    this.outSceneObject_.delete(key);
                    break;
                }
            }
        }

        this.currentSelectedItem_.setIsDragged(false);
        this.currentSelectedItem_ = null;
    }

    /// 将需要渲染的临时对象汇报给Tool
    reportTmpObjAddInfo(): Map<string, BaseEntityGeometry> {
        const result = new Map<string, BaseEntityGeometry>();

        this.tmpObjAddListener_.forEach((value , key) =>{
            result.set(key,value);
            this.tmpObjAddListener_.delete(key);
        });

        return result;
    }

    /// 将需要删除的临时对象汇报给tool
    reportTmpObjRemoveInfo(): Array<string> {
        const result = new Array<string>();
        while(this.tmpObjRemoveHelper_.length > 0) {
            const popinfo = this.tmpObjRemoveHelper_.pop();
            result.push(popinfo);
        }

        return result;
    }
}
