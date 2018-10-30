import { BaseEntityGeometry } from './entity-geometry'
import { Room } from '../entity/entity'
import {PolygonPath} from '../path/path'
export class RoomGeometry extends BaseEntityGeometry{

    static readonly WALLS = 'walls';

    constructor(room: Room) {
        super(room);
        const walls = room.region().clone();    
        const wallsPath = new PolygonPath(walls);
        //wallsPath.style.fillColor = 'gray';
        wallsPath.style.strokeColor = 'grey';
        this.geos_['walls'] = wallsPath;
    }  
}