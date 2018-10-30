
import { Vector2, Vector3 } from "three";
import { WallEntities } from './entity'
import { Point, Segment, Line, Polygon, Arc, GeometryType } from '../geometry/geometry'
import { RoomEntity, CubeHoleEntity, ComponentEntity } from './entity'
import * as MathUtil from '../../math/math'


// room entity
export class RoomEntities {


  // all room entities
  private rooms_: Array<RoomEntity>;

  constructor(rooms: Array<RoomEntity>) {
    this.rooms_ = new Array<RoomEntity>();
    const roomNumber = rooms.length;
    for (let i = 0; i < roomNumber; ++i) {
      this.rooms_.push(rooms[i]);
    }
  }

  pushRoomEntity(room: RoomEntity) {
    this.rooms_.push(room);
  }

  pushComponent(component: ComponentEntity, roomTag: number): number {
    let index = -1;
    const roomNumber = this.rooms_.length;
    for (let i = 0; i < roomNumber; ++i) {
      if (roomTag === this.rooms_[i].originalRoomTag()) {

        const componentNumber = this.rooms_[i].components().length;
        for (let j = 0; j < componentNumber; ++j) {
          const currentComponent = this.rooms_[i].components()[j];
          if (component.uuid() === currentComponent.uuid() || component.originalId() === currentComponent.originalId()) {
            // alredy exist
            return -1;
          }
        }
        this.rooms_[i].pushComponent(component);
        index = i;
        break;
      }
    }
    return index;
  }

  removeComponent(componentId: number): string {

    let componentUuid: string;
    const roomNumber = this.rooms_.length;
    for (let i = 0; i < roomNumber; ++i) {
      const componentNumber = this.rooms_[i].components().length;
      for (let j = 0; j < componentNumber; ++j) {
        if (this.rooms_[i].components()[j].originalId() === componentId) {
          componentUuid = this.rooms_[i].components()[j].uuid();
          this.rooms_[i].components().splice(j, 1);
        }
      }
    }
    return componentUuid;
  }

  rooms(): Array<RoomEntity> {
    return this.rooms_;
  }

  getAllcomponent(): Array<ComponentEntity> {
    const allComponents = new Array<ComponentEntity>();
    const roomNumber = this.rooms_.length;
    for (let i = 0; i < roomNumber; ++i) {
      const componentNumber = this.rooms_[i].components().length;
      for (let j = 0; j < componentNumber; ++j) {
        allComponents.push(this.rooms_[i].components()[j]);
      }
    }
    return allComponents;
  }
  /////////////////////////////////

  public dumpRoomInfos(): any {
    let roomInfos = new Array();
    const roomNumber = this.rooms_.length;
    for (let i = 0; i < roomNumber; ++i) {
      let roomInfo = this.rooms_[i].dumpRoomInfo();
      roomInfos.push(roomInfo);
    }
    return roomInfos;
  }



}

