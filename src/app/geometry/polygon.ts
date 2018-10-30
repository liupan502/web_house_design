import {Point} from './point'
import {Line} from './line';
import {Arc} from './arc';
import {Circle} from './circle'
import {Rect} from './rect'
import {Segment} from './segment'
import {BaseGeometry, GeometryType} from './base'
import {Path, CompoundPath, Point as PaperPoint} from 'paper'
import {PolygonPath} from '../path/path'
import * as MathUtil from '../math/math'
import {Vector2 as Vec2} from 'three'

export class Polygon extends BaseGeometry {
    protected segments_: Array<Segment>;

    // create segment base on start and end point, control point(tangent vector)
    static createSegment(startPoint:Point, endPoint:Point, handStartPoint:Vec2, handEndPoint:Vec2, previousSegment: Segment): Segment {
      let segment = null;
      if (MathUtil.vec2RoundToZero(handStartPoint)) {
        // line

        segment = new Line(startPoint, endPoint);
      } else {
        // arc
        const p = new Vec2(startPoint.x(), startPoint.y());
        const q = new Vec2(endPoint.x(), endPoint.y());

        const v = new Vec2(handStartPoint.y, -handStartPoint.x);
        const w = new Vec2(handEndPoint.y, -handEndPoint.x);
        const intersectedPoint = new Vec2(0.0, 0.0);
        MathUtil.lineIntersectLine(p, v, q, w, intersectedPoint);
        const center = new Point(intersectedPoint.x, intersectedPoint.y);
        //center.destoryPath();
        // calculate clockwise
        let clockwise = true;
        const temp = MathUtil.CreateVecBySubtraction(q, p);

        const crossValue = MathUtil.CrossProduction(handStartPoint, temp);
        if (crossValue < 0) {
          clockwise = false;
        }
        ////////////////////////////////////////////
        // for a half circle, paper will create two curves, so we need to merge them if their centers are very near
        // So for this case ,we do not create new segment but change the end point of the former segment.
        if (previousSegment != null) {
          if (previousSegment.type() == GeometryType.GEO_ARC) {
            const previousCenter = (<Arc>previousSegment).center();
            const centeristance = center.subtraction(previousCenter).length();
            if (centeristance < 0.5) {
              (<Arc>previousSegment).setIsAutoCenter(false);
              (<Arc>previousSegment).setEndPoint(endPoint);
              (<Arc>previousSegment).setIsAutoCenter(true);
              return segment;
            }
          }
        }
        segment = new Arc(startPoint, endPoint, center, clockwise);
      }
      return segment;
    }

    // Create polygon from path of paper.js
    static createPolygonFromPath(polygonPath: Path): Polygon {
      const newSegments = new Array<Segment>();
      const pathSegments = polygonPath.segments;
      const pathSegmentLength = pathSegments.length;

      if (pathSegmentLength < 1) {
        return null;
      }
      let totalPaperStartPoint, totalPaperEndPoint;
      let totalHandPaperStartPoint, totalHandPaperEndPoint;
      totalPaperEndPoint = pathSegments[0].point;
      totalHandPaperEndPoint = pathSegments[0].handleIn;

      for (let j = 0; j < pathSegmentLength - 1; j++) {
        const currentSegment = pathSegments[j];
        const nextSegment= pathSegments[j + 1];

        const startPaperPoint = currentSegment.point;
        const endPaperPoint = nextSegment.point;

        totalPaperStartPoint = nextSegment.point;
        totalHandPaperStartPoint = nextSegment.handleOut;
        const handPaperStartPoint = currentSegment.handleOut;
        const handPaperEndPoint = nextSegment.handleIn;

        const startPoint = new Point(startPaperPoint.x, startPaperPoint.y);
        const endPoint = new Point(endPaperPoint.x, endPaperPoint.y);
        const handStartPoint = new Vec2(handPaperStartPoint.x, handPaperStartPoint.y);

        const handEndPoint = new Vec2(handPaperEndPoint.x, handPaperEndPoint.y);

        const segmentLength = newSegments.length;
        let previousSegment = null;
        if (segmentLength > 0) {
          previousSegment = newSegments[segmentLength - 1];
        }

        const tmpSegment = this.createSegment(startPoint, endPoint, handStartPoint, handEndPoint, previousSegment);
        if (tmpSegment != null) {

          newSegments.push(tmpSegment);
        }
      }
      //////////////////////////////////////////
      // handle the endpoint to start point to close the path

      const startPoint = new Point(totalPaperStartPoint.x, totalPaperStartPoint.y);
      const endPoint = new Point(totalPaperEndPoint.x, totalPaperEndPoint.y);
      const handStartPoint = new Vec2(totalHandPaperStartPoint.x, totalHandPaperStartPoint.y);

      const handEndPoint = new Vec2(totalHandPaperEndPoint.x, totalHandPaperEndPoint.y);

      const distancePoint =endPoint.subtraction(startPoint);
      if (!MathUtil.vec2RoundToZero(distancePoint)) {
        const segmentLength = newSegments.length;
        let previousSegment = null;
        if (segmentLength > 0) {
          previousSegment = newSegments[segmentLength - 1];
        }
        const tmpSegment = this.createSegment(startPoint, endPoint, handStartPoint, handEndPoint, previousSegment);
        if (tmpSegment != null) {

          newSegments.push(tmpSegment);
        }
      } else {
        //console.log('too near, no need to add segment');
      }

      //////////////////////////////////////////

      const result = new Polygon(newSegments);

      return result;
    }
    // Use paper.js to do boolean operation(include unite, intersect, subtract and exclude)
    // Test that the running speed is twice that current method.
    static BooleanOperationForPolygon(p1: Polygon, p2: Polygon, operation: string): Polygon {
      const path1 = new PolygonPath(p1);
      path1.visible = false;
      path1.update();
      const path2 = new PolygonPath(p2);
      path2.update();
      path2.visible = false;

      let newPathItem;
      if (operation == 'unite') {
        newPathItem = path1.unite(path2);
      } else if (operation == 'intersect') {
        newPathItem = path1.intersect(path2);
      } else if (operation == 'subtract') {
        newPathItem = path1.subtract(path2);
      } else if (operation == 'exclude') {
        newPathItem = path1.exclude(path2);
      } else {
        const newSegments = new Array<Segment>();
        const result = new Polygon(newSegments);

        return result;
      }
      let newPath;
      if (newPathItem.className == 'Path') {
        newPath = <Path>(newPathItem);
      } else {
        // NOTICE: currently this logic only make sense to unite.
        // If the unite have a hole, this will be a compundPath,
        // For this case, we only need the outer path which have the bounding box to contain the bounding box of the interior path.
        newPath = <CompoundPath>(newPathItem);

        // get all paths
        const allPaths = newPath.children;
        const allPathLength = allPaths.length;

        let outRectangle = newPath.children[0].strokeBounds;
        let outIndex = 0;
        for (let i = 1; i < allPathLength; i++) {
          const currentRectangle = newPath.children[i].strokeBounds;

          // choose the one that have the biggest bounding box
          if (currentRectangle.contains(outRectangle)) {
            outRectangle = currentRectangle.clone();
            outIndex = i;
          }
        }
        newPath = newPath.children[outIndex];
      }

      const result = this.createPolygonFromPath(newPath);

      return result;

    }
    static unitesPolygons2(p1: Polygon, p2: Polygon): Polygon {

/*       console.log('unit start:');
      console.log('*****************************');
        const tmpSegments1 = p1.segments();
        for (let j = 0; j < tmpSegments1.length; j++) {
          if (tmpSegments1[j].type() == GeometryType.GEO_ARC) {
            console.log(tmpSegments1[j].startPoint().x() + '  ' + tmpSegments1[j].startPoint().y() + '  ' +
            tmpSegments1[j].endPoint().x() + '  ' + tmpSegments1[j].endPoint().y() + ' : ' +
            (<Arc>tmpSegments1[j]).center().x() + '  ' + (<Arc>tmpSegments1[j]).center().y());
          } else {
            console.log(tmpSegments1[j].startPoint().x() + '  ' + tmpSegments1[j].startPoint().y() + '  ' +
            tmpSegments1[j].endPoint().x() + '  ' + tmpSegments1[j].endPoint().y());
          }
        }

        console.log('*****************************');
        const tmpSegments2 = p2.segments();
        for (let j = 0; j < tmpSegments2.length; j++) {
          if (tmpSegments2[j].type() == GeometryType.GEO_ARC) {
            console.log(tmpSegments2[j].startPoint().x() + '  ' + tmpSegments2[j].startPoint().y() + '  ' +
            tmpSegments2[j].endPoint().x() + '  ' + tmpSegments2[j].endPoint().y() + ' : ' +
            (<Arc>tmpSegments2[j]).center().x() + '  ' + (<Arc>tmpSegments2[j]).center().y());
          } else {
            console.log(tmpSegments2[j].startPoint().x() + '  ' + tmpSegments2[j].startPoint().y() + '  ' +
            tmpSegments2[j].endPoint().x() + '  ' + tmpSegments2[j].endPoint().y());
          }
        }
        console.log('*****************************'); */

        /*const points = p1.points().concat(p2.points());
        let minX = points[0].x();
        let leftPoint = points[0];
        for (let i = 1; i < points.length; i++) {
            const tmpPoint = points[i];
            if (tmpPoint.x() < minX) {
                minX = tmpPoint.x();
                leftPoint = tmpPoint;
            }
        }*/
        let startPoint: Point = null;
        const points1 = p1.points();
        for (let i = 0; i < points1.length; i++) {
            const tmpPoint = points1[i];
            if ( !p2.containsInBBox(tmpPoint)) {
                startPoint = tmpPoint;
                break;
            }
        }

        if (startPoint === null) {
            const points2 = p2.points();
            for (let i = 0; i < points2.length; i++) {
                const tmpPoint = points1[i];
                if ( !p1.containsInBBox(tmpPoint)) {
                    startPoint = tmpPoint;
                    break;
                }
            }
        }

        if (startPoint === null) {
            return null;
        }

        let segment = p1.getSegmentByStartPoint(startPoint);
        let polygon = p1;
        let intersectedPolygon = p2;
        if (segment === null) {
            segment = p2.getSegmentByStartPoint(startPoint);
            polygon = p2;
            intersectedPolygon = p1;
        }
        const startSegment = segment;
        const newSegments = new Array<Segment>();
        let num = 100;
        while (num > 0) {
            num = num - 1;
            //console.log(num);
            if (newSegments.length  <  0) {
                // console.log(newSegments[newSegments.length - 1].startPoint().x() + "  "
                //                                     + newSegments[newSegments.length - 1].startPoint().y() + "  "
                //                                     + newSegments[newSegments.length - 1].endPoint().x() + "   "
                //                                     + newSegments[newSegments.length - 1].endPoint().y());
            }

            // console.log(segment.startPoint().x() + '  ' + segment.startPoint().y() + '  ' + segment.endPoint().x()
            //                 + '  ' + segment.endPoint().y());
            const tmpPoints1 = MathUtil.segmentIntersectPolygon(segment, intersectedPolygon);

            if (segment.endPoint() === startSegment.startPoint()) {
              if (tmpPoints1.length == 0 || segment.startPoint().equal(tmpPoints1[0])) {
                newSegments.push(segment);
                break;
              }
            }

            if (tmpPoints1.length > 0) {
                //console.log(tmpPoints1.length);
            }


            const halfLength = tmpPoints1.length / 2;
            const nextSegments = new Set<Segment>();
            let leftPoint: Point = null;
            let rightPoint: Point = null;
            for (let i = 0; i < halfLength; i++) {
                const tmpPoint = tmpPoints1[i * 2];
                const tmpSegment = <Segment>tmpPoints1[ i * 2 + 1];
                if (tmpSegment.type() !== GeometryType.GEO_LINE) {
                    continue;
                }

                const tmpLine = <Line> tmpSegment;
                if (segment.startPoint().equal(tmpPoint) || segment.endPoint().equal(tmpPoint)) {
                    const vec1 = segment.toVector().normalize();
                    const vec2 = tmpLine.toVector().normalize();

                    if (MathUtil.isZero(vec1.dot(vec2) - 1)) {
                        //let leftPoint: Point = tmpLine.startPoint();
                        //let rightPoint: Point = tmpLine.startPoint();
                        const tmpPoints2 = new Array<Point>();
                        tmpPoints2.push(tmpLine.startPoint());
                        tmpPoints2.push(segment.startPoint());
                        tmpPoints2.push(segment.endPoint());
                        tmpPoints2.push(tmpLine.endPoint());

                        for (let j = 0; j < tmpPoints2.length; j++) {
                            if (leftPoint === null) {
                                leftPoint = tmpPoints2[j];
                            } else if (tmpPoints2[j].x() < leftPoint.x()) {
                                leftPoint = tmpPoints2[j];
                            } else if ( tmpPoints2[j].x() === leftPoint.x() && tmpPoints2[j].y() < leftPoint.y() ) {
                                leftPoint = tmpPoints2[j];
                            }

                            if (rightPoint === null) {
                                rightPoint = tmpPoints2[j];
                            } else if (tmpPoints2[j].x() > rightPoint.x()) {
                                rightPoint = tmpPoints2[j];
                            } else if ( tmpPoints2[j].x() === rightPoint.x() && tmpPoints2[j].y() > rightPoint.y()) {
                                rightPoint = tmpPoints2[j];
                            }

                        }

                        if (nextSegments.has(tmpLine)) {
                            nextSegments.delete(tmpLine);
                        }

                        nextSegments.add(intersectedPolygon.getSegmentByStartPoint(tmpLine.endPoint()));
                    }
                }
            }

            if (leftPoint !== null && rightPoint !== null) {
                const tmpSegment = new Line(leftPoint, rightPoint);
                const tmpArray = Array.from(nextSegments);
                const nextSegment = tmpArray[0];
                if (nextSegment === null) {
                    console.log('this is null value');
                }
                if (nextSegment.startPoint().equal(leftPoint)) {
                    tmpSegment.swapPoints();
                }
                newSegments.push(tmpSegment);

                if (tmpSegment.endPoint() === startSegment.startPoint()) {
                  break;
                }

                segment = nextSegment;
                const tmpPolygon = polygon;
                polygon = intersectedPolygon;
                intersectedPolygon = tmpPolygon;
                continue;

            }

            // 去除交点中的线段的端点
            const tmpPoints = new Array<any>();
            for (let i = 0; i < tmpPoints1.length / 2; i++) {
                const tmpPoint = tmpPoints1[i * 2];
                if (segment.startPoint().equal(tmpPoint) || segment.endPoint().equal(tmpPoint)) {
                    continue;
                }
                tmpPoints.push(tmpPoints1[i * 2]);
                tmpPoints.push(tmpPoints1[i * 2 + 1]);
            }
            if (tmpPoints.length === 0) {
                const newSegment = segment.clone();
                newSegments.push(newSegment);
                segment = polygon.getSegmentByStartPoint(segment.endPoint());
                continue;
            }

            // 找到距离起始点最近的点
            let minDistance = segment.getDistanceToStartPoint(<Point>tmpPoints[0]);
            let minSegment = <Segment>tmpPoints[1];
            let minIntersectedPoint = (<Point>tmpPoints[0]);

            for (let i = 1; i < halfLength; i++) {
                const tmpDistance = segment.getDistanceToStartPoint(<Point>tmpPoints[i * 2]);
                if (minDistance > tmpDistance) {
                    minDistance = tmpDistance;
                    minSegment = <Segment> tmpPoints[i * 2 + 1];
                    minIntersectedPoint = <Point>tmpPoints[i * 2];
                }
            }

            const newSegment = <Segment>segment.clone();
            if (newSegment.type() == GeometryType.GEO_ARC) {
              (<Arc> newSegment).setIsAutoCenter(false);
            }
            newSegment.setEndPoint(minIntersectedPoint);
            newSegments.push(newSegment);
            if (newSegment.type() == GeometryType.GEO_ARC) {
              (<Arc> newSegment).setIsAutoCenter(true);
            }

            segment = minSegment.clone();
            if (segment.type() == GeometryType.GEO_ARC) {
              (<Arc> segment).setIsAutoCenter(false);
            }
            segment.setStartPoint(minIntersectedPoint);

            if (segment.type() == GeometryType.GEO_ARC) {
              (<Arc> segment).setIsAutoCenter(true);
            }

            const tmpPolygon = polygon;
            polygon = intersectedPolygon;
            intersectedPolygon = tmpPolygon;
        }

        const result = new Polygon(newSegments);

        return result;
    }

    deserialize(input) {
        // 先画 segment
        super.deserialize(input);

        /**     GEO_NONE = 0,
    GEO_LINE = 1,
    GEO_ARC = 2,
    GEO_POLYGON = 3,
    GEO_POINT = 4,
    GEO_CIRCLE = 5,
    GEO_RECT = 6,*/
        for (let i = 0; i < input.segments_.length; i++) {
            const seginfo = input.segments_[i];
            if ( seginfo.type_ === GeometryType.GEO_ARC) {
                const seg = new Arc(new Point(0, 0), new Point(0, 0), new Point(0, 0)).deserialize(seginfo);
                this.segments_.push(seg);
            } else if (seginfo.type_ === GeometryType.GEO_LINE) {
                const seg = new Line(new Point(0, 0) , new Point(0, 0)).deserialize(seginfo);
                this.segments_.push(seg);
            }
        }


        return this;
    }

    constructor( segments: Array<Segment>) {
        super();
        this.type_ = GeometryType.GEO_POLYGON;
        this.segments_ = new Array<Segment>();
        if (segments.length < 1) {
            return;
        }

        for (let i = 0; i < segments.length; i++) {
            this.segments_.push(segments[i]);
        }
        // this.path_ = new PolygonPath(this);


    }


    points(): Array<Point> {
        const points = new Array<Point>();
        for (let i = 0; i < this.segments_.length; i++) {
            points.push(this.segments_[i].startPoint());
        }
        return points;
    }

    static fromPoints(points:Array<Point>):Polygon {
        const segs = [];
        let p = points[0];
        for(let i = 0, il = points.length - 1; i < il; ++i) {
            const pn = points[i + 1];
            segs.push(new Line(p.clone(), pn.clone()));
            p = pn;
        }
        segs.push(new Line(p.clone(), points[0].clone()));
        return new Polygon(segs);
    }

    segments(): Array<Segment> {
        return this.segments_;
    }

    addToPath(path: Path) {

    }

    isClockwise(): boolean {
        const points = this.points();
        let maxY = points[0].y();
        let maxYIndex = 0;
        for (let i = 0; i < points.length; i++) {
            if (maxY < points[i].y()) {
                maxY = points[i].y();
                maxYIndex = i;
            } else if (maxY === points[i].y() && points[i].x() > points[maxYIndex].x()) {
                maxY = points[i].y();
                maxYIndex = i;
            }
        }
        const previousPointIndex = (points.length + maxYIndex - 1) % points.length;
        const nextPointIndex = (maxYIndex + 1) % points.length;
        const previousPoint = points[previousPointIndex];
        const point = points[maxYIndex];
        const nextPoint = points[nextPointIndex];
        const vecP = point.subtraction(previousPoint).normalize();
        const vecQ = nextPoint.subtraction(point).normalize();
        const val = vecP.x * vecQ.y - vecP.y * vecQ.x;
        if (val > 0) {
            return true;
        } else {
            return false;
        }

    }

    getBBox(): Array<Point>{
      const segmentLength = this.segments_.length;
      if (segmentLength == 0) {
        return null;
      }

      let currentPoints = this.segments_[0].getBBox();
      for (let i = 1; i < this.segments_.length; i++) {
        const nextPoints =this.segments_[i].getBBox();
        if (nextPoints.length == 2 && currentPoints.length == 2) {
          // union bounding box
          if (currentPoints[0].x() > nextPoints[0].x()) {
            currentPoints[0].setX(nextPoints[0].x());
          }
          if (currentPoints[0].y() > nextPoints[0].y()) {
            currentPoints[0].setY(nextPoints[0].y());
          }
          if (currentPoints[1].x() < nextPoints[1].x()) {
            currentPoints[1].setX(nextPoints[1].x());
          }
          if (currentPoints[1].y() < nextPoints[1].y()) {
            currentPoints[1].setY(nextPoints[1].y());
          }
        }
      }

      return currentPoints;
    }

    containsInBBox(point: Point): boolean {
      const points =this.getBBox();
      const pointsLength = points.length;

      if (pointsLength < 2) {
        return false;
      } else {
        const leftTopPoint = points[0];
        const rightBottomPoint = points[1];

        if (point.x() >= leftTopPoint.x() && point.x() <= rightBottomPoint.x() &&
            point.y() >= leftTopPoint.y() && point.y() <= rightBottomPoint.y()) {
          return true;
        } else {
          return false;
        }
      }
    }

    /**
     * 检查多边形是否包含指定点
     * @param point
     */
    contains(point: Point, consideOnEdge = true): boolean {

        const points = new Array<Point>();
        for (let i = 0; i < this.segments_.length; i++) {
            const tmpPoint = this.segments_[i].pointAtX(point.x());
            if (tmpPoint !== null && point.y() > tmpPoint.y()) {
                if (tmpPoint.equal(point)) {
                    if(consideOnEdge) {
                    return true;
                    } else {
                        return false;
                    }
                }
                //console.log('i is :' + i.toString());
                points.push(tmpPoint);
            }
        }

        const pointNum = points.length;
        //console.log('pointnum is:');
        //console.log(pointNum);
        if (pointNum % 2 === 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 交换多边形中的每一个segment的起点和终点
     */
    swapSegmentPoints() {
        const tmpSegments = new Array<Segment>();
        for (let i = this.segments_.length - 1; i >= 0; i--) {
            const segment = this.segments_[i];
            segment.swapPoints();
            tmpSegments.push(segment);
        }
        this.segments_ = tmpSegments;
    }

    /**
     * 获取起点是指定point的segment
     * @param point
     */
    getSegmentByStartPoint(point: Point): Segment {
        for (let i = 0; i < this.segments_.length ; i++) {
            const segment = this.segments_[i];
            if  (point.equal(segment.startPoint())) {
                return segment;
            }
        }

        return null;
    }

    /**
     * 获取指定segment的下一个segment
     * @param segment
     */
    nextSegment(segment: Segment): Segment {
        const length = this.segments_.length;
        for (let i = 0; i < length; i++) {
            const tmpSegment = this.segments_[i];
            if (tmpSegment === segment) {
                return this.segments_[(i + 1) % length];
            }
        }

        return null;
    }

    /**
     * 获取指定segment的前一个segment
     * @param segment
     */
    preSegment(segment: Segment): Segment {
        return null;
    }

    clone(): Polygon {
        const result = new Polygon(this.segments_);
        return result;
    }

     /**
     * 生成geometry的凸点集合，用于进行计算
     * 这些信息足够绝大多数 几何判断
     */
    generateOuterPoints(): Array<PaperPoint> {
        const pointinfo = new Array<PaperPoint>();
        const points = this.points();
        for(let i = 0; i < points.length; i++ ){
            pointinfo.push(points[i].toPaperPoint());
        }

        return pointinfo;
    }

}
