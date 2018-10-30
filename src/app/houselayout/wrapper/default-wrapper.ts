import { BaseWrapper} from './wrapper'
import { Design , BaseEntity, HouseLayoutDragEntity} from '../entity/entity'
import {Item} from 'paper'
import {Segment} from '../../geometry/segment'
import {Polygon} from '../../geometry/polygon'

export class DefaultWrapper extends BaseWrapper {
    protected currentPickedItem_: BaseEntity;
    constructor(design: Design) {
        super(design);
        this.currentPickedItem_ = null;
    }

    setCurrentPickedItem(currentPickedItem: BaseEntity) {
      if(this.currentPickedItem_ !== null) {
          this.currentPickedItem_.setIsSelected(false);
      }
      this.currentPickedItem_ = currentPickedItem;
      if(this.currentPickedItem_ != null) {
        this.currentPickedItem_.setIsSelected(true);
      }



  }

  currentPickedItem(): BaseEntity{
      return this.currentPickedItem_;
  }

    outwallGenerated(): Boolean {
        return this.design_.houseLayout().outwallGenerated();
    }
}
