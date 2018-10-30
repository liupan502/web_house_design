import {BaseEntity} from './entity'
import * as Geometry from '../../geometry/geometry'

export class Corner extends BaseEntity {
    protected static maxId = 0;

    protected polygon_: Geometry.Polygon ;

    protected center_: Geometry.Point ;



    static GenerateId(): number {
        Corner.maxId = (Corner.maxId++) % 1000;
        return Corner.maxId;
    }

    updateView() {
        ;
    }
}
