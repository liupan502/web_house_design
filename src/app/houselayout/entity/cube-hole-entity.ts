
import { Vector2, Vector3 } from "three";
import { Rect } from '../geometry/geometry'
import * as MathUtil from '../../math/math'
import { OpeningEntity } from './entity'
// hole type
export class CubeHoleEntity {


  // the id that is imported from houselayout
  // NOTICE: currently the hole betweeen two rooms of houselayout has id and no related door id
  // the new added door(window) has id while the related hole has no id
  private originalId_: number | undefined;

  // new generate id
  private uuid_: string;
  // cube rect in 2D in plan view
  private cubeHoleRect_: Rect;
  private height_: number;
  private distanceFromGround_: number;
  private attachedOpeningEntity_?: OpeningEntity | undefined;
  constructor(cubeHoleRect: Rect, height: number, distanceFromGround: number, originalId?: number | undefined , attachedOpeningEntity?: OpeningEntity, ) {

    this.uuid_ = 'hole_' + MathUtil.uuid();
    this.cubeHoleRect_ = new Rect(cubeHoleRect.center(), cubeHoleRect.width(), cubeHoleRect.length(), cubeHoleRect.lengthDirection());
    this.height_ = height;
    this.distanceFromGround_ = distanceFromGround;

    if (attachedOpeningEntity) {
      this.attachedOpeningEntity_ = attachedOpeningEntity;
    }

    if (originalId) {
      this.originalId_ = originalId;
    } else {
      this.originalId_ = undefined;
    }

  }

  originalId(): number | undefined {
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

  attachedOpeningEntity() {
    return this.attachedOpeningEntity_;
  }

  setHoleEntityProperty(otherHoleEntity: CubeHoleEntity) {
    this.cubeHoleRect_ = new Rect(otherHoleEntity.cubeHoleRect_.center(), otherHoleEntity.cubeHoleRect_.width(),
                                  otherHoleEntity.cubeHoleRect_.length(), otherHoleEntity.cubeHoleRect_.lengthDirection());
    this.height_ = otherHoleEntity.height_;
    this.distanceFromGround_ = otherHoleEntity.distanceFromGround_;
    if (this.attachedOpeningEntity_ && otherHoleEntity.attachedOpeningEntity_) {
      this.attachedOpeningEntity_.setOpeningEntityProperty(otherHoleEntity.attachedOpeningEntity_);
    }
  }
}

