import { HouseLayoutActionManager, HouseLayoutAddAction, HouseLayoutDeleteAction, HouseLayoutModifyAction } from './base-houselayout-action'

import { addWallGeo, removeWallGeo } from './wall-action'

import { HouseLayoutFlag, HouseLayout } from '../../houselayout/entity/entity'

import { RenderData2DComponent } from '../render-data-2d/render.2d.component'
import { DrawHouseLayoutService } from '../service/hsservice'
import { BaseEntityGeometry } from '../entity-geometry/entity-geometry'
import { PolygonPath, BasePath } from '../path/path'

export class LayoutOuterWallAddAction extends HouseLayoutAddAction {
  constructor(render2dCompoint: RenderData2DComponent) {
    const objects = new Array<any>();
    objects.push(render2dCompoint);
    super(objects);
  }

  root(): RenderData2DComponent {
    return <RenderData2DComponent>this.objects_[0];
  }

  excute(): boolean {
    const mgr = this.houseLayoutActionManager();
    const houselayout = mgr.houseLayout();

    if (houselayout.outwallGenerated()) {
      return false;
    } else {
      /////////////////////////////
      // remove innerwallGeometry first
      const rooms = houselayout.rooms();
      const roomLength = rooms.length;
      for (let i = 0; i < roomLength; ++i) {
        const innerWalls = rooms[i].walls();
        const innerWallLength = innerWalls.length;
        for (let j = 0; j < innerWallLength; ++j) {
          removeWallGeo(this.houseLayoutActionManager(), innerWalls[j]);
        }
      }

      ///////////////////////////////

      const polygon = houselayout.generateOuterWalls();
      if (polygon === null) {
        return false;
      }
      // add innerwallGeometry
      for (let i = 0; i < roomLength; ++i) {
        const innerWalls = rooms[i].walls();
        const innerWallLength = innerWalls.length;
        for (let j = 0; j < innerWallLength; ++j) {
          addWallGeo(this.houseLayoutActionManager(), innerWalls[j]);
        }
      }

      const geo = new BaseEntityGeometry(null);
      const geoPath = new PolygonPath(polygon);
      geoPath.style.strokeColor = '#333843';
      const geoMap = new Map<string, BasePath>();
      geoMap['polygon'] = geoPath;
      geo.setGeos(geoMap);
      const name = 'outerWall';
      this.houseLayoutActionManager().addGeometry(name, geo);
      this.root().changeWallEnable('拆除外墙');
      // this.root().informDrawRoomFinished(2);
      return true;
    }
  }

  cancel(): boolean {
    const mgr = this.houseLayoutActionManager();
    const houselayout = mgr.houseLayout();

    if (!houselayout.outwallGenerated()) {
      return false;
    } else {
      const result = <boolean>houselayout.eliminateOuterWalls();
      this.houseLayoutActionManager().removeGeometry('outerWall');
      /// 先路由至页面，否则元素不会加载
      this.root().router.navigate(['houselayout/house-type']);

      // 还需要将实体信息隐藏起来
      this.root().informHouselayoutType('none', 'none', 'changeBarTohouselayout');

      // 传递生成外墙消息
      this.root().changeWallEnable('生成外墙');

      // 根据是否有多余激活点，判断能否进入画线状态
      // 获取激活点信息
      //    const existActivatePoint = this.root().initActivatedPoints();
      //    if (existActivatePoint) {
      //        this.root().informDrawRoomFinished(-1);
      //    } else {
      //        this.root().informDrawRoomFinished(1);
      //    }

    }
  }
}

export class LayoutOuterWallDeleteAction extends HouseLayoutDeleteAction {
  constructor(render2dCompoint: RenderData2DComponent) {
    const objects = new Array<any>();
    objects.push(render2dCompoint);
    super(objects);
  }

  root(): RenderData2DComponent {
    return <RenderData2DComponent>this.objects_[0];
  }

  excute(): boolean {
    const mgr = this.houseLayoutActionManager();
    const houselayout = mgr.houseLayout();

    if (!houselayout.outwallGenerated()) {
      return false;
    } else {
      const result = <boolean>houselayout.eliminateOuterWalls();
      this.root().informPropertyInfo(null);
      this.houseLayoutActionManager().removeGeometry('outerWall');
      /// 先路由至页面，否则元素不会加载
      this.root().router.navigate(['houselayout/house-type']);

      // 还需要将实体信息隐藏起来
      this.root().informHouselayoutType('none', 'none', 'changeBarTohouselayout');

      // 传递生成外墙消息
      this.root().changeWallEnable('生成外墙');

      // 根据是否有多余激活点，判断能否进入画线状态
      // 获取激活点信息
      // const existActivatePoint = this.root().initActivatedPoints();
      // if (existActivatePoint) {
      //     this.root().informDrawRoomFinished(-1);
      // } else {
      //     this.root().informDrawRoomFinished(1);
      // }
    }
  }

  cancel(): boolean {
    const mgr = this.houseLayoutActionManager();
    const houselayout = mgr.houseLayout();

    if (houselayout.outwallGenerated()) {
      return false;
    } else {
      const polygon = houselayout.generateOuterWalls();
      if (polygon === null) {
        return false;
      }
      const geo = new BaseEntityGeometry(null);
      const geoPath = new PolygonPath(polygon);
      geoPath.style.strokeColor = '#333843';
      const geoMap = new Map<string, BasePath>();
      geoMap['polygon'] = geoPath;
      geo.setGeos(geoMap);
      const name = 'outerWall';
      this.houseLayoutActionManager().addGeometry(name, geo);
      this.root().changeWallEnable('拆除外墙');
      // this.root().informDrawRoomFinished(2);
      return true;
    }
  }


}
