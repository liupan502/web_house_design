import * as uuidv4 from 'uuid/v4';

export * from './vector'
export * from './geometry'

export const epsilon = 1e-4;

export function isZero(val: number): boolean {
    val = Math.abs(val);
    return val < 0.0001;
}

export function angleToRandian(angle: number): number {
    return Math.PI * angle / 180.0;
}

export function radianToAngle(radian: number): number {
    return radian / Math.PI * 180;
}


/**
 * uuid v4
 * @param void
 * @return uuid:string
 */
export function uuid(): string {

    let sourceId = uuidv4();
    return sourceId.replace(/-/g, '');

    // let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
    // let uuid = new Array( 36 );
    // let rnd = 0, r;

    // return function () {
    //     for ( let i = 0; i < 36; i ++ ) {
    //         if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
    //         r = rnd & 0xf;
    //         rnd = rnd >> 4;
    //         uuid[ i ] = chars[ ( i == 19 ) ? ( r & 0x3 ) | 0x8 : r ];
    //     }
    //     return uuid.join( '' ) + Date.now();

    // }();
}

/**
 * 将输入数字框定在上下边界之间   
 * Bounding input number in (bottom, top).
 * 
 * @author Angus Lee
 * @param input:number
 * @param top:number
 * @param bottom:number
 */
export function bound (input: number, top:number, bottom:number) {
    return input > top ? top : input < bottom ? bottom : input;
}
