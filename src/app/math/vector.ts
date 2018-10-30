import {Vector2 as Vec2} from 'three'
import * as MathUtil from './math'
import {Point as PaperPoint} from 'paper'

export function AreVectorsParallel(v1: Vec2, v2: Vec2): boolean {
    const crossValue = CrossProduction(v1, v2);
    return MathUtil.isZero(crossValue);
}

export function AreVectorsPerpendicular(v1: Vec2, v2: Vec2): boolean {
    const v1Normal = v1.normalize();
    const v2Normal = v2.normalize();
    const dotVal = v1Normal.dot(v2Normal);
    return MathUtil.isZero(dotVal);
}

export function Vec2ToPaperPoint(v: Vec2): PaperPoint {
    return new PaperPoint(v.x, v.y);
}

export function Vec2ToRadian(v: Vec2): number {
    const vec = new Vec2(1.0, 0.0);
    const tmpVec = new Vec2(v.x, v.y);
    tmpVec.normalize();
    const dotVal = vec.dot(tmpVec);
    let radian = Math.acos(dotVal);
    if (v.y < 0) {
        radian = Math.PI * 2 - radian;
    }
    return radian;
}


// v1 + v2
export function CreateVecByAdd(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}

export function CreateVecBySubtraction(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}

// v1 * scalar
export function CreateVecByMultiply(v: Vec2, scalar: number): Vec2 {
    return new Vec2(scalar * v.x, scalar * v.y );
}

// v1 X v2
export function CrossProduction(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.y -  v1.y * v2.x;
}

export function vec2ddot(v1: Vec2, v2: Vec2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

export function vec2RoundToZero(point: Vec2): boolean {
  if (MathUtil.isZero(point.x) && MathUtil.isZero(point.y)) {
    return true;
  } else {
    return false;
  }
}
