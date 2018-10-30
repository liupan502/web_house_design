
import {BaseEntity} from './entity'
import { Point, Line } from '../../geometry/geometry'
import {Path, Point as PaperPoint} from 'paper'
export class Background extends BaseEntity {
    static step = 50.0;
    static backgroundWidth = 10000;
    static backgroundHeight = 10000;
    protected colNum_: number;
    protected rowNum_: number;
    protected width_: number;
    protected height_: number;
    protected center_: Point;
    protected strokeColor_: string;



    constructor(width: number, height: number, centerX: number, centerY: number,
                    ) {
        super();
        this.width_ = width;
        this.height_ = height;
        this.center_ = new Point(centerX, centerY);
        this.strokeColor_ = 'black';

    }

    colNum(): number {
        return this.colNum_;
    }

    setColNum(colNum: number) {
        this.colNum_ = colNum;

        // entity 只处理数据，数据更新后维护isDirty，视图层即知晓需要更新视图
        this.isDirty_ = true;
    }

    rowNum(): number {
        return this.rowNum_;
    }

    setRowNum(rowNum: number) {
        this.rowNum_ = rowNum;
        this.isDirty_ = true;
    }

    height(): number {
        return this.height_;
    }

    setHeight(height: number) {
        this.height_ = height;
        this.isDirty_ = true;
    }

    width(): number {
        return this.width_;
    }

    setWidth(width: number) {
        this.width_ = width;
        this.isDirty_ = true;
    }

    center(): Point {
        return this.center_;
    }

    setCenter(center: Point) {
        this.center_ = center;
        this.isDirty_ = true;
    }

    updatePath() {

        const halfWidth = Background.backgroundWidth / 2.0;
        const halfHeight = Background.backgroundHeight / 2.0;
        const halfWidthStepNum = halfWidth / Background.step;
        const halfHeightStepNum = halfHeight / Background.step;

        const horizontalLines: Array<Line> = new Array<Line>();
        for ( let i = 0; i <= halfHeightStepNum; i++ ) {
            const y = i * Background.step;
            const line1 = new Line(new Point(-halfWidth, y), new Point(halfWidth, y));
            horizontalLines.push(line1);
            // horizontalLines.concat(line1);
            if (i !== 0) {
                const line2 = new Line(new Point(-halfWidth, -y), new Point(halfWidth, -y));
                horizontalLines.push(line2);
            }

        }

        for (let i = 0; i < horizontalLines.length; i++) {
            // path.moveTo(horizontalLines[i].startPoint().toPaperPoint());
            // path.lineTo(horizontalLines[i].endPoint().toPaperPoint());
            const path  = new Path();
            path.strokeColor = this.strokeColor_;
            const point1 = horizontalLines[i].startPoint().toPaperPoint();
            const point2 = horizontalLines[i].endPoint().toPaperPoint();
            path.moveTo(point1);
            path.lineTo(point2);
            path.opacity = 0.3;
            // break;
        }

        const verticalLines: Array<Line> = new Array<Line>();
        for (let i = 0; i <= halfWidthStepNum; i++) {
            const x = i * Background.step;
            const line1 = new Line(new Point(x, halfHeight), new Point(x, -halfHeight));
            verticalLines.push(line1);

            if (i !== 0) {
                const line2 = new Line(new Point(-x, halfHeight), new Point(-x, -halfHeight));
                verticalLines.push(line2);
            }
        }

        for (let i = 0; i < verticalLines.length; i++) {
            const path  = new Path();
            path.strokeColor = this.strokeColor_;
            path.opacity = 0.3;
            
            path.moveTo(verticalLines[i].startPoint().toPaperPoint());
            path.lineTo(verticalLines[i].endPoint().toPaperPoint());
        }
    }

    ///???
    setStrokeColor(strokeColor: string) {
        this.strokeColor_ = strokeColor;
        this.isDirty_ = true;
    }
}
