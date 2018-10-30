
import { Vector2, Vector3 } from "three";
import { Rect } from '../geometry/geometry'
import * as MathUtil from '../../math/math'
import { FlagType } from './entity'

// component
export class ComponentEntity {


  // the id that is imported from houselayout
  // NOTICE: currently the hole betweeen two rooms of houselayout has id and no related door id
  // the new added door(window) has id while the related hole has no id
  private originalId_: number;

  // new generate id
  private uuid_: string;

  private componentType_: FlagType;

  // cube rect in 2D in plan view
  private cubeHoleRect_: Rect;
  private height_: number;
  private distanceFromGround_: number;

  constructor(componentType: FlagType, cubeHoleRect: Rect, height: number, distanceFromGround: number, originalId: number) {

    this.componentType_ = componentType;
    this.uuid_ = 'component_' + MathUtil.uuid();
    this.cubeHoleRect_ = new Rect(cubeHoleRect.center(), cubeHoleRect.width(), cubeHoleRect.length(), cubeHoleRect.lengthDirection());
    this.height_ = height;
    this.distanceFromGround_ = distanceFromGround;

    this.originalId_ = originalId;

  }

  originalId(): number {
    return this.originalId_;
  }

  uuid(): string {
    return this.uuid_;
  }

  cubeHoleRect(): Rect {
    return this.cubeHoleRect_;
  }

  height(): number {
    return this.height_;
  }

  distanceFromGround(): number {
    return this.distanceFromGround_;
  }
}

