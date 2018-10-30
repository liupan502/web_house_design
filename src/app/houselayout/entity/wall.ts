import * as Geometry from '../../geometry/geometry'
import {Corner} from './corner'
import {BaseEntity} from './entity'
export class Wall extends BaseEntity {
    protected static maxId = 0;
    protected geo: Array<Geometry.BaseGeometry>;
    protected corner1: Corner;
    protected corner2: Corner;
    protected height_: number;

    static GenerateId(): number {
        Wall.maxId = (Wall.maxId++) % 1000;
        return Wall.maxId;
    }

    updateView() {
        if (!this.isDirty()) {
            return
        }
    }

    fromJSON(input) {
        super.fromJSON(input);
        this.id_ = (input.id_) ? input.id_ : this.id_;
        Wall.maxId = (this.id_ > Wall.maxId) ? this.id_ : Wall.maxId;
        this.height_ = input.height_;
        this.corner1 = new Corner().fromJSON(input.corner1);
        this.corner2 = new Corner().fromJSON(input.corner2);
    
        return this;
    }    
}
