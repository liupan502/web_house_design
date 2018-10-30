import { state } from '@angular/animations';
import { Line, LineType, Circle, Point, Arc, Polygon, GeometryType, Segment, BaseGeometry } from '../geometry/geometry'
import { Vector2 as Vec2 } from 'three'
import * as VecUtil from './vector'
import { isZero, CrossProduction, AreVectorsParallel, vec2RoundToZero } from './math'
import { Path, Matrix, Point as PaperPoint } from 'paper'
import { BasePath, PathGeoRelation, PathDrawType, GeoRelationInfo } from '../path/path'
import { Vec2ToRadian} from './math'

function rectsIntersect(startPoint1: Point, endPoint1: Point, startPoint2: Point, endPoint2: Point) {
  const minX1 = Math.min(startPoint1.x(), endPoint1.x());
  const maxX1 = Math.max(startPoint1.x(), endPoint1.x());
  const minX2 = Math.min(startPoint2.x(), endPoint2.x());
  const maxX2 = Math.max(startPoint2.x(), endPoint2.x());

  const minY1 = Math.min(startPoint1.y(), endPoint1.y());
  const maxY1 = Math.max(startPoint1.y(), endPoint1.y());
  const minY2 = Math.min(startPoint2.y(), endPoint2.y())
  const maxY2 = Math.max(startPoint2.y(), endPoint2.y());

  if (minY1 <= maxY2 && minY2 <= maxY1 && minX1 <= maxX2 && minX2 <= maxX1) {
    return true;
  }

  return false;
}

export function getDistanceFromPointToLine(line1: Line, point: Point, interPoint: Point): number {
  if (line1.contains(point)) {
    interPoint.setX(point.x());
    interPoint.setY(point.y());
    return 0;
  }

  const lineStartPoint = new Vec2(line1.startPoint().x(), line1.startPoint().y());
  const lineDirection = line1.toVector().normalize();

  const perpenStarPoint = new Vec2(point.x(), point.y());
  const perpenDirection = new Vec2(-1 * lineDirection.y, lineDirection.x);
  let intersectedPoint = new Vec2(0.0, 0.0);
  lineIntersectLine(perpenStarPoint, perpenDirection, lineStartPoint, lineDirection, intersectedPoint);

  interPoint.setX(intersectedPoint.x);
  interPoint.setY(intersectedPoint.y);
  return intersectedPoint.sub(perpenStarPoint).length();
}
export function getDistanceFromPointToLineSegment(line1: Line, point: Point): number {
  let interPoint = new Point(0, 0);

  let minDistance = getDistanceFromPointToLine(line1, point, interPoint);
  if (!line1.contains(interPoint)) {
    const dist1 = point.subtraction(line1.startPoint()).length();
    const dist2 = point.subtraction(line1.endPoint()).length();
    minDistance = Math.min(dist1, dist2);
  }
  return minDistance;

}

// judge if one line segment intersct with another one
// line1 start with P1 and end with P2, line2 start with Q1 and end with Q2
// if line1 cross line2, means that P1P2 cross Q1Q2
// P1 and P2 stand two side of Q1Q2 or Q1 and Q2 stand two side of P1P2
export function islineSegmentIntersectLineSegment(line1: Line, line2: Line): boolean {

  const startPoint1 = line1.startPoint();
  const endPoint1 = line1.endPoint();
  const startPoint2 = line2.startPoint();
  const endPoint2 = line2.endPoint();
  const minX1 = Math.min(startPoint1.x(), endPoint1.x());
  const maxX1 = Math.max(startPoint1.x(), endPoint1.x());
  const minX2 = Math.min(startPoint2.x(), endPoint2.x());
  const maxX2 = Math.max(startPoint2.x(), endPoint2.x());

  const minY1 = Math.min(startPoint1.y(), endPoint1.y());
  const maxY1 = Math.max(startPoint1.y(), endPoint1.y());
  const minY2 = Math.min(startPoint2.y(), endPoint2.y())
  const maxY2 = Math.max(startPoint2.y(), endPoint2.y());

  // rect check
  const rectIntesect = minY1 <= maxY2 && minY2 <= maxY1 && minX1 <= maxX2 && minX2 <= maxX1;

  if (!rectIntesect) {
    // handle case for precious error so that miss to check connection
    const dist1 = getDistanceFromPointToLineSegment(line1, line2.startPoint());
    const dist2 = getDistanceFromPointToLineSegment(line1, line2.endPoint());
    const dist3 = getDistanceFromPointToLineSegment(line2, line1.startPoint());
    const dist4 = getDistanceFromPointToLineSegment(line2, line1.endPoint());
    if (isZero(dist1) || isZero(dist2) || isZero(dist3) || isZero(dist4)) {
      return true;
    } else {
      return false;
    }
  }

  const lineDirection1 = line1.endPoint().subtraction(line1.startPoint());
  const vec1 = line2.startPoint().subtraction(line1.startPoint());
  const vec2 = line2.endPoint().subtraction(line1.startPoint());

  const crossValue1 = CrossProduction(vec1, lineDirection1);
  const crossValue2 = CrossProduction(vec2, lineDirection1);


  const lineDirection2 = line2.endPoint().subtraction(line2.startPoint());
  const vec3 = line1.startPoint().subtraction(line2.startPoint());
  const vec4 = line1.endPoint().subtraction(line2.startPoint());

  const crossValue3 = CrossProduction(vec3, lineDirection2);
  const crossValue4 = CrossProduction(vec4, lineDirection2);

  const result1 = crossValue1 * crossValue2;
  const result2 = crossValue3 * crossValue4;
  if (result1 > 0 || result1 > 0) {
    // precious error
    if (isZero(result1) || isZero(result2)) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

// judge if one line(or arc) has intersection point with another one line(or arc)
export function isSegmentIntersectSegment(segment1: Segment, segment2: Segment): boolean {
  let result;
  if (segment1.type() == GeometryType.GEO_LINE && segment2.type() == GeometryType.GEO_LINE) {
    return islineSegmentIntersectLineSegment(<Line>segment1, <Line>segment2);
  } else if (segment1.type() == GeometryType.GEO_ARC && segment2.type() == GeometryType.GEO_LINE) {
    result = lineSegmentIntersectArc(<Line>segment2, <Arc>segment1);
  } else if (segment1.type() == GeometryType.GEO_LINE && segment2.type() == GeometryType.GEO_ARC) {
    result = lineSegmentIntersectArc(<Line>segment1, <Arc>segment2);
  } else {
    result = arcIntersectArc(<Arc>segment1, <Arc>segment2);
  }
  if (result.length != 0) {
    return true;
  } else {
    return false;
  }
}

export function  lineInterSectPolygon(fromLine: Line, toPolygon: Polygon) : Array<Point>{
     let result = new Array<Point>();
     const segs = toPolygon.segments();

     for(let i = 0; i < segs.length; i++) {
        if(segs[i] instanceof Line) {
            // 将直线转换成向量表达
            const leftStartV = new Vec2(fromLine.startPoint().x(), fromLine.endPoint().y());
            const leftDirectV = fromLine.endPoint().subtraction(fromLine.startPoint());

            const rightStartV = new Vec2(segs[i].startPoint().x(), segs[i].endPoint().y());
            const rightDirectV = segs[i].endPoint().subtraction(segs[i].startPoint());
            
            const intersectV = new Vec2(0,0);
            // 计算交点
            const intersectResult = lineIntersectLine(leftStartV,leftDirectV, rightStartV,rightDirectV, intersectV);
            if(intersectResult) {
              const vpoint = new Point(intersectV.x,intersectV.y);
              const prjpoint = projectPointToLine(vpoint,fromLine);
              if(!segs[i].contains(vpoint) || !fromLine.contains(vpoint)) {
                continue;
              }
               
              result.push(new Point(intersectV.x,intersectV.y));
              console.log('[geomerty.ts]lineInterSectPolygon');
              console.log(vpoint);
              console.log(fromLine);
              console.log(segs[i]);
            } 


        } else if(segs[i] instanceof Arc) {
            const arcinfo = <Arc>segs[i];
            const intersectResult = lineSegmentIntersectArc(fromLine, arcinfo);
            if(intersectResult) {
                result = result.concat(intersectResult);
            }
        }
     }

     
     return result;
}


// Compute the intersection point of two lines.
// Line 1: p + v * t1,   Line 2:  q + w * t2
// u = p - q
// So for the intersection points, t1 = t1 = cross(w,u) / cross(v,w)
export function lineIntersectLine(p: Vec2, v: Vec2, q: Vec2, w: Vec2, intersectedPoint: Vec2): boolean {

  const u = VecUtil.CreateVecBySubtraction(p, q);
  const isParallel = VecUtil.AreVectorsParallel(v, w);
  if (isParallel) {
    // DO NOT HANDLE PARALLEL CASE!!
    return false;
  }


  const cross1 = VecUtil.CrossProduction(w, u);
  const cross2 = VecUtil.CrossProduction(v, w);

  const t = cross1 / cross2;

  intersectedPoint.setX(p.x + t * v.x);
  intersectedPoint.setY(p.y + t * v.y);
  return true;
}


// solve equation to get the intersection of line and circle.
export function lineIntersectCircle(line: Line, circle: Circle): Array<Point> {
  // start point and end point of line
  const P1 = line.startPoint();
  const P2 = line.endPoint();

  const P3 = circle.center();

  const r = circle.radius();

  const A = (P2.x() - P1.x()) * (P2.x() - P1.x()) + (P2.y() - P1.y()) * (P2.y() - P1.y());
  const B = 2 * ((P2.x() - P1.x()) * (P1.x() - P3.x()) + (P2.y() - P1.y()) * (P1.y() - P3.y()));
  const C = P3.x() * P3.x() + P3.y() * P3.y() + P1.x() * P1.x() + P1.y() * P1.y() -
    2 * (P3.x() * P1.x() + P3.y() * P1.y()) - r * r;

  const result = new Array<Point>();

  if (B * B - 4 * A * C >= 0) {
    let u1 = (-1 * B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    let u2 = (-1 * B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);



    const vec1 = P2.subtraction(P1);
    const vec2 = new Vec2(P1.x(), P1.y());

    const vecCandidate1 = new Vec2(vec1.x * u1, vec1.y * u1);
    const vecCandidate2 = new Vec2(vec1.x * u2, vec1.y * u2);

    const candidate1 = VecUtil.CreateVecByAdd(vec2, vecCandidate1);
    const candidate_point1 = new Point(candidate1.x, candidate1.y);

    const candidate2 = VecUtil.CreateVecByAdd(vec2, vecCandidate2);
    const candidate_point2 = new Point(candidate2.x, candidate2.y);

    if (isZero(B * B - 4 * A * C)) {
      // only one intersection point
      result.push(candidate_point1);
    } else {
      // two intersection points
      result.push(candidate_point1);
      result.push(candidate_point2);
    }
  }
  return result;
}


export function lineSegmentIntersectArc(line: Line, arc: Arc): Array<Point> {
  /*   console.log('lineIntersectArc: before');
    console.log(line.startPoint().x() + '  ' + line.startPoint().y() + '  ' +
    line.endPoint().x() + '  ' + line.endPoint().y());

    console.log(arc.startPoint().x() + '  ' + arc.startPoint().y() + '  ' +
    arc.endPoint().x() + '  ' + arc.endPoint().y() + '  :  ' +
     arc.center().x() + '  ' + arc.center().y()); */

  // start point and end point of line
  const center = arc.center();
  const radius = arc.radius();
  const tmpCircle = new Circle(center, radius);

  const tmpPoints = lineIntersectCircle(line, tmpCircle);
  const result = new Array<Point>();

  for (let i = 0; i < tmpPoints.length; i++) {
    if (arc.contains(tmpPoints[i]) && line.contains(tmpPoints[i])) {
      result.push(tmpPoints[i]);
    }
  }

  /*   console.log('lineIntersectArc: after');
    console.log(line.startPoint().x() + '  ' + line.startPoint().y() + '  ' +
    line.endPoint().x() + '  ' + line.endPoint().y());

    console.log(arc.startPoint().x() + '  ' + arc.startPoint().y() + '  ' +
    arc.endPoint().x() + '  ' + arc.endPoint().y() + '  :  ' +
     arc.center().x() + '  ' + arc.center().y()); */

  return result;
}

// solve equation to get the intersection of circle and circle.
export function CircleIntersectCricle(c1: Circle, c2: Circle): Array<Point> {

  const result = new Array<Point>();
  const vec = c2.center().subtraction(c1.center()).length();

  // non-intersect
  if (vec > c1.radius() + c2.radius()) {
    return result;
  }
  const slope_x = c2.center().x() - c1.center().x();
  const slope_y = c2.center().y() - c1.center().y();
  const radius1 = c1.radius();
  const radius2 = c2.radius();


  const r = (slope_x * slope_x + slope_y * slope_y + radius1 * radius1 - radius2 * radius2) / 2;

  let inter_y1 = 0;
  let inter_y2 = 0;

  let inter_x1 = 0;
  let inter_x2 = 0;
  if (slope_x == 0 && slope_y != 0) {
    // vertical
    inter_y1 = r / slope_y;
    inter_y2 = inter_y1;

    inter_x1 = Math.sqrt(radius1 * radius1 - inter_y1 * inter_y1);
    inter_x2 = -inter_x1;
  } else if (slope_x != 0 && slope_y == 0) {
    // horizontal
    inter_x1 = r / slope_x;
    inter_x2 = inter_x1;

    inter_y1 = Math.sqrt(radius1 * radius1 - inter_x1 * inter_x1);
    inter_y2 = -inter_y1;
  } else if (slope_x != 0 && slope_y != 0) {
    const delta = slope_y * slope_y * r * r -
      (slope_x * slope_x + slope_y * slope_y) * (r * r - radius1 * radius1 * slope_x * slope_x);

    inter_y1 = (slope_y * r + Math.sqrt(delta)) / (slope_x * slope_x + slope_y * slope_y);
    inter_y2 = (slope_y * r - Math.sqrt(delta)) / (slope_x * slope_x + slope_y * slope_y);

    inter_x1 = (r - slope_y * inter_y1) / slope_x;
    inter_x2 = (r - slope_y * inter_y2) / slope_x;
  }
  inter_x1 += c1.center().x();
  inter_y1 += c1.center().y();

  inter_x2 += c1.center().x();
  inter_y2 += c1.center().y();

  // two intersection points, choose the one that have the same side with the end point of a1
  const point1 = new Point(inter_x1, inter_y1);
  const point2 = new Point(inter_x2, inter_y2);
  if (inter_x1 == inter_x2 && inter_y1 == inter_y2) {
    result.push(point1);
  } else {
    result.push(point1);
    result.push(point2);
  }

  return result;
}

export function arcIntersectArc(a1: Arc, a2: Arc): Array<Point> {
  /*   console.log('arcIntersectArc: before');
    console.log(a1.startPoint().x() + '  ' + a1.startPoint().y() + '  ' +
    a1.endPoint().x() + '  ' + a1.endPoint().y() + '  :  ' +
     a1.center().x() + '  ' + a1.center().y());

    console.log(a2.startPoint().x() + '  ' + a2.startPoint().y() + '  ' +
    a2.endPoint().x() + '  ' + a2.endPoint().y() + '  :  ' +
     a2.center().x() + '  ' + a2.center().y()); */


  const c1 = a1.center();
  const r1 = a1.radius();
  const circle1 = new Circle(c1, r1);

  const c2 = a2.center();
  const r2 = a2.radius();
  const circle2 = new Circle(c2, r2);

  const tmpPoints = CircleIntersectCricle(circle1, circle2);
  const result = new Array<Point>();
  for (let i = 0; i < tmpPoints.length; i++) {
    if (a1.contains(tmpPoints[i]) && a2.contains(tmpPoints[i])) {
      result.push(tmpPoints[i]);
    }
  }
  /*   console.log('arcIntersectArc: after');
    console.log(a1.startPoint().x() + '  ' + a1.startPoint().y() + '  ' +
    a1.endPoint().x() + '  ' + a1.endPoint().y() + '  :  ' +
     a1.center().x() + '  ' + a1.center().y());

    console.log(a2.startPoint().x() + '  ' + a2.startPoint().y() + '  ' +
    a2.endPoint().x() + '  ' + a2.endPoint().y() + '  :  ' +
     a2.center().x() + '  ' + a2.center().y()); */


  return result;
}


export function segmentIntersectSegment(s1: Segment, s2: Segment): Array<Point> {
  let result = new Array<Point>();
  if (s1.type() === GeometryType.GEO_LINE) {
    if (s2.type() === GeometryType.GEO_LINE) {
      const tmpPoint = new Point(0.0, 0.0);
      const doIntersect = Line.DoIntersectWith(<Line>s1, <Line>s2, tmpPoint);
      if (doIntersect) {
        result.push(tmpPoint);
      }
    } else if (s2.type() === GeometryType.GEO_ARC) {
      result = lineSegmentIntersectArc(<Line>s1, <Arc>s2);
    }
  } else if (s1.type() === GeometryType.GEO_ARC) {
    if (s2.type() === GeometryType.GEO_LINE) {
      result = lineSegmentIntersectArc(<Line>s2, <Arc>s1);
    } else if (s2.type() === GeometryType.GEO_ARC) {
      result = arcIntersectArc(<Arc>s1, <Arc>s2);
    }

  }

  return result;
}




/**
 * result: point1, segment1, point2, segment2, ...
 * @param s
 * @param p
 */


export function segmentIntersectPolygon(s: Segment, p: Polygon): Array<any> {
  const result = new Array<any>();
  const segments = p.segments();
  for (let i = 0; i < segments.length; i++) {
    /*       console.log('segmentIntersectPolygon: two segment');
          if (s.type() == GeometryType.GEO_ARC) {
            console.log(s.startPoint().x() + '  ' + s.startPoint().y() + '  ' +
            s.endPoint().x() + '  ' + s.endPoint().y() + ' : ' +
            (<Arc>s).center().x() + '  ' + (<Arc>s).center().y());
          } else {
            console.log(s.startPoint().x() + '  ' + s.startPoint().y() + '  ' +
            s.endPoint().x() + '  ' + s.endPoint().y());
          }

          if (segments[i].type() == GeometryType.GEO_ARC) {
            console.log(segments[i].startPoint().x() + '  ' + segments[i].startPoint().y() + '  ' +
            segments[i].endPoint().x() + '  ' + segments[i].endPoint().y() + ' : ' +
            (<Arc>segments[i]).center().x() + '  ' + (<Arc>segments[i]).center().y());
          } else {
            console.log(segments[i].startPoint().x() + '  ' + segments[i].startPoint().y() + '  ' +
            segments[i].endPoint().x() + '  ' + segments[i].endPoint().y());
          } */


    const tmpPoints = segmentIntersectSegment(s, segments[i]);
    ///////////////////////////
    if (tmpPoints.length >= 2) {
      // if candidate is more than 2, choose the one that is nearest to the start point of arc
      let minDistance = 1.0e+6;
      let minIndex = -1;

      let arcSegment;
      if (s.type() == GeometryType.GEO_ARC) {
        arcSegment = <Segment>s.clone();
      } else {
        arcSegment = <Segment>segments[i].clone();
      }

      for (let j = 0; j < tmpPoints.length; j++) {
        const tmpDistance = arcSegment.getDistanceToStartPoint(tmpPoints[j]);
        if (tmpDistance < minDistance) {
          minDistance = tmpDistance;
          minIndex = j;
        }
      }

      if (minIndex != -1) {
        result.push(tmpPoints[minIndex]);
        result.push(segments[i]);
      }
    } else if (tmpPoints.length == 1) {
      result.push(tmpPoints[0]);
      result.push(segments[i]);
    }
  }
  return result;
}

// 返回object上任意一点和直线上任意一点的最近距离
export function findNearEndPointDistanceInLine(info: Object, line: Segment): number {
  if (info instanceof Point) {
    return (line.startPoint().distanceTo(info) > line.endPoint().distanceTo(info)) ?
      line.endPoint().distanceTo(info) : line.startPoint().distanceTo(info);
  } else {
    return null;
  }
}

// 将几何体投影到一条直线上
export function projectPointToLine(point: Point, line: Segment): Point {
  const paperStart = line.startPoint().toPaperPoint();
  const paperEnd = line.endPoint().toPaperPoint();
  const paperP = point.toPaperPoint();

  // 构造矢量
  const vl = paperEnd.subtract(paperStart);
  const vs = paperP.subtract(paperStart);

  // 投影计算
  const vproject = vs.project(vl);

  // 返回结果
  const projectpos = paperStart.add(vproject);

  return new Point(projectpos.x, projectpos.y);

}

// 判断p1, 能否和p2,p3 组成以p1为轴的直角
export function tryBuildRectAngle(p1: Point, p2: Point, p3: Point): boolean {
  if (p1 === null || p2 === null || p3 === null) {
    return false;
  }



  if (p2.distanceTo(p3) < 10 || p1.distanceTo(p2) < 10 || p1.distanceTo(p3) < 10) {
    return false;
  }

  const otherline = new Line(p1, p2);
  const projp = projectPointToLine(p3, otherline);

  const distance = projp.distanceTo(p1);
  if (distance < 5) {
    // 计算交点
    return true;

  } else {
    return false;
  }
}

export function rotateLine(line1: any, arcangle: number): void {
  const paperline = new Path.Line(line1.startPoint().toPaperPoint(),
    line1.endPoint().toPaperPoint());

  paperline.rotate(arcangle * 180.0 / Math.PI, line1.startPoint().toPaperPoint());

  const newEndPoint = new Point(paperline.firstCurve.point2.x, paperline.firstCurve.point2.y);
  line1.setEndPoint(newEndPoint);
  paperline.remove();
}


// export function rotateArc(arc1: Arc, arcangle: number): void {
//   const center = arc1.center();
//   center.rotate(arcangle * 180.0 / Math.PI , arc1.startPoint().toPaperPoint());


//   const paperline = new Path.Arc(arc1.startPoint().toPaperPoint(),
//   arc1.endPoint().toPaperPoint());

//   arc1.rotate(arcangle * 180.0 / Math.PI , arc1.startPoint().toPaperPoint());

//   const newEndPoint = new Point(paperline.firstCurve.point2.x,paperline.firstCurve.point2.y);
//   arc1.setEndPoint(newEndPoint);
//   paperline.remove();


// }


// sort all segments with clockwise
export function sortSegmentArray(segments: Array<Segment>) {

  let segmentLenth = segments.length;
  if (segmentLenth == 0) {
    return;
  }
  let clockWiseSegments = new Array<Segment>();
  clockWiseSegments.push(segments[0].clone());
  let endPoint = segments[0].endPoint();
  segments.splice(0, 1);
  segmentLenth = segments.length;

  while (segmentLenth != 0) {
    let exist = false;
    for (let j = 0; j < segmentLenth; ++j) {
      const segment = segments[j].clone();
      if (!endPoint.equal(segment.startPoint()) && !endPoint.equal(segment.endPoint())) {
        continue;
      }
      if (endPoint.equal(segment.endPoint())) {
        segment.swapPoints();
      }
      exist = true;
      clockWiseSegments.push(segment.clone());
      endPoint = segment.endPoint();
      segments.splice(j, 1);
      break;
    }
    if (exist === false) {
      // erro happen
      break;
    }
    segmentLenth = segments.length;
  }

  segments.length = 0;
  segmentLenth = clockWiseSegments.length;

  const polygon = new Polygon(clockWiseSegments);
  if (!polygon.isClockwise()) {
    polygon.swapSegmentPoints();
  }

  for (let j = 0; j < segmentLenth; ++j) {
    segments.push(polygon.segments()[j]);
  }
}

// calculate if line1 is contained in line2.
export function lineContain(line1: Line, line2: Line): Boolean {
  return line2.contains(line1.startPoint()) && line2.contains(line1.endPoint());
}


// merge two bounding boxes
function mergeBBox(bboX1: Array<Point>, bBox2: Array<Point>): Array<Point> {
  const length1 = bboX1.length;
  const length2 = bBox2.length;
  if (length1 != 2 || length2 != 2) {
    return null;
  }

  let currentPoints = new Array<Point>();
  let nextPoints = new Array<Point>();
  for (let i = 0; i < 2; ++i) {
    currentPoints.push(bboX1[i].clone());
    nextPoints.push(bBox2[i].clone());
  }
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
  return currentPoints;
}


// merge two lines if overlap each other
export function mergeStraightLine(line1: Line, line2: Line): Line {
  const line1Direction = line1.toVector().normalize();
  const line2Direction = line2.toVector().normalize();
  if (!AreVectorsParallel(line1Direction, line2Direction)) {
    return null;
  }
  let mergedStartPoint = null;
  let mergedEndPoint = null;

  const tmpLine1 = line1.clone();
  const tmpLine2 = line2.clone();
  tmpLine1.setLineType(LineType.LINE_SEGMENT);
  tmpLine2.setLineType(LineType.LINE_SEGMENT);
  if (lineContain(tmpLine1, tmpLine2)) {
    mergedStartPoint = line2.startPoint().clone();
    mergedEndPoint = line2.endPoint().clone();
  } else if (lineContain(tmpLine2, tmpLine1)) {
    mergedStartPoint = line1.startPoint().clone();
    mergedEndPoint = line1.endPoint().clone();
  } else {
    const containStart = (<Line>tmpLine2).contains(tmpLine1.startPoint());
    const containEnd = (<Line>tmpLine2).contains(tmpLine1.endPoint());

    const dotVal = line1Direction.dot(line2Direction);
    const isSameDirection = isZero(dotVal - 1.0);
    // exist overlap
    if (containStart) {
      if (isSameDirection) {
        mergedStartPoint = line2.startPoint();
        mergedEndPoint = line1.endPoint();
      } else {
        mergedStartPoint = line2.endPoint();
        mergedEndPoint = line1.endPoint();
      }
    } else if (containEnd) {
      if (isSameDirection) {
        mergedStartPoint = line1.startPoint();
        mergedEndPoint = line2.endPoint();
      } else {
        mergedStartPoint = line1.startPoint();
        mergedEndPoint = line2.startPoint();
      }
    } else {
      // if one line type is LINE, merge them though they are disconect
      if (line1.lineType() == LineType.LINE || line2.lineType() == LineType.LINE) {
        const box1 = line1.getBBox();
        const box2 = line2.getBBox();
        const mergeedBox = mergeBBox(box1, box2);
        if (mergeedBox) {
          mergedStartPoint = mergeedBox[0].clone();
          mergedEndPoint = mergeedBox[1].clone();
        }
      }
    }
  }

  if (mergedStartPoint && mergedEndPoint) {
    return new Line(mergedStartPoint, mergedEndPoint);
  } else {
    return null;
  }

}


// Merge straight line which has same direction and connect at the end point
export function mergeCurves(curves: Array<Segment>): void {
  let curvesLenth = curves.length;

  let i = 0;
  while (i < curvesLenth) {
    const index = i % curvesLenth;
    const tmpSegment = curves[index];
    const nextIndex = (i + 1) % curvesLenth;
    const tmpNextSegment = curves[nextIndex];
    if (tmpSegment.type() == GeometryType.GEO_LINE &&
      tmpNextSegment.type() == GeometryType.GEO_LINE) {
      const vec1 = tmpSegment.toVector().normalize();
      const vec2 = tmpNextSegment.toVector().normalize();

      const isParallel = AreVectorsParallel(vec1, vec2);
      const distance = tmpSegment.endPoint().subtraction(tmpNextSegment.startPoint());

      if (AreVectorsParallel(vec1, vec2) &&
        vec2RoundToZero(distance)) {
        tmpSegment.setEndPoint(tmpNextSegment.endPoint());
        curves.splice(nextIndex, 1);
        curvesLenth = curves.length;
      }
    }
    i++;
  }
}


// when computing the interction of line and arc of offset, we should treat them as line and circle
// because we should 'expand' the arc for a little.
// flag:   if 0, line to intersect with arc, if 1 arc to intersect with line
// if line to intersect with arc, we choose the point near the end point of line
// if arc to intersect with line, we choose the point near the start point of line
export function getIntersectionOfLineAndArcOffset(line: Line, arc: Arc, flag: number): Array<Point> {
  const center = arc.center();
  const radius = arc.radius();
  const tmpCircle = new Circle(center, radius);

  const tmpPoints = lineIntersectCircle(line, tmpCircle);
  const result = new Array<Point>();

  let minDistance = 1.0e+6;
  let minIndex = -1;

  let standardPoint;
  if (flag == 0) {
    standardPoint = line.endPoint().clone();
  } else {
    standardPoint = line.startPoint().clone();
  }

  for (let i = 0; i < tmpPoints.length; i++) {
    const distance = tmpPoints[i].subtraction(standardPoint).length();
    if (distance < minDistance) {
      minDistance = distance;
      minIndex = i;
    }
  }

  if (minIndex != -1) {
    result.push(tmpPoints[minIndex]);
  }
  return result;
}


export function getIntersectionOfArcAndArcOffset(a1: Arc, a2: Arc): Array<Point> {
  const c1 = a1.center();
  const r1 = a1.radius();
  const circle1 = new Circle(c1, r1);

  const c2 = a2.center();
  const r2 = a2.radius();
  const circle2 = new Circle(c2, r2);

  const tmpPoints = CircleIntersectCricle(circle1, circle2);
  const result = new Array<Point>();


  let minDistance = 1.0e+6;
  let minIndex = -1;

  let tmpDistance;
  // choose the point that is 'near'(arc length) the start point of arc
  for (let i = 0; i < tmpPoints.length; i++) {
    if (a1.contains(tmpPoints[i])) {
      tmpDistance = a1.getDistance(tmpPoints[i], a1.endPoint());
    }
    if (tmpDistance < minDistance) {
      minDistance = tmpDistance;
      minIndex = i;
    }
  }
  result.push(tmpPoints[minIndex]);

  return result;
}

function offsetLine(line: Line, offset: number): Line {
  const vec = line.toVector();
  vec.normalize();
  const normalVec = new Vec2(vec.y, -vec.x);
  normalVec.multiplyScalar(offset);
  const newStartPoint = new Point(line.startPoint().x() + normalVec.x,
    line.startPoint().y() + normalVec.y);
  const newEndPoint = new Point(line.endPoint().x() + normalVec.x,
    line.endPoint().y() + normalVec.y);
  const newLine = new Line(newStartPoint, newEndPoint);
  return newLine;
}

function offsetArc(arc: Arc, offset: number): Arc {
  const center = arc.center();
  const startPoint = arc.startPoint();
  const startVec = startPoint.subtraction(center);
  const radius = startVec.length() + offset;
  startVec.normalize();
  startVec.multiplyScalar(radius);
  const newStartPoint = new Point(center.x() + startVec.x,
    center.y() + startVec.y);
  const endPoint = arc.endPoint();
  const endVec = endPoint.subtraction(center);
  endVec.normalize();
  endVec.multiplyScalar(radius);
  const newEndPoint = new Point(center.x() + endVec.x,
    center.y() + endVec.y);

  const newArc = new Arc(newStartPoint, newEndPoint, center, arc.isClockwise());
  return newArc;
}

// simply offset each curve without update the intersection point.
export function offsetCurvesInternal(curves: Array<Segment>, offset: number): Array<Segment> {

  let startIndex = 0;

  const segments = new Array<Segment>();
  for (let i = 0; i < curves.length; i++) {
    const index = (i + startIndex) % curves.length;
    const tmpSegment = curves[index].clone();
    if (tmpSegment.type() !== GeometryType.GEO_LINE) {
      segments.push(tmpSegment);
      continue;
    }
    while (true) {
      const nextIndex = (i + 1 + startIndex) % curves.length;
      const tmpNextSegment = curves[nextIndex];
      if (tmpNextSegment.type() !== GeometryType.GEO_LINE) {
        break;
      }
      const vec1 = tmpSegment.toVector().normalize();
      const vec2 = tmpNextSegment.toVector().normalize();
      if (!isZero(vec1.dot(vec2) - 1)) {
        break;
      }
      tmpSegment.setEndPoint(tmpNextSegment.endPoint());
      i++;
    }
    segments.push(tmpSegment);
  }

  ////////////////////////////


  const offsetCurves = new Array<Segment>();
  for (let i = 0; i < segments.length; i++) {
    const curve = segments[i];
    // const attachedOpening = this.getOpeningByWall(curve);
    // if (attachedOpening !== null) {
    //     offset = attachedOpening.width();
    // }

    switch (curve.type()) {
      case GeometryType.GEO_LINE: {
        const newLine = offsetLine(<Line>curve, offset);
        newLine.setLineType(LineType.LINE);
        offsetCurves.push(newLine);
        break;
      }

      case GeometryType.GEO_ARC: {
        const arc = <Arc>curve;
        const newArc = offsetArc(arc, offset);
        offsetCurves.push(newArc);
        break;
      }

      default:
        break;
    }
  }

  return offsetCurves;
}


// offset curves and update the intersection points.
export function GenerateOffsetCurves(curves: Array<Segment>, offset: number): Array<Segment> {
  // simply offset each curve
  const offsetCurves = offsetCurvesInternal(curves, offset);
  const length = offsetCurves.length;
  const p1 = curves[0].startPoint();
  const p2 = curves[curves.length - 1].endPoint();
  const flag = p1.equal(p2);

  const startIndex = 0;

  // update intersection points
  for (let i = 0; i < length; i++) {
    const preIndex = (startIndex + i + length - 1) % length;
    const nextIndex = (startIndex + i + 1) % length;
    const index = (startIndex + i) % length;
    const preSegment = offsetCurves[preIndex];
    const segment = offsetCurves[index];
    // let crossPoint: Geo.Point = null;
    let tmpPoints = new Array<Point>();
    if (preSegment.type() === GeometryType.GEO_LINE) {
      if (segment.type() === GeometryType.GEO_LINE) {
        const tmpPoint = new Point(0.0, 0.0);
        const result = Line.DoIntersectWith(<Line>preSegment, <Line>segment, tmpPoint);
        if (result) {
          tmpPoints.push(tmpPoint);
        }
      } else if (segment.type() === GeometryType.GEO_ARC) {
        tmpPoints = getIntersectionOfLineAndArcOffset(<Line>preSegment, <Arc>segment, 0);
      }
    } else if (preSegment.type() === GeometryType.GEO_ARC) {
      if (segment.type() === GeometryType.GEO_LINE) {
        tmpPoints = getIntersectionOfLineAndArcOffset(<Line>segment, <Arc>preSegment, 1);
      } else if (segment.type() === GeometryType.GEO_ARC) {
        tmpPoints = getIntersectionOfArcAndArcOffset(<Arc>preSegment, <Arc>segment);
      }
    }

    let crossPoint: Point = null;
    if (tmpPoints.length === 1) {
      crossPoint = tmpPoints[0];
    } else if (tmpPoints.length === 2) {
      const center = (<Arc>segment).center();
      const vec1 = tmpPoints[0].subtraction(center).normalize();
      const vec2 = tmpPoints[0].subtraction(center).normalize();
      if (CrossProduction(vec1, vec2) > 0) {
        crossPoint = tmpPoints[0];
      } else {
        crossPoint = tmpPoints[1];
      }
    }

    if (crossPoint !== null) {
      if (flag) {
        // fix the center of arc
        if (preSegment.type() == GeometryType.GEO_ARC) {
          (<Arc>preSegment).setIsAutoCenter(false);
        }
        if (segment.type() == GeometryType.GEO_ARC) {
          (<Arc>segment).setIsAutoCenter(false);
        }
        preSegment.setEndPoint(crossPoint);
        segment.setStartPoint(crossPoint);

        // resume the status so that the center of arc could be modificable
        if (preSegment.type() == GeometryType.GEO_ARC) {
          (<Arc>preSegment).setIsAutoCenter(true);
        }
        if (segment.type() == GeometryType.GEO_ARC) {
          (<Arc>segment).setIsAutoCenter(true);
        }
      }
    }
  }

  for (let i = 0; i < offsetCurves.length; i++) {
    if (offsetCurves[i].type() === GeometryType.GEO_LINE) {
      (<Line>offsetCurves[i]).setLineType(LineType.LINE_SEGMENT);
    }
  }

  const tmpSegments = new Array<Segment>();
  for (let i = 0; i < offsetCurves.length; i++) {
    if (offsetCurves[i].startPoint().equal(offsetCurves[i].endPoint())) {
      continue;
    }
    tmpSegments.push(offsetCurves[i].clone());
  }
  return tmpSegments;
}




/**
 * 按照X坐标大小对点集排序
 * @param a
 * @param b
 */
export function sortByPointX(a: any, b: any) {
  if (a === null) {
    return -1;
  }

  if (b === null) {
    return 1;
  }

  if (typeof a.x === 'number') {
    return a.x - b.x;
  } else {
    return a.x() - b.x();
  }
}

/**
 * 按照Y坐标大小对点集排序
 * @param a
 * @param b
 */
export function sortByPointY(a: any, b: any) {
  if (a === null) {
    return -1;
  }

  if (b === null) {
    return 1;
  }


  if (typeof a.y === 'number') {
    return a.y - b.y;
  } else {
    return a.y() - b.y();
  }
}

/**
 * 判断包围盒是否相交
 * @param rfirst
 * @param rsecond
 */
export function checkBBoxOverLap(rfirst: Array<Point>, rsecond: Array<Point>) {
  if (rfirst === null || rsecond === null) {
    return false;
  }
  const result1 = (rfirst[0].x() - rsecond[1].x()); // A.X1 < B.X2:
  const result2 = (rfirst[1].x() - rsecond[0].x());  // A.X2 > B.X1
  const result3 = (rfirst[0].y() - rsecond[1].y()); // A.Y1 < B.Y2
  const result4 = (rfirst[1].y() - rsecond[0].y()); // A.Y2 > B.Y1

  return (result1 < 0 && result2 > 0 && result3 < 0 && result4 > 0);
}

/**
 * 判断线段与另一个几何体的某一条边重叠
 * @param line
 * @param geo
 */
function isLineOverLapGeometry(line: Line, geo: BaseGeometry, matrix: Matrix): Array<Point> {
  const outpoints = geo.generateOuterPoints();

  // 依此将几何的边界投射到直线上
  for (let i = 0; i < outpoints.length; i++) {
    const fromid = i;
    const toid = (i === (outpoints.length - 1)) ? 0 : i + 1;
    const transfromed1 = outpoints[fromid].transform(matrix);
    const transfromed2 = outpoints[toid].transform(matrix);


    const pleft = new Point(transfromed1.x, transfromed1.y);
    const pright = new Point(transfromed2.x, transfromed2.y);

    const pleftNeareast = projectPointToLine(pleft, line);
    const prightNeareast = projectPointToLine(pright, line);

    // 判断投影点
    if (!(pleftNeareast.distanceTo(pleft) < 1e-3 && prightNeareast.distanceTo(pright) < 1e-3)) {
      continue;
    }

    const leftToTwosides = pleft.distanceTo(line.startPoint()) + pleft.distanceTo(line.endPoint());
    const rightToTwosides = pright.distanceTo(line.startPoint()) + pright.distanceTo(line.endPoint());
    if (leftToTwosides > (line.length() + 1) || rightToTwosides > (line.length() + 1)) {
      continue;
    }
    // 判断是否是重合

    const pointArray = new Array<Point>();
    pointArray.push(pleftNeareast);
    pointArray.push(prightNeareast);
    return pointArray;

  }

  return null;
}

/**
 * 对
 * @param seg
 * @param geo
 */
export function CalcGeoRelationShip(seg: Segment, geo: BaseGeometry, matrix: Matrix): GeoRelationInfo {
  if (seg instanceof Line) {
    //判断线段与另一个几何体的某一条边重叠
    const pointArray = isLineOverLapGeometry(seg, geo, matrix);
    if (pointArray !== null) {
      const result = new GeoRelationInfo(PathGeoRelation.PATH_CONSISTING, pointArray);
      return result;
    }
  }

  return null;
}

/**
 * 从起点处构建法线，并返回法线的终点
 * @param startPoint   线段起点 
 * @param endPoint     线段终点
 * @param length       法线长度
 * @param lengthlimit  长度限制（线段长度不可小于该值)   
 * @param bup 方向(顺时针/逆时针)
 */
export function findalign(startPoint: Point, endPoint: Point, length: number, lengthlimit: number , bup: Boolean): Point {
  let alignx = (endPoint.y() - startPoint.y());
  let aligny = (startPoint.x() - endPoint.x());
  const sqrtnum = Math.sqrt(alignx * alignx + aligny * aligny);
  if (sqrtnum < lengthlimit) {
      return null;
  }
  alignx = (bup === true) ? alignx / sqrtnum * length : -alignx / sqrtnum * length;
  aligny = (bup === true) ? aligny / sqrtnum * length : -aligny / sqrtnum * length;

  return new Point(startPoint.x() + alignx, startPoint.y() + aligny);
}

export function moveTowardsPoint(fromPoint: Point, toPoint: Point, moveLength: number): Point {
   const v2 =   toPoint.subtraction(fromPoint); 
   const lengthV =  v2.normalize().multiplyScalar(moveLength);

   const newpoint = new Point(fromPoint.x() + lengthV.x , fromPoint.y() + lengthV.y);
   return newpoint;
}


// winding number test for a point in a polygon
// input argument:
// currentPoint: the tested point
// polygon: the ordered polygon, notice that the polygon is a loop,
// that is to say, the end point of polygon should be the start point of polygon
// currently if the polygon is not closed, we treate as invalid argument and directly return false
// if needed, we could close the polygon if not closed and continue to do check.
// http://geomalgorithms.com/a03-_inclusion.html
export function isPointInPolygon(currentPoint: Point, polygon: Array<Segment>): boolean {
  let wn = 0;
  // loop through all edges of the polygon
  const wallLength = polygon.length;
  if (wallLength < 2) {
    // invlid input argument
    return false;
  }
  const vec = polygon[0].startPoint().subtraction(polygon[wallLength - 1].endPoint()).length();
  if (!isZero(vec)) {
    // invlid input argument
    return false;
  }

  for (let i = 0; i < wallLength; ++i) {
    const startPoint = polygon[i].startPoint();
    const endPoint = polygon[i].endPoint();
    if (startPoint.y() <= currentPoint.y()) {
      if (endPoint.y() > currentPoint.y()) {
        const v1 = endPoint.subtraction(startPoint);
        const v2 = currentPoint.subtraction(startPoint);
        const crossValue = CrossProduction(v1, v2);
        if (crossValue > 0) {
          ++wn;
        }
      }
    } else {
      if (endPoint.y() <= currentPoint.y()) {
        const v1 = endPoint.subtraction(startPoint);
        const v2 = currentPoint.subtraction(startPoint);
        const crossValue = CrossProduction(v1, v2);
        if (crossValue < 0) {
          --wn;
        }
      }
    }
  }
  if (wn != 0) {
    return true;
  } else {
    return false;
  }
}


export function findParrellInPolygonWithDistance(polygon: Polygon | Array<Segment>, segment: Segment,distance: number): Segment {
   let result = null;
   let segments = null;
   if(polygon instanceof Polygon) {
     segments = polygon.segments();
   } else if(polygon instanceof Array){
     segments = polygon;
   }

   for(let i = 0; i < segments.length; i++) {
        // 检查是否‘平行’
        if(segment instanceof Line && segments[i] instanceof Line) {
           const isParallel =  segment.isParallel(<Line>segments[i]);
           if(!isParallel) {
             continue;
           }

           //const segdistance = segment.distanceFromPoint(segments[i].startPoint());
           const prjPoint = projectPointToLine(segments[i].startPoint(),segment);
           const segdistance = prjPoint.distanceTo(segments[i].startPoint());
           // const segdistance =  tempLine.
           if(Math.abs(segdistance - distance) > 1e-2) {
             continue;
           }
            
           return segments[i];

        } else if(segment instanceof Arc && segments[i] instanceof Arc) {
          const samecenter =   segment.center().equal((<Arc>segments[i]).center());
          if(!samecenter) {
            continue;
          }

          const segdistance = (<Arc>segments[i]).radius() - segment.radius();
          if(Math.abs(segdistance - distance) > 1e-2) {
            continue;
          }

          return segments[i];          
        }


        // 获取距离

   }


   return result;
}

export function  generateRectWithParrelLine(segmentfrom:Segment , segmentTo:Segment): Polygon{
    const polygonSeg = new Array<Segment>();
    const toSegStart = segmentTo.startPoint();
    const toSegStop = segmentTo.endPoint();

    const firstAttach = (segmentfrom.endPoint().distanceTo(toSegStart) >
                  segmentfrom.endPoint().distanceTo(toSegStop)) ? toSegStop : toSegStart;
    
    const secondAttach = (firstAttach === toSegStart) ? toSegStop : toSegStart;

    const firstAttachLine = new Line(segmentfrom.endPoint(), firstAttach);
    const secondAttachLIne = new Line(secondAttach, segmentfrom.startPoint());

    let toAttah = null
   
    if(segmentfrom instanceof Line) { 
       toAttah = new Line(firstAttach, secondAttach);
    } else if(segmentfrom instanceof Arc) {
       const arcto = <Arc>segmentTo;
       toAttah = (firstAttach === toSegStart) ? new Arc(arcto.startPoint(),arcto.endPoint(),
      arcto.center()) : new Arc(arcto.endPoint(), arcto.startPoint(), arcto.center(),false);
    }

    polygonSeg.push(segmentfrom);
    polygonSeg.push(firstAttachLine);
    polygonSeg.push(toAttah);
    polygonSeg.push(secondAttachLIne);

    return new Polygon(polygonSeg);
}



/**
 * 根据指定的对角线和垂边法线方向，绘制矩形
 * @param from 
 * @param to 
 * @param degreeAngle 
 */
export function formatRectDirectAndAngle(from: Point, to: Point, degreeAngle: number): Array<Point>{
    const arrayInfo = new Array<Point>();
    const offsetx = to.subtraction(from).x;
    const offsety = to.subtraction(from).y;


 
    const radian = degreeAngle * Math.PI / 180.0;


    // 确认基准矩形的长宽
    const width = Math.abs( offsetx * Math.cos(radian) + offsety * Math.sin(radian));
    const length = Math.abs( offsety * Math.cos(radian) - offsetx * Math.sin(radian));  


    // 确认基准矩形的4个角点
    const firstPointAlongClock = new Point(from.x(), from.y());
    const secondPointAlongClock = new Point(from.x() + width , from.y());
    const thridPointAlongClock = new Point(from.x() + width, from.y() + length);
    const fourthPointAlongClock = new Point(from.x() , from.y() + length);


    const paperRect = new Path.Rectangle(firstPointAlongClock.toPaperPoint(),thridPointAlongClock.toPaperPoint());
    // 依据在旋转后的坐标系位置判断是否翻转
    const xafterRotate = offsetx * Math.cos(radian) + offsety * Math.sin(radian);
    const yafterRotate = offsety * Math.cos(radian) - offsetx * Math.sin(radian);

    const needflipx = (xafterRotate > 0) ? 1 : -1;
    const needflipy = (yafterRotate > 0) ? 1 : -1;

    paperRect.scale(needflipx, needflipy, firstPointAlongClock.toPaperPoint());

    //旋转
    paperRect.rotate(degreeAngle, firstPointAlongClock.toPaperPoint());



    ///test code 
    if(from.distanceTo(to) > 30) {
       const stophere = 0;
    }
    ///test code 


    const segs = paperRect.segments;
    const paperfirst = segs[1].curve.point1;
    const papersecond = segs[2].curve.point1;
    const paperthird = segs[3].curve.point1;
    const paperfourth = segs[0].curve.point1;

    arrayInfo.push(new Point(paperfirst.x, paperfirst.y));
    arrayInfo.push(new Point(papersecond.x, papersecond.y));
    arrayInfo.push(new Point(paperthird.x, paperthird.y));
    arrayInfo.push(new Point(paperfourth.x , paperfourth.y));

    return arrayInfo;
}

export function findXOnSegByY(yvalue: number, seg:Segment) {
    const result = new Array<Point>();
    if(seg instanceof Arc) {
      const absYvalue = Math.abs( yvalue -seg.center().x());
      if(absYvalue > seg.radius()) {
        return null;
      }
      const xvalue = Math.sqrt( Math.pow(seg.radius(),2.0) - Math.pow(absYvalue, 2.0));

      const pointLeft = new Point(seg.center().x() + xvalue, yvalue );
      const pointRight = new Point(seg.center().x() - xvalue, yvalue);
      if(seg.contains(pointLeft)) {
         result.push(pointLeft);
      }

      if(seg.contains(pointRight)) {
        result.push(pointRight);
      }
        
    } else if(seg instanceof Line) {
      const pointinf = seg.pointAtY(yvalue);
      if(!pointinf) {
        return null;
      }
      result.push(pointinf);
    }

    if(result.length > 0) {
      return result;
    }
    else {
      return null;
    }

}

export function  findYOnSegByX(xvalue: number, seg: Segment): Array<Point> {
     const result = new Array<Point>();
     if(seg instanceof Arc) {
         const absXvalue = Math.abs(xvalue -seg.center().x());
         if(absXvalue > seg.radius()) {
           return null;
         }
         const yvalue = Math.sqrt( Math.pow(seg.radius(),2.0) - Math.pow(absXvalue, 2.0));

         const pointUp = new Point(xvalue, seg.center().y() + yvalue);
         const pointDown = new Point(xvalue, seg.center().y() - yvalue);

         if(seg.contains(pointUp)) {
           result.push(pointUp);
         }

         if(seg.contains(pointDown)) {
           result.push(pointDown);
         }

     } else if(seg instanceof Line){
       const pointval = seg.pointAtX(xvalue);
       if(!pointval) {
          return null;
       }

       result.push(pointval);

     } else {
       console.error("[Math]findXOnSegByY not implemented for this seg type");
       return null;
     }

     if(result.length > 0) {
       return result;
     } else {
       return null;
     }


}

