import {BaseEntity, FlagFactory} from './entity'
import {HouseLayout} from './house-layout'
import {Point, Segment, GeometryType} from '../../geometry/geometry'
import {Path, Point as PaperPoint} from 'paper'
import {HouseLayoutGeometryFactory } from '../entity-geometry/entity-geometry'
import {BasePathFactory} from '../../path/path'
 
export class BaseDragEntity extends BaseEntity {

}

 export class HouseLayoutDragEntity extends BaseDragEntity {

  protected allowToAdded_: boolean;

  constructor () {
    super();
    this.allowToAdded_ = false;
  }

  fromJSON(input) {
    super.fromJSON(input);
    return this;
  }

  allowToAdded(): boolean {
    return this.allowToAdded_;
  }

  setAllowToAdded(allowToAdded: boolean) {
    this.allowToAdded_ = allowToAdded;
  }

  // 根据实体自身处理逻辑和当前画布状态自适应实体的新位置、高度等信息
  autoAdapt(houselayout: HouseLayout, point: Point): boolean {
    return false;
  }




  attachToOpening(houselayout: HouseLayout, point: Point): boolean {
    return false;
  }

  addToHouseLayout(houseLayout: HouseLayout): boolean {
    this.setIsTmp(false);
    return false;
  }

  removeFromHouseLayout(houseLayout: HouseLayout): boolean {
    this.setIsTmp(true);
    return false;
  }

   shallowCopy(rightval: any) {
    super.shallowCopy(rightval);
    this.allowToAdded_ = rightval.allowToAdded();
    this.isDirty_ = true;
  }

    // it's a shallow copy
    // 经过该函数， 只会向外clone自己的属性信息和数据信息
    // 几何信息不会透露
    shallowclone( ): any {
      // 使用factorty， 避免在每个子类里去重载shallowClone
      // 使用false避免浪费ID
      const returnval = FlagFactory.createFlag(this.showEntityInfo(),false);

      // 每一个使用想使用shallowClone的对象，其必须在自己这一层实现shallowCopy。
      // shallowCopy也会拷贝ID
      returnval.shallowCopy(this);

      return returnval;
    }

    /**
     * 判断实体是否贴在一条直线上，并返回公共线段
     * @param line
     */
    isOnline(line: Segment, dis:number,pl: Point, pr:Point): boolean {
      const tempGeo = HouseLayoutGeometryFactory.CreateGeometry(this);
    
      if(line.type() === GeometryType.GEO_LINE){
           const result = tempGeo.overLapWith(line, pl ,pr);
           if(result === true){
                //
                if(pl.distanceTo(line.startPoint()) < dis) {
                  return null;
                }
                if(pl.distanceTo(line.endPoint()) < dis) {
                  return null;
                }
                if(pr.distanceTo(line.startPoint()) < dis) {
                  return null;
                }
                if(pr.distanceTo(line.endPoint()) < dis) {
                  return null;
                }
                tempGeo.destory();
                return result;
           }
           //const pointArray = tempGeo.overLapWith(info);
           //return pointArray;
      }

      tempGeo.destory();
      


      return false;
  }

 }
