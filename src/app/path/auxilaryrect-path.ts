import { AuxilaryRect } from './../houselayout/entity/auxiliary-line';
import {Path, Point as PaperPoint,Matrix} from 'paper'
import {BasePath} from './base-path'
import {Point, Circle} from '../geometry/geometry'


export class AuxilaryRectPath extends BasePath {
    protected auxRect: AuxilaryRect;

    constructor(auxilaryRect: AuxilaryRect) {
        super();
        this.auxRect = auxilaryRect;
    }


    /**辅助线段的终点，起点在设置时已经是转换过后的点 */
    transform(matrix: Matrix): void{

    }    

    update() {
        this.removeSegments();        
        const leftStart =  this.auxRect.getLeftStartPoint();
        const leftEnd = this.auxRect.getLeftEndPoint();
        
        const rightStart = this.auxRect.getRightBeginPoint();
        const rightEnd = this.auxRect.getRigthEndPoint();

        const leftCenter = this.auxRect.getStartCenter();
        const rightCenter = this.auxRect.getEndCenter();

        this.moveTo(leftStart.toPaperPoint());
        this.lineTo(leftEnd.toPaperPoint());

        this.lineTo(leftCenter.toPaperPoint());
        this.lineTo(rightCenter.toPaperPoint());
        
        this.lineTo(rightStart.toPaperPoint());
        this.lineTo(rightEnd.toPaperPoint());
    
    }


}
