import {Injectable} from '@angular/core'
import {DrawHouseLayoutWrapper, DefaultWrapper, BaseDragItemWrapper} from '../wrapper/wrapper'
import {DesignService} from './hsservice'

@Injectable()
export class WrapperService {

    private static drawHouseLayoutWrapper_: DrawHouseLayoutWrapper = null;

    private static defaultWrapper_: DefaultWrapper = null;

    private static dragItemWrapper_: BaseDragItemWrapper = null;

    constructor(private designService:DesignService) {

    }

    getDrawHouseLayoutWrapper(): DrawHouseLayoutWrapper {
        if (WrapperService.drawHouseLayoutWrapper_ === null) {
            WrapperService.drawHouseLayoutWrapper_ = new DrawHouseLayoutWrapper(this.designService.getDesign());
        }
        return WrapperService.drawHouseLayoutWrapper_;
    }

    getDefaultWrapper(): DefaultWrapper {
        if (WrapperService.defaultWrapper_ === null) {
            WrapperService.defaultWrapper_ = new DefaultWrapper(this.designService.getDesign());
        }
        return WrapperService.defaultWrapper_;
    }

    getDragItemWrapper(): BaseDragItemWrapper {
        if (WrapperService.dragItemWrapper_ === null) {
            WrapperService.dragItemWrapper_ = new BaseDragItemWrapper(this.designService.getDesign());
        }
        return WrapperService.dragItemWrapper_;
    }
}