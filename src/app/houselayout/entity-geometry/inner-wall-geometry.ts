import { PolygonPath } from './../../path/polygon-path';
import { Polygon } from './../../geometry/polygon';
import {BaseEntityGeometry} from './entity-geometry'
import {InnerWall} from '../entity/entity'
import {Line, Arc, BaseGeometry,Segment} from '../geometry/geometry'
import {LinePath, ArcPath, BasePath, MarkerText} from '../path/path'
import * as MathUtil from  '../../math/math'


// 外墙所需绘图信息只用包换在InnerWallGeo中，外墙不是独立数据，而是依据内墙厚度生成
export class InnerWallGeometry extends BaseEntityGeometry{

    /**
     * 包含几何体信息
     *  ['innerwall_seg'] ------ 内墙对应segment
     *  ['outwall_seg'] ------ 外墙对应segment
     *  ['wall_rect'] ------ 内外墙连接形成的多边形区域
     *                       根据InnerWall中的选中属性来决定是否显示
     */
    static readonly INNERWALL_SEG = 'innerWall_seg';
    static readonly OUTWALL_SEG = 'outwall_seg';
    static readonly WALL_RECT = 'wall_rect';
    static readonly LINE_MARK = 'line_mark';

    protected tmpGeos_: Map<string, BaseGeometry> = null;
    protected wallPolygon_: Polygon;


    constructor(wall: InnerWall) {
        super(wall);
        this.tmpGeos_ = new Map<string,BaseGeometry>();
        const segment = wall.segment();
        this.tmpGeos_[InnerWallGeometry.INNERWALL_SEG] = wall.segment();
        let segmentPath:BasePath = null;
        if (segment instanceof Line) {
            segmentPath = new LinePath(<Line> segment);
        } else {
            segmentPath =  new ArcPath(<Arc> segment);
        }

        const markerText = new MarkerText(segment);

        segmentPath.style.strokeColor = '#1DA1F2 ';
        // 初始化的时候，不考虑外墙渲染。交给updateGeometry判断是否需要生成外墙
        this.geos_[InnerWallGeometry.INNERWALL_SEG] = segmentPath;
        this.geos_[InnerWallGeometry.LINE_MARK] = markerText;

        this.wallPolygon_ = null;
    }

    protected InnerWall(): InnerWall {
        return <InnerWall>(this.refEntity_);
    }

    transform(): boolean {
        // do nothing
        return true;
    }

    protected updateGeometry() {
        if(this.InnerWall() === null) {
            return;
        }

        const attachedRoom = this.InnerWall().getRoom();
        if(attachedRoom === null) {
            return;
        }

        // 如果房间的生成标记被设置
        if(attachedRoom.IsOutWallExist() && this.wallPolygon_ === null){
            // this.wallPolygon_  = attachedRoom.generateOutWalls();
            const tempSegsinfo = new Array<Segment>();
            for(let i = 0; i < attachedRoom.walls().length; i++) {
                tempSegsinfo.push(attachedRoom.walls()[i].segment());
            }


            const wallEntity = attachedRoom.getWallEntityByInnerWall(this.InnerWall());
            const innerWallSegment =this.InnerWall().segment();

            if (innerWallSegment.isSame(wallEntity.innerWall())) {
              this.tmpGeos_[InnerWallGeometry.OUTWALL_SEG] = wallEntity.outerWall();
            } else {
              this.tmpGeos_[InnerWallGeometry.OUTWALL_SEG] = wallEntity.innerWall();
            }

            this.wallPolygon_ = wallEntity.getWallRect();
            this.tmpGeos_[InnerWallGeometry.WALL_RECT] = this.wallPolygon_;
            let segmentPath:BasePath = null;
            if (wallEntity.outerWall() instanceof Line) {
                segmentPath = new LinePath(<Line> wallEntity.outerWall());
            } else {
                segmentPath =  new ArcPath(<Arc> wallEntity.outerWall());
            }

            this.geos_[InnerWallGeometry.OUTWALL_SEG] = segmentPath;
            segmentPath.strokeColor = 'yellow';
            this.geos_[InnerWallGeometry.WALL_RECT] = new PolygonPath(this.tmpGeos_[InnerWallGeometry.WALL_RECT]);

            //默认为透明
            (<BasePath>this.geos_[InnerWallGeometry.WALL_RECT]).fillColor = '#1DA1F2 ';
            (<BasePath>this.geos_[InnerWallGeometry.WALL_RECT]).opacity = 0;

        }

        // 暂时没有更新tmpGeo的操作，
        // 如果有可以在此实现，已实现墙体entityGeo数据更新

    }


    //

    // 当内墙对应的房间生成外墙标记和数据具备时，根据本墙数据渲染其对应的那一面外墙
    //
    updatePath() {
        super.updatePath();
        if(this.refEntity_.isTmp()) {
            this.geos_[InnerWallGeometry.LINE_MARK].remove();
        }

        if((this.geos_[InnerWallGeometry.WALL_RECT])){
            if(this.InnerWall().isBeingSelected()) {
                (<BasePath>this.geos_[InnerWallGeometry.WALL_RECT]).opacity = 0.2;
                (<BasePath>this.geos_[InnerWallGeometry.OUTWALL_SEG]).opacity = 0.2;
            } else if(!this.InnerWall().isBeingSelected()) {
                    (<BasePath>this.geos_[InnerWallGeometry.WALL_RECT]).opacity = 0;
                    (<BasePath>this.geos_[InnerWallGeometry.OUTWALL_SEG]).opacity = 0;
            }
        }

        const attachedRoom = this.InnerWall().getRoom();
        if(attachedRoom === null) {
            return;
        }
        if(!attachedRoom.IsOutWallExist() && this.wallPolygon_ !== null){
            (<BasePath>this.geos_[InnerWallGeometry.WALL_RECT]).remove();
            (<BasePath>this.geos_[InnerWallGeometry.OUTWALL_SEG]).remove();
            // this.tmpGeos_[InnerWallGeometry.WALL_RECT] = null;
            // this.tmpGeos_[InnerWallGeometry.OUTWALL_SEG] = null;
            this.wallPolygon_ = null;
        }

        // if(this.refEntity_.isSelected()) {
        //     (<BasePath>this.tmpGeos_[InnerWallGeometry.WALL_RECT]).opacity = 1;
        // } else {
        //     (<BasePath>this.tmpGeos_[InnerWallGeometry.WALL_RECT]).opacity = 0;
        // }

        // 检查关联房间的生成外墙标记
             // 渲染外墙


    }

}
