
import {BaseWrapper} from './wrapper'
import {BaseEntity, FlagFactory} from '../entity/entity'

export class BaseHouseLayoutWrapper extends BaseWrapper{
    createItem(name: string): BaseEntity{
        if (name === "opening_door") {
            name = 'DoorwayFlag';
        }
        let result:BaseEntity = FlagFactory.createFlag(name);
        if (result != null) {
            return result;
        }

        result = super.createItem(name);
        return result;
    }
}
