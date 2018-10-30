import { BasePath } from './../../path/base-path';
import { BasePathFactory } from './../../path/path-factory';
import { ContentChild } from '@angular/core';
import { DoorwayFlag } from './../entity/houselayout-flag';
import { LinePath } from './../../path/line-path';
import { Vector2 } from 'three';
import {BaseWrapper} from './wrapper'
import {Design, BaseEntity, HouseLayout, AuxiliaryLine, AuxilaryPoints, Opening, InnerWall} from '../entity/entity'
import {Point as PaperPoint, Path} from 'paper'
import {Wall, Room} from '../entity/entity'
import {Line, Segment, Arc, Point, GeometryType, Rect, BaseGeometry} from '../../geometry/geometry'
import * as MathUtil from '../../math/math'
import {DrawHouseLayoutService, MessageManagerService, Message} from '../service/hsservice'
import {WallAddAction, WallDeleteAction, WallModifyAction} from '../action/action'



export class DrawHouseLayoutWrapper extends BaseWrapper {

    static readonly  wallTypeSet: Set<string> = new Set<string>(['line', 'arc','addByRoom']);
    
    protected tmpObject_: any;
    protected activatedPoints_: Array<Point>;
    

    protected currentWallType_: string;
    protected currentDrawCanDrop_: boolean;

    // to be deleted
    protected auxLine_: AuxiliaryLine;
    protected potentialine_: AuxiliaryLine;
    protected gridLine_: AuxiliaryLine;
    protected auxpoint_: AuxilaryPoints;
    // to be deleeted

    // 当前绘制的偏转角度
    protected roomAxisAngle_ = 0;

    // 当前绘制的房间的门洞关联信息
    protected roomRefOpening_: Opening;
    protected roomRefOpeningWall_: Segment;

    // Begin: to be deleted 
    protected isVTLinesNeedUpdate_: Boolean;
    // End

    // Begin: 便于在wrapper中处理add，modify，delete action
    protected drawHouseLayoutService_: DrawHouseLayoutService;
    // End 

    constructor(design: Design) {
        super(design);
       
        this.tmpObject_ = null;
        this.activatedPoints_ = new Array<Point>();
        this.currentWallType_ = 'line';
        this.roomRefOpening_ = null;
        this.roomRefOpeningWall_ = null;
        this.auxLine_ = null;
        this.potentialine_ = null;
        this.gridLine_ = null;
        this.auxpoint_ = null;
        this.drawHouseLayoutService_ = null;   
        this.currentDrawCanDrop_ = true;      
    }



    canbeConnected(point: Point) {
        const openings = this.getHouseLayout().openings();
        for(let i = 0; i < openings.length; i++) {
            if(openings[i].connectedRoomsNum() === 1) {
                const outerPointArray = openings[i].outerPoints();
                if(outerPointArray && outerPointArray.length === 2) {
                    if(outerPointArray[0].distanceTo(point) < 5 || outerPointArray[1].distanceTo(point) < 5) {
                        return true;
                    }                 
                }
            }
        }

        return false;
    }

    isDrawing(): boolean {
        if (this.getHouseLayout().tmpWall() === null) {
            return false;
        } else {
            return true;
        }
    }

    protected getInnerWallfromHouse():Array<InnerWall> {
        const houselayout = this.getHouseLayout();
        let result = new Array<InnerWall>();
        const rooms = houselayout.rooms();
        if(rooms && rooms instanceof Array) {
            for(let i = 0; i < rooms.length; i++) {
                const walls = rooms[i].walls();
                result = result.concat(walls);
            }
        }

        // const tmpRoom = houselayout.tmpRoom();

        // if(tmpRoom && tmpRoom instanceof Array) {
        //     const tmpRoomWall = Array.from(tmpRoom);
        //     result = result.concat(tmpRoomWall);
        // }

        return result;
    }

    checkPointDropable(point: PaperPoint): boolean{
        if(!this.currentDrawCanDrop_){
            return false;
        }        
        
        const startPoint = this.getStartPoint();
        
        const newpoint = new Point(point.x,point.y);

        /// 检查是否在其它房间内部
        const rooms = this.getHouseLayout().rooms();
        for(let i = 0; i < rooms.length; i++) {
            const outPoly = rooms[i].generateCheckingOuterWall();
            if(outPoly.contains(newpoint, false)) {
                return false; 
            }
            
        }

        if(startPoint && startPoint.distanceTo(newpoint) < 5){
            return true;
        }
        

        // 检查是否和其他墙壁相交 
        // 需要检查的相交线可能不止一条,但只要出现相交情况，即可说明不可画线（房间）
        const tmpCheckWalls = new Array<Segment>();  // 需要检查相交状态的临时数据
        const targetWalss = new Array<Segment>();   // 被检查的墙壁

        const roomWalls = this.getInnerWallfromHouse();
        const tmpRoomWalls =  this.getHouseLayout().tmpRoom();
        const tmpWall = this.getHouseLayout().tmpWall();
        
        for(let i = 0; i < roomWalls.length; i++) {
            targetWalss.push(roomWalls[i].segment());
        }

        // 设置需要检查的墙壁
        if(this.isRoomDrawMode()) {
            tmpCheckWalls.push(tmpWall.segment());
            for(let i = 0; i < tmpRoomWalls.length;i++) {
                tmpCheckWalls.push(tmpRoomWalls[i].segment());
            }

        } else if(this.isInSegmentDrawMode()) {
            const walls = this.getInnerWallfromHouse();
            const startWith = MathUtil.moveTowardsPoint(tmpWall.segment().startPoint(),newpoint,0.5);
            const tmpDodgeWall = new Line(startWith, newpoint);
            tmpCheckWalls.push(tmpDodgeWall);
            for(let i = 0; i < tmpRoomWalls.length;i++) {
                targetWalss.push(tmpRoomWalls[i].segment());
            }
        }


        for(let i = 0; i < tmpCheckWalls.length; i++) {
            for(let j = 0; j < targetWalss.length;j++) {
                const wallseg = tmpCheckWalls[i];
                const targetWallSeg = targetWalss[j];
                const tmpPath = BasePathFactory.CreatePath(wallseg);
                const wallPath = BasePathFactory.CreatePath(targetWallSeg);
                tmpPath.update();
                wallPath.update();

                const interSectResult = tmpPath.intersects(wallPath);
                

                tmpPath.removeSegments();
                wallPath.removeSegments();
                if(interSectResult === true) {
                    return false;
                }            
            }
        }
        


        ///make sure opening attached to this room


        return true;
    }
   

    /**
     * 非画墙状态下，检查是否靠近某个激活点，如果靠近返回该激活点
     * 画墙状态下，检查是否靠近当前绘制的房间的起点，如果靠近返回该起点
     * 检查当前被绘制的墙是否是接近竖直或水平， 如果接近，修改点数据使之
     * 成为绝对的竖直或者水平
     * 
     * 如果靠近激活点中的非房间起点， 说明绘图到达了门洞的角点，此时应该吸附
     * 剩下的事情交给houselayout在添加墙壁时自己判断 
     * @param paperPoint 
     */
    getAvailablePoint(paperPoint: PaperPoint): Point {
        // 检查点是否靠近端点
        let isNearPoint = false;
        let result: Point = null;
        const point = new Point(paperPoint.x, paperPoint.y);
        const houseLayout = this.getHouseLayout();

        // 非画墙状态下，检查是否靠近某个激活点，
        if (houseLayout.tmpWall() === null) {
            if (this.activatedPoints_ !== null) {
                for (let i = 0; i < this.activatedPoints_.length; i++) {
                    const distance = this.activatedPoints_[i].subtraction(point).length();
                    if (distance < 5) {
                        isNearPoint = true;
                        result = this.activatedPoints_[i].clone();
                        break;
                    }
                }
            }
        } else {
            if (houseLayout.tmpRoom().length > 2) {
                const firstWall = houseLayout.tmpRoom()[0];
                const startPoint = firstWall.segment().startPoint().clone();
                const distance = startPoint.subtraction(point).length();
                
                if(distance < 5) {
                    isNearPoint = true;
                    result = startPoint;                  
                }

                //如果有相邻opening，则寻找最佳吸附点     
                //不利用激活点，直接查找相邻房间的双起点
                const openings = this.getHouseLayout().openings();
                for(let i = 0; i < openings.length; i++) {
                    if(openings[i].connectedRoomsNum() === 1 && openings[i] instanceof DoorwayFlag) {
                        const outerPointArray = openings[i].outerPoints();
                        if(outerPointArray === null) {
                            continue;
                        }
                        const distanceA = (<Point>startPoint).distanceTo(outerPointArray[0]);
                        const distanceB = (<Point>startPoint).distanceTo(outerPointArray[1]);
                        const capturePoint = (distanceA > distanceB) ? outerPointArray[0] : 
                        outerPointArray[1];
                        const distanceTocapture = (<Point>capturePoint).distanceTo(point);
                        if(distanceTocapture < 5) {
                            isNearPoint = true;
                            result = <Point>capturePoint;
                        }
                    }
                }
                
            }
        }

        if (result !== null) {
            return result;
        }

        return point;
    }


    

    /**
     * 根据绘图模式，响应的在绘图点位置发生变化时更新绘图数据
     * @param current 
     */
    drawWalloperation(current: Point) {
        if(this.currentWallType_ === 'arc' || this.currentWallType_ === 'line') {
            this.getHouseLayout().tmpWall().segment().setEndPoint(current);
        } else if(this.currentWallType_ === 'addByRoom') {
            /// 更新临时房间中，其它线段的起点终点
            /// 房间起点
            /// 从房间起点，顺时针数的三面墙
            const firstalongClock = this.getHouseLayout().tmpRoom()[0];  
            const secondalongClock = this.getHouseLayout().tmpRoom()[1];  
            const thirdalongClock = this.getHouseLayout().tmpRoom()[2]; 
            const startPoint = firstalongClock.segment().startPoint();

            const offsetx = current.subtraction(startPoint).x;
            const offsety = current.subtraction(startPoint).y;

            


            const pointArray = MathUtil.formatRectDirectAndAngle(startPoint,current,this.roomAxisAngle_);
            
            //第二个角点
            const firstPointAlongClock = pointArray[1] ;//
            const secondPointAlongClock = pointArray[2] ;//             
            const thirdPointAlongClock =  pointArray[3] ;//

            firstalongClock.segment().setEndPoint(firstPointAlongClock);
            secondalongClock.segment().setStartPoint(firstPointAlongClock);
            secondalongClock.segment().setEndPoint(secondPointAlongClock);
            thirdalongClock.segment().setStartPoint(secondPointAlongClock);
            thirdalongClock.segment().setEndPoint(thirdPointAlongClock);

            this.getHouseLayout().tmpWall().segment().setStartPoint(thirdPointAlongClock);
            this.getHouseLayout().tmpWall().segment().setEndPoint(startPoint);
            

            const segarray = new Array<Segment>();
            segarray.push(firstalongClock.segment());
            segarray.push(secondalongClock.segment());
            segarray.push(thirdalongClock.segment());
            segarray.push(this.getHouseLayout().tmpWall().segment());

            if(this.roomRefOpening_){
                const corners = this.roomRefOpening_.outerPoints();
                for(let i = 0; i <4; i++) {
                    if(segarray[i].contains(corners[0]) && segarray[i].contains(corners[1])) {
                        this.currentDrawCanDrop_ = true;
                        return;
                    }
                }
                
                this.currentDrawCanDrop_ = false;
            } else {
                this.currentDrawCanDrop_ = true;
            }



        }

    }


    /**
     * 根据当前绘制模式绘制新的墙体
     * 
     * @param p1 
     * @param p2 
     */
    createNewWall(p1: Point, p2: Point): Array<InnerWall> {
        const wallArray = new Array<InnerWall>();

        if (this.currentWallType_ === 'line') {
           const wall =   new InnerWall(new Line(p1, p2));
           wallArray.push(wall);
           return wallArray;
        }

        if (this.currentWallType_ === 'arc') {
            const center = new Point((p1.x() + p2.x()) / 2.0, (p1.y() + p2.y()) / 2.0);
            const wall = new InnerWall(new Arc(p1, p2, center));
            wallArray.push(wall);
            return wallArray;
        }

        if (this.currentWallType_ === 'addByRoom') {
            const wall = new InnerWall(new Line(p1,p2));
            const wallseg1 = new InnerWall(new Line(p1,p2));
            const wallseg2 = new InnerWall(new Line(p1,p2));
            const wallseg3 = new InnerWall(new Line(p1,p2));
            wall.setIsTmp(false);   // 能让房间在拖动时直接显示长度标注
            wallseg1.setIsTmp(false);
            wallseg2.setIsTmp(false);
            wallseg3.setIsTmp(false);
            
            wallArray.push(wall);
            wallArray.push(wallseg1);
            wallArray.push(wallseg2);
            wallArray.push(wallseg3);

            return wallArray;
        }


        return null;
    }


    protected tryDrawFromPoints(paperPoint: PaperPoint): Point{
        // 检查激活点数据是否和当前绘图数据相符，如不相符进行修正
        this.checkActivatedPoints();
        
        const tmpPoint = new Point(paperPoint.x, paperPoint.y);
        let point = null;
        for (let i = 0; i < this.activatedPoints_.length; i++) {
            const distance = this.activatedPoints_[i].subtraction(tmpPoint).length();
            if  (distance < 5) {
                point = this.activatedPoints_[i];
                break;
            }
        }    

        return point;
    }

    protected isInSegmentDrawMode() : boolean {
        if(this.currentWallType_ === 'arc' || this.currentWallType_ === 'line') {
            return true;
        }

        return false;
    }

    protected isRoomDrawMode() :boolean{
        return this.currentWallType_ === 'addByRoom';
    }

    tryAdjustDrawRoomStartPos(availablePoint: Point): Point{
        const verticalWalls = new Array<Segment>();
        const horizonalWalls = new Array<Segment>();

        const findResult = this.findVecticalAndHorizonalWalls(horizonalWalls,verticalWalls);
        if(!findResult) {
            return null;
        }

        const result = new Point(availablePoint.x(),availablePoint.y());
        for(let i = 0; i < verticalWalls.length;i++) {
            const vWall = verticalWalls[i];
            if (Math.abs(vWall.startPoint().x() - availablePoint.x()) < 5) {
                result.setX(vWall.startPoint().x());
                break;
            }
        }

        for(let i = 0; i < horizonalWalls.length;i++) {
            const hWall = horizonalWalls[i];
            if(Math.abs(hWall.startPoint().y() - availablePoint.y()) < 5) {
                result.setY(hWall.endPoint().y());
                break;
            }
        }

        return result;
    }


    /**
     * 
     * @param point 鼠标位置
     * 根据鼠标位置尝试开始画新的墙, 
     * 如果按下的位置在激活点则可以开始开始画新墙, 返回激活点位置， 
     * 反之返回null
     */
    tryStartDrawWall(paperPoint: PaperPoint): Point {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpWall() !== null) {
            return null;
        }        

        let point: Point = null;

        
        if (houseLayout.tmpRoom().length === 0 && this.design_.houseLayout().roomNum() === 0) {
            // 绘制第一个点， 任何绘图模式的开始动作都是一样的
            point = new Point(paperPoint.x, paperPoint.y);

            // 将该点作为激活点加入进去
            this.clearActivatedPoints();
            this.activatedPoints_.push(point);
        } else {
            if(!this.activatedPoints_ || this.activatedPoints_.length === 0) {
                return null;
            }

            // 笔画模式(比较到点距离)
            if(this.isInSegmentDrawMode()){
                 point = this.tryDrawFromPoints(paperPoint);
            }

            // 房间模式(比较到线距离)
            if(this.isRoomDrawMode()){
                if(this.activatedPoints_.length !== 2){
                    return null;
                }
    
                // 找到最靠近的墙壁，以此确定辅助线显示的长度
                const nearinfo = this.getHouseLayout().getNearestWall(this.activatedPoints_[0]);
                const nearWall = <InnerWall>nearinfo[0];
                const midx = nearWall.segment().startPoint().x() /2.0 + nearWall.segment().endPoint().x() / 2.0;
                const midy = nearWall.segment().startPoint().y() / 2.0 + nearWall.segment().endPoint().y() / 2.0;
                const midpoint = new Point(midx, midy);
                
                //统一通过curAuxObject实现对贴墙线的查找
                const auxinfo = this.currentAuxObject();
                if(!auxinfo || !(auxinfo instanceof Array)){
                    return null;
                }
                const curAttachBaseLine  = <Line>auxinfo[1];
    
                // 确定是否足够靠近绘制墙壁线段
                 point = new Point(paperPoint.x, paperPoint.y);
                 const projection = MathUtil.projectPointToLine(point,curAttachBaseLine);
                const vpstart = point.subtraction(curAttachBaseLine.startPoint()).angle();
                const vpend = point.subtraction(curAttachBaseLine.endPoint()).angle();

                // 足够近且在范围内
                if(projection.distanceTo(point) <= DrawHouseLayoutService.DRAWROOM_ATTACH_DISTANCE
                  && (Math.abs(vpstart - vpend) > Math.PI /2) ) {
                    point = projection;
                } else  {
                    point = null;
                }   

                if(point) {
                    const findResult = this.tryAdjustDrawRoomStartPos(point);
                    if(findResult) {
                        point.setX(findResult.x());
                        point.setY(findResult.y());
                    }
                }

                
                // 记录相邻墙壁的朝向
                const v2 = nearWall.segment().startPoint().subtraction(nearWall.segment().endPoint());
                const align1 = MathUtil.findalign(midpoint,nearWall.segment().endPoint(),10,0,true);
                const aligh2 = MathUtil.findalign(midpoint,nearWall.segment().endPoint(),10,0,false);

                const attachroom = this.getHouseLayout().getRoomByWall(nearWall.segment());
                const alignpoint = (attachroom.containsPoint(align1)) ? aligh2 : align1;
                const alignVec =  alignpoint.subtraction(midpoint);
                this.roomAxisAngle_ = MathUtil.Vec2ToRadian(alignVec) * 180 / Math.PI;
            }
            
            
        }
        return point;
    }

    getCurrentWallType(): string {
        return this.currentWallType_;
    }

    setCurrentWallType(wallType: string): boolean {
        let result = false;
        if (this.currentWallType_ === wallType) {
            return result;
        }

        if (! DrawHouseLayoutWrapper.wallTypeSet.has(wallType)) {
            return result;
        }

        this.currentWallType_ = wallType;
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpWall() !== null) {                     
            result = true;
        }

        return result;
    }   

    
    

    /**
     *  清空激活点集
     */
    clearActivatedPoints() {
        if (this.activatedPoints_ === null) {
            this.activatedPoints_ = new Array<Point>();
        }
        while   (this.activatedPoints_.length !== 0) {
            this.activatedPoints_.pop();
        }
    }

    /**
     *  检查激活点集
     *  应对直线被撤销， 激活点需要重算的情况
     */
    protected checkActivatedPoints() {
        if (this.activatedPoints_.length !== 1) {
            return ;
        } else  {
            const currentAct = this.activatedPoints_[0];
            if (this.getHouseLayout().tmpRoom().length > 0) {
                const lastSeg = this.getHouseLayout().tmpRoom()[
                    this.getHouseLayout().tmpRoom().length - 1
                ].segment();

                this.activatedPoints_.pop();
                const currentActPoint = new Point(
                lastSeg.endPoint().x(),
               lastSeg.endPoint().y());
               this.activatedPoints_.push(currentActPoint);
            
            }
        }
    }

    protected addRoomToHouseLayout() {
        this.design_.houseLayout().addRoom( this.roomRefOpening_, this.roomRefOpeningWall_);
        this.roomRefOpening_ = null;
        this.roomRefOpeningWall_ = null;             
    }

    haveJustFinishedRoom() {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpRoom() === null && this.design_.houseLayout().roomNum() > 0) {
            return true;
        }

        if (houseLayout.tmpRoom().length === 0 && this.design_.houseLayout().roomNum() > 0) {
            return true;
        } else {
            return false;
        }
    }

    // 暂停画墙
    pauseDrawWall(): Array<InnerWall> {
        const houseLayout = this.getHouseLayout();   
        const result = new Array<InnerWall>();
        if(houseLayout.tmpWall() !== null) {
            result.push(houseLayout.tmpWall());  
            houseLayout.setTmpWall(null);
            this.initActivatedPoints();    
        }

        if(this.isRoomDrawMode()) {
            // 画房间模式销毁临时数据
            const tmpRoom = this.getHouseLayout().tmpRoom();
            if(tmpRoom) {
                while(tmpRoom.length > 0){
                    const inner = tmpRoom.pop();
                    result.push(inner);
                }
            }
        }

        if (houseLayout.tmpRoom().length === 0 && this.design_.houseLayout().roomNum() === 0) {
            this.clearActivatedPoints();
        }

        return result;
    }

    /**
     * 
     * @param paperPoint 
     *  根据传入点的位置，计算跟该点的关联点的位置，
     *  如果当前点和当前绘制的房间起点满足近似的竖直或者水平，
     *  修改位置数据使之与房间起点成为绝对的竖直或水平
     *  如果没有找到满足条件的关联点，则返回null
     *  
     */
    getReferencedPoint(inputPoint: Point): Point {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpRoom() === null ||
            houseLayout.tmpRoom().length < 2 ||
            houseLayout.tmpWall() === null ) {
            return null;
        }

        if (houseLayout.tmpWall().segment().length() < 10) {
            const inwall = houseLayout.tmpWall();
            return null;
        }

        const point = new Point(inputPoint.x(), inputPoint.y());
        const startPoint = this.getStartPoint();
        if (startPoint === null) {
            return null;
        }

        const vec = startPoint.subtraction(point);
        // if(vec.length() < 5) {
        //     point.setX(startPoint.x());
        //     point.setY(startPoint.y());
        //     return point;
        // }
        if (vec.length() < 20) {
            return null;
        }


        if (Math.abs(vec.x) < 5) {
            point.setX(startPoint.x());
            return point;
        } else if (Math.abs(vec.y) < 5) {
            point.setY(startPoint.y());
            return point;
        }
        return null;
    }

    /**
     * 检查贴墙线时，在不同模式下，可能同时会有多个检查方向
     */
    getAdaptingWallPoint():Array<Point> {
        const houselayout = this.getHouseLayout();
        const result = new Array<Point>();
        if(!houselayout) {
            return null;
        }
        if(this.isRoomDrawMode()) {
           const tmpRoomWalls = this.getHouseLayout().tmpRoom();
           const pointAlongVertical = tmpRoomWalls[0].segment().endPoint();
           const pointAlongHorizon = tmpRoomWalls[2].segment().endPoint();
           result.push(pointAlongHorizon);
           result.push(pointAlongVertical);
           return result;                
        } else if(this.isInSegmentDrawMode()) {
            const infoPoint = houselayout.tmpWall().segment().startPoint();
            result.push(infoPoint);
            return result;
        } else {
            return null;
        }
    }


    /**
     * 根据当前tool获取到的ref点
     * 以及当前绘图模式下需要检查辅助信息的临时墙壁数据终点，来获得需要显示的辅助信息
     * @param availavlePoint 
     * @param pointShouldBecheck 
     */
    getAdaptingWallAuxilary(availavlePoint: Point,pointShouldBecheck:Array<Point>): Array<BaseGeometry> {
        const auxinfo = new Array<BaseGeometry>();
        if(pointShouldBecheck && pointShouldBecheck.length > 0) {
            for(let i = 0; i < pointShouldBecheck.length;i++) {
                const newPointinfo = this.getAdsorptionWallPoint(availavlePoint,pointShouldBecheck[i]);
                if(newPointinfo) {
                    const checkpoint2 = newPointinfo[0];
                    const checkLine = newPointinfo[1];
                    if(checkpoint2 instanceof Point) {
                        availavlePoint.setX(checkpoint2.x());
                        availavlePoint.setY(checkpoint2.y());    
                    }  
                    if(checkLine instanceof Line) {
                        auxinfo.push(checkLine);  
                    }
                }
            }

            return auxinfo;
        }  else {
            return null;
        }  
    }
  
    protected findVecticalAndHorizonalWalls(horizonwalls:Array<Segment>,verticalWalls:Array<Segment>):boolean{
        const houseLayout = this.getHouseLayout();

        //找出houselayout的room里面的所有水平线垂直线
        for(let i = 0;i < houseLayout.rooms().length;i++) {
            const walls = houseLayout.rooms()[i].walls();
            for(let j = 0 ;j < walls.length; j++) {
                const segment = walls[j].segment();
                if (segment.startPoint().y() === segment.endPoint().y()){
                    horizonwalls.push(segment);
                } else if(segment.startPoint().x() === segment.endPoint().x()){
                    verticalWalls.push(segment);
                }
            }
        }
        //找出houselayout的tmpRoom里面的所有水平线垂直线
        for(let i = 0;i < houseLayout.tmpRoom().length;i++) {
            const segment = houseLayout.tmpRoom()[i].segment();
            if (segment.startPoint().x() === segment.endPoint().x()){
                horizonwalls.push(segment);
            } else if(segment.startPoint().y() === segment.endPoint().y()){
                verticalWalls.push(segment);
            }
        }

        return true;
    }

    /**
     * 
     * @param paperPoint 
     *  根据传入点的位置，计算跟该点的关联点的位置，
     *  如果当前点和当前houselayout里面的所有水平/垂直wall满足近似的竖直或者水平吸附，
     *  修改位置数据使之与相关的wall吸附
     *  如果没有找到满足条件的关联点，则返回null
     *  
     */
    getAdsorptionWallPoint(point: Point, addtionadlPoint?: Point): Array<BaseGeometry> {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpWall().segment().length() < 10) {
            const inwall = houseLayout.tmpWall();
            return null;
        }
        const levelSegments = new Array<Segment>();
        const verticalSegments = new Array<Segment>();
        //找出houselayout的room里面的所有水平线垂直线
        const checkwallresult =  this.findVecticalAndHorizonalWalls(levelSegments,verticalSegments);
        if(!checkwallresult) {
            return null;
        }
  
        const result = new Array<BaseGeometry>();
        const newPoint = new Point(point.x(), point.y());
        const stPoint = (addtionadlPoint) ? addtionadlPoint:  houseLayout.tmpWall().segment().startPoint();
        //在所有垂直线中找出是否符合吸附条件的垂线，如果有，更改点信息,更新辅助线信息
        for (let i = 0;i<verticalSegments.length;i++){
            if (this.currentWallType_ === 'addByRoom') {  
                const x = Math.abs(point.x()-verticalSegments[i].startPoint().x())
                if (x<5) {
                    newPoint.setX(verticalSegments[i].startPoint().x());
                    const auxiliaryLine = this.shortestAuxLine(verticalSegments[i],newPoint);
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                } 
            } else if(stPoint.y() === point.y()) {
                const x = Math.abs(point.x()-verticalSegments[i].startPoint().x())
                if (x<5) {
                    newPoint.setX(verticalSegments[i].startPoint().x());
                    const auxiliaryLine = this.shortestAuxLine(verticalSegments[i],newPoint);
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
            }

            if(stPoint.x() === point.x()) {
                //判断点的y是否和垂线的起点终点满足吸附关系   
                const y1 = Math.abs(point.y()-verticalSegments[i].startPoint().y());
                if (y1<5) {
                    newPoint.setY(verticalSegments[i].startPoint().y());
                    const auxiliaryLine = new Line(newPoint,verticalSegments[i].startPoint());
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
                const y2 = Math.abs(point.y()-verticalSegments[i].endPoint().y());
                if (y2<5) {
                    newPoint.setY(verticalSegments[i].endPoint().y());
                    const auxiliaryLine = new Line(newPoint,verticalSegments[i].endPoint());
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
            }               
        }
        // //在所有水平线中找出是否符合吸附条件的水平线，如果有，更改点信息，更新辅助线信息
        for (let i = 0;i<levelSegments.length;i++){
            if (this.currentWallType_ === 'addByRoom'){
                const y = Math.abs(point.y()-levelSegments[i].startPoint().y())
                if (y<5) {
                    newPoint.setY(levelSegments[i].startPoint().y());
                    const auxiliaryLine = this.shortestAuxLine(levelSegments[i],newPoint);
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
            } else if(stPoint.x() === point.x()) {
                const y = Math.abs(point.y()-levelSegments[i].startPoint().y())
                if (y<5) {
                    newPoint.setY(levelSegments[i].startPoint().y());
                    const auxiliaryLine = this.shortestAuxLine(levelSegments[i],newPoint);
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
            }
            if(stPoint.y() === point.y()) {
                ////判断点的x是否和水平线线的起点终点满足吸附关系
                const x1 = Math.abs(point.x()-levelSegments[i].startPoint().x());
                if (x1<5) {
                    newPoint.setX(levelSegments[i].startPoint().x());
                    const auxiliaryLine = new Line(newPoint,levelSegments[i].startPoint());
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
                const x2 = Math.abs(point.x()-levelSegments[i].endPoint().x());
                if (x2<5) {
                    newPoint.setX(levelSegments[i].endPoint().x());
                    const auxiliaryLine = new Line(newPoint,levelSegments[i].endPoint());
                    result.push(newPoint);
                    result.push(auxiliaryLine);
                }
            }   
        }
        return result;
    }

    //生成最短的辅助线
    shortestAuxLine(seg:Segment,point:Point) :Segment{
        const x1 = seg.startPoint().distanceTo(point);
        const x2 = seg.endPoint().distanceTo(point);
        const result =  new Line (point,seg.startPoint());
        if(x1<x2) {
            return result;
        } else {
            result.setEndPoint(seg.endPoint());
            return result;
        }
        
    }


    getStartPoint(): Point {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpRoom() === null || houseLayout.tmpRoom().length === 0) {
            return null;
        }
        const startPoint = houseLayout.tmpRoom()[0].segment().startPoint();
        return startPoint;
    }

    getVTLines(point: Point, vtlines: Array<Segment>) {
        const houseLayout = this.getHouseLayout();
        const walls = houseLayout.tmpRoom();
        for ( let i = 0; i < walls.length; i++) {
            if ( walls[i].segment().type() !== GeometryType.GEO_LINE) {
                continue;
            }

            // judge whether the point is on the line
            const wall = walls[i];
            const startpoint = wall.segment().startPoint();
            const endpoint = wall.segment().endPoint();
            // common form of the segment line
            const linevalue = (endpoint.x() - startpoint.x()) * point.y() -
                (endpoint.y() - startpoint.y()) * point.x() + startpoint.x() * endpoint.y() -
                startpoint.y() * endpoint.x();


            const percentage = (linevalue) * 1.0 / ( startpoint.x() * endpoint.y() -
            startpoint.y() * endpoint.x() );
            
            if ( Math.abs(percentage) < 0.005) {
                vtlines.push(wall.segment());
            }
        }

    }

    protected JudgeAuxipoint(pnow: Point, pref: Point, arrayAuxpoints: Array<Point>): number {
        const houseLayout = this.getHouseLayout();
        const xj = Math.abs(houseLayout.tmpWall().segment().startPoint().x() - pref.x());
        const yj = Math.abs(houseLayout.tmpWall().segment().startPoint().y() - pref.y());
        const xjnew = Math.abs(pnow.x() - pref.x());
        const yjnew = Math.abs(pnow.y() - pref.y());

        let mark = false;
        if (xj < 2 && xjnew < 2) {
            mark = true;
        }

        if (yj < 2 && yjnew < 2) {
            mark = true;
        }


        if ( Math.sqrt(xj * xj + yj * yj) < 1) {
            mark = true;
        }

        const xinfo = Math.abs(pnow.x() - pref.x());
        const yinfo = Math.abs(pnow.y() - pref.y());
        if ( Math.sqrt(xinfo * xinfo + yinfo * yinfo) < 7.5) {
            return 0x102;
        }



        if ( xinfo < 3 || yinfo < 3 ) {

            arrayAuxpoints.push(pref);
            if ((xinfo <= 1.5 || yinfo <= 1.5) && !mark ) {
                pnow.setSeedType('axis');
                arrayAuxpoints.push(pnow);
            }

            return 0x0;
        } else {
            return 0x101;
        }
    }

    // 显示辅助点信息，并返回可能的吸附点
    showAuxiPoint(mousepoint: Point): Point {
        this.hideAuxiPoint();
        const houseLayout = this.getHouseLayout();
        const walls = houseLayout.tmpRoom();

        const arrayAuxpoints = new Array<Point>();
        this.design_.houseLayout().getAuxpoint(mousepoint, arrayAuxpoints);
        for ( let i = 0; i < walls.length; i++) {
            // judge whether the point is on the line
            const wall = walls[i];
            const startpoint = wall.segment().startPoint();
            const endpoint = wall.segment().endPoint();
            this.JudgeAuxipoint(mousepoint, startpoint, arrayAuxpoints);
            this.JudgeAuxipoint(mousepoint, endpoint, arrayAuxpoints);
            
        }

        if (arrayAuxpoints.length > 0) {
            this.auxpoint_ = new AuxilaryPoints(arrayAuxpoints, mousepoint);

            this.outSceneObject_['auxpoints'] = this.auxpoint_;

            return this.auxpoint_.tryFindAttachment(mousepoint);
        } else {
            return null;
        }

    }

    hideAuxiPoint() {
        if (this.auxpoint_ !== null) {            
            this.outSceneObject_.delete('auxpoints');
        }
    }

    // 返回水平或者垂直的辅助线并自动吸附
    showGridLine( endPoint: Point): Line {
        this.hideGridLine();
        const houseLayout = this.getHouseLayout();
        const stPoint = houseLayout.tmpWall().segment().startPoint();
        const xinfo = (Math.abs(endPoint.x() - stPoint.x()) < 1e-4) ? 1e-4 : (endPoint.x() - stPoint.x()) ;
        const yinfo = endPoint.y() - stPoint.y();

        const linelength = Math.sqrt(xinfo * xinfo + yinfo * yinfo);
        if (linelength < 15) {
            return null;
        }

        let attachpoint = null;
        let newpoint = null;
        const angley = Math.atan(Math.abs(yinfo / xinfo));        
        if (angley < (3 * Math.PI / 180.0)) {
            const newx = endPoint.x() + xinfo ;
             newpoint = new Point(newx, stPoint.y());
            this.gridLine_ = new AuxiliaryLine(new Line(stPoint, newpoint));
            const attachx = stPoint.x() + (endPoint.x() - stPoint.x()) / Math.abs(endPoint.x() - stPoint.x()) * linelength;
            //生成吸附点
            attachpoint = new Point(attachx, stPoint.y());
        } else if (angley > (Math.PI / 180.0 * 87)) {
            const newy = endPoint.y() + yinfo ;
             newpoint = new Point(stPoint.x(), newy);
            this.gridLine_ = new AuxiliaryLine(new Line(stPoint, newpoint));
            const attachy = stPoint.y() + (endPoint.y() - stPoint.y()) / Math.abs(endPoint.y() - stPoint.y()) * linelength;
            //生成吸附点
            attachpoint = new Point(stPoint.x(), attachy);
        } else {
            return null;
        }

        this.gridLine_.lineColor('white');
        this.outSceneObject_['gridInfoLine'] = this.gridLine_;
        return new Line(stPoint, newpoint);
    }

    hideGridLine() {
        if (this.gridLine_ !== null) {            
            this.gridLine_ = null;
            this.outSceneObject_.delete('gridInfoLine');
        }
    }

    protected sortByPointDistance(point: Point) {
        return function(a: Segment, b: Segment) {
            return MathUtil.findNearEndPointDistanceInLine(point, a) - 
            MathUtil.findNearEndPointDistanceInLine(point, b);
        }        
    }   

    protected sortByPointtoPointDistance(point: Point) {
        return function(a: Point, b: Point) {
            return point.distanceTo(a) - 
            point.distanceTo(b);
        }        
    } 

    // 供tool调用， 用来显示优化后的辅助线信息
    // 判断后需要将需要绘制的辅助线数据信息返回给tool。让tool交给视图层形成渲染
    showAuxInfo(point: Point): Array<BaseGeometry> {
         let pointre = null;
         
         if(this.isRoomDrawMode()){        
             const result = new Array<BaseGeometry>(); 
             result.push(pointre);
             return result;
         }

         //const potentialine = this.showPotentialAttachLine(point);
         const potentialine = null;
         const gridline = this.showGridLine(point);
         // let auxpoint = this.showAuxiPoint(point);
         const auxpoint = null;

        // 当点即在水平/垂直线上，又同时在线段延长线上时， 显然要做点优化
         if (potentialine !== null && gridline !== null) {
            const intesects = MathUtil.segmentIntersectSegment(potentialine, gridline); 
            if (intesects.length > 0) {
                pointre = intesects[0];
            }

         } else if (potentialine !== null) {
            pointre = potentialine.endPoint();
         } else if (gridline !== null) {
            pointre = gridline.middlePoint();
         }

         if (auxpoint !== null) {
            //pointre = auxpoint;
         }

         const result = new Array<BaseGeometry>();
         result.push(pointre);
         if(gridline !== null) {
             result.push(gridline);
         }

         if(auxpoint !== null) {
             result.push(auxpoint);
         }

         if(potentialine !== null) {
             result.push(potentialine);
         }

         return result;
    }

    showPotentialAttachLine(point: Point): Line {
        this.hidePotentialAttachLine();
        let arrayoflines = Array<Segment>();
        this.design_.houseLayout().getVTLines(point, arrayoflines);
        this.getVTLines(point, arrayoflines);

        if (arrayoflines.length > 0) {
            // 根据直线端点到点的最近距离对结果进行排序
            arrayoflines.sort(this.sortByPointDistance(point));

            // 使用排序后的数组， 计算得到离当前点靠近的起始点
            const startpoint = (point.distanceTo(arrayoflines[0].startPoint()) >
                point.distanceTo(arrayoflines[0].endPoint())) ? arrayoflines[0].endPoint() :
                arrayoflines[0].startPoint();

            const projectPoint = MathUtil.projectPointToLine(point, arrayoflines[0]);

            this.potentialine_ = new AuxiliaryLine(new Line(startpoint, projectPoint));
            this.outSceneObject_['potentialLine'] = this.potentialine_;
            const seg = new Line(startpoint, projectPoint);
            return seg;
        } else {
            return null;
        }
    }

    hidePotentialAttachLine() {
        if (this.potentialine_ !== null) {            
            this.potentialine_ = null;
            this.outSceneObject_.delete('potentialLine');
        }
    }



    showAuxiliaryLine(p1: Point, p2: Point) {
        this.hideAuxiliaryLine();

        this.auxLine_ = new AuxiliaryLine(new Line(p1, p2));
        this.outSceneObject_['auxLine'] = this.auxLine_;       
    }

    showLength(p1: Point, p2: Point) {
        this.outSceneObject_['doorwayFlag'] = new Rect(new Point((p2.x()+p2.x())/2,(p2.y()+p1.y())/2),50,100);
        this.outSceneObject_['doorwayFlag'].setFillColor('black');
    }

    hideAuxiliaryLine() {
        if (this.auxLine_ !== null) {            
            this.auxLine_ = null;
            this.outSceneObject_.delete('auxLine');
        }
    }

    /**
     * 根据已知的户型数据初始化激活点
     *  1. 为函数多增加了返回值。 并根据是否找到激活点返回true/false
     *   2. 增加对线段更新后，线段终点变化需要更新激活点的判断
     *  修改目的： 使调用者能判断当前是否可继续画线
     */
    initActivatedPoints(): boolean {
        //如果正在绘制墙壁，则激活点只有一个，即当前临时数据的最后一个绘制点
        if (this.getHouseLayout().tmpRoom() && this.getHouseLayout().tmpRoom().length > 0) {
            if(this.activatedPoints_ === null) {
                this.activatedPoints_ = new Array<Point>();
            }

            while(this.activatedPoints_.length > 0) {
                this.activatedPoints_.pop();
            }

            const wall = this.getLastLine();
            if (null !== wall) {
                const newActivatedPoint = new Point(wall.segment().endPoint().x(),wall.segment().endPoint().y())
                this.activatedPoints_.push(newActivatedPoint);
                return true;
            }      
        }

        const openings = this.getHouseLayout().openings();
        for (let i = 0; i < openings.length; i++ ) {
            const opening = openings[i];
            if (opening.connectedRoomsNum() === 1 && opening instanceof DoorwayFlag) {
                this.clearActivatedPoints();
                this.activatedPoints_ = opening.outerPoints();
                this.roomRefOpening_ = opening;
                break;
            }
        }
        if (this.activatedPoints_.length === 0) {
            return false;
        } else {            
            return true;
        }
    }

    /**
     * 根据输入长度画墙 
     * 如果是无效输入则返回false, 反之返回true
     */
    drawWallByInput(wallTargetLength: string): boolean {     

        const tmpWall = this.getHouseLayout().tmpWall();
        if (tmpWall === null) {           
           return false;
        }
        
        const inputlen = parseFloat(wallTargetLength);
        let refpoint;
        if (Math.abs( inputlen - tmpWall.length()) >= 1) {        
            let vec = tmpWall.segment().toVector();  // 当在起点直接输入长度画墙时报错，应提示。
            vec = vec.normalize();
            vec = vec.multiplyScalar(inputlen);
            const newEndPoint: Point = (<Point>tmpWall.segment().startPoint().clone());
            newEndPoint.add(vec);
            
            refpoint = this.getAvailablePoint(newEndPoint.toPaperPoint());
        } else {
            const endpoint = tmpWall.segment().endPoint();
            const auxinfo = this.showAuxInfo(endpoint);
            if(auxinfo[0] instanceof Point){
                const auxpoint = <Point>auxinfo[0];
                const ref = this.getAvailablePoint(endpoint.toPaperPoint());
                refpoint = ref;
                if (ref !== null ) {
                    if (auxpoint !== null ) {
                        if (ref.distanceTo(auxpoint) >= 5) {
                            refpoint = auxpoint;
                        }
                    } else {
                        refpoint = auxpoint;
                    }
                }    
            }        
        }

        tmpWall.segment().setEndPoint(refpoint);
        return true;
    }
    
    getLastLine() {
        const houseLayout = this.getHouseLayout();
        if (houseLayout.tmpRoom() === null) {
            return null;
        }

        if (houseLayout.tmpRoom().length > 0) {
            return houseLayout.tmpRoom()[houseLayout.tmpRoom().length - 1];
        } else {
            return null;
        }
    }

    // 更新信使信息
    getLastLineType() {
        const houseLayout = this.getHouseLayout();
        this.tmpObject_ = {} as any;
        if (houseLayout.tmpWall() === null || houseLayout.tmpRoom().length === 0) {
            return;
        }
        const arry = houseLayout.tmpRoom();
        const wall = arry[houseLayout.tmpRoom().length - 1]; 
        const x =  wall.segment().endPoint().x() - wall.segment().startPoint().x();
        const y = wall.segment().endPoint().y() - wall.segment().startPoint().y();
        const wallDistance = Math.sqrt(x * x + y * y);   
        
        this.tmpObject_.type = this.currentWallType_;
        this.tmpObject_.offSetHeight = wall.segment().endPoint().y() - wall.segment().startPoint().y();
        this.tmpObject_.length = wall.length();   
        if (this.currentWallType_ === "arc") {
            const arc = <Arc> (wall.segment());
            this.tmpObject_.distance = wallDistance;
            this.tmpObject_.length = arc.getSegmentDistance();
            this.tmpObject_.arcDepth = arc.radius();            
        }        
    }



    /**
     * 找出当前画布中，待添加房间的门洞
     */
    protected findSingleAttachedOpening(): Opening {
        let attachOpening = this.roomRefOpening_;
        if(!attachOpening){
            const openings = this.getHouseLayout().openings();
            if(!openings){
                return attachOpening;
            }
            for(let i = 0; i < openings.length;i++){
                if(openings[i].connectedRoomsNum() === 1) {
                    attachOpening = openings[i];
                    break;
                }
            }
        } 
        
        return attachOpening;
    }

    /**
     * 找出默认房间起点线上真正可用的区域，并给出新的提示信息，
     * @param tipLine 
     */
    protected findAttachLimitationByRoom(tipLine: Line,attachedOpening:Opening): Line {
         const result = new Array<Line>();
        
         /// 找出所有和其它房间外墙的交点
         const rooms = this.getHouseLayout().rooms();
         if(!rooms){
             return null;
         }

         let intersections = new Array<Point>();
         for(let i = 0; i < rooms.length; i++) {
             const indexof = rooms[i].getOpenings().indexOf(attachedOpening);
             if( indexof >= 0) {
             //    continue;
             }
             const outwall = rooms[i].generateCheckingOuterWall();
             const interSectResult = MathUtil.lineInterSectPolygon(tipLine, outwall);
             intersections = intersections.concat(interSectResult);
         }

         // 距离当前提示线中点最近的两个交点即为新的可绘制房间的起始区域
         const midPoint = tipLine.middlePoint();
         const topLine = new Line(midPoint,tipLine.startPoint());
         const bottomLine = new Line(midPoint, tipLine.endPoint());

         let topchose = null;
         let bottomchose = null;
         for(let i = 0; i < intersections.length; i++) {
            if(  topLine.contains(intersections[i])) {
                topLine.setEndPoint(intersections[i]);
            }

            if(bottomLine.contains(intersections[i])) {
                bottomLine.setEndPoint(intersections[i]);
            }
         }

         return new Line(topLine.endPoint(), bottomLine.endPoint());
    }

    /**
     * 输出与当前激活点有关的提示信息
     */
    currentAuxObject():Array<BaseGeometry>{
        if(!this.activatedPoints_  || this.activatedPoints_.length === 0) {
            return null;
        }
        const result = new Array<BaseGeometry>();
        result.push(new Point(0,0));
        if(this.isInSegmentDrawMode()) {
            // 线划模式找激活点
            for(let i = 0; i < this.activatedPoints_.length; i++) {
                const newRect = new Rect(this.activatedPoints_[i],10,10);
                result.push(newRect);
            }
        } else if(this.isRoomDrawMode()) {
            const attachingOpening = this.findSingleAttachedOpening();
            if(!attachingOpening) {
                return null;
            }

            const activatingPoints = attachingOpening.outerPoints();
            const nearinfo = this.getHouseLayout().getNearestWall(activatingPoints[0]);
            const nearWall = <InnerWall>nearinfo[0];
            
            //将第一个激活点朝着第二个激活点的方向移动1.5个相邻墙壁的距离得到第一个边界点
            const moveToLength = ( nearWall.segment().length() * 1.5 > 100)? nearWall.segment().length() * 1.5  : 100;
            const firstEdge  = MathUtil.moveTowardsPoint(activatingPoints[0], activatingPoints[1],moveToLength);
            //第二个边界点类似
            const secondEdeg = MathUtil.moveTowardsPoint(activatingPoints[1], activatingPoints[0],moveToLength);
            const newLine = new Line(firstEdge, secondEdeg);

            //提示线不能有在其他房间外墙范围内的部分，
            //提示线和其他房间外墙有交点时，需要给出额外的提示信息
            const formedLine = this.findAttachLimitationByRoom(newLine,attachingOpening);
            result.push(formedLine);
        }

        return result;
    }

    
    roomRefOpening(): Opening {
        return this.roomRefOpening_;
    }

    roomRefOpeningWall(): Segment {
        return this.roomRefOpeningWall_;
    }
    

}
