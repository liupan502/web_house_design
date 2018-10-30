import { Vector2, Vector3 } from "three";
import * as MathUtil from '../../math/math'
import { OpeningType } from './entity'

export class OpeningEntity {

  private originalId_: number | undefined;
  private uuid_: string;
  private openingType_: OpeningType;
  private nDirection_: Vector3;
  private tDirection_: Vector3;
  constructor(openingType: OpeningType, nDirection: Vector3, tDirection: Vector3, originalId?: number | undefined) {

    this.openingType_ = openingType;
    this.nDirection_ = nDirection;
    this.tDirection_ = tDirection;
    this.uuid_ = 'opening_' + MathUtil.uuid();
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

  openingType(): OpeningType {
    return this.openingType_;
  }

  nDirection(): Vector3 {
    return this.nDirection_;
  }

  tDirection(): Vector3 {
    return this.tDirection_;
  }

  // set property exclude id
  setOpeningEntityProperty(otherOpeningEntity: OpeningEntity) {
    this.openingType_ = otherOpeningEntity.openingType_;
    this.nDirection_ = otherOpeningEntity.nDirection_;
    this.tDirection_ = otherOpeningEntity.tDirection_;
  }

}

