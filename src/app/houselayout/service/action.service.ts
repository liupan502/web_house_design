import {Injectable} from '@angular/core'


import {DrawHouseLayoutService} from './draw-houselayout.service'
import {BaseEntityGeometry } from '../entity-geometry/entity-geometry'

import {HouseLayout} from '../entity/entity'




import {HouseLayoutActionManager} from '../action/action'

import {DesignService} from '../../service/design.service'


@Injectable()
export class HouseLayoutActionManagerService {

     protected houseLayoutActionMgr_: HouseLayoutActionManager;
    constructor(
          private designService: DesignService,
          private drawHouseLayoutService: DrawHouseLayoutService
    ) {
        
     this.houseLayoutActionMgr_ = null;
    }

    
    
    houseLayoutActionManager(): HouseLayoutActionManager {
        if (this.houseLayoutActionMgr_ === null) {
            const houselayout = this.designService.getHouseLayout();
            this.houseLayoutActionMgr_ = new HouseLayoutActionManager(houselayout, this.drawHouseLayoutService);
        }
        return this.houseLayoutActionMgr_;
        
    }

    releaseManager() {
        if (this.houseLayoutActionMgr_ === null) {
            return;
        }
        
        this.houseLayoutActionMgr_.releaseActions();
        this.houseLayoutActionMgr_ = null;      
    }


}