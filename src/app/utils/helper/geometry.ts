import {Line, Point} from '../../map-editor/map.type';

export class Geometry {

  static getSlope(p1: Point, p2: Point): number {
    return (p1.y - p2.y) / (p1.x - p2.x);
  }

  static getArcus(p1: Point, p2: Point) {
    const x_DifferenceBetweenPoints = p2.x - p1.x;
    const arc = Math.asin((p2.y - p1.y) / Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))) * 180 / Math.PI;
    if (arc > 0) {
      return x_DifferenceBetweenPoints > 0 ? arc : 180 - arc;
    } else {
      return x_DifferenceBetweenPoints < 0 ? 180 - arc : 360 + arc;
    }
  };

  static getVerticalEndingOffset( line: Line, endSize: number): number {
    const slope = this.getSlope(line.p1, line.p2);
    if (isNaN(slope)) {
      return 0;
    }
    return endSize * Math.cos(Math.atan(slope));
  }

  static getHorizontalEndingOffset( line: Line, endSize: number): number {
    const slope = this.getSlope(line.p1, line.p2);
    if (isNaN(slope)) {
      return 0;
    }
    return endSize * Math.sin(Math.atan(slope));
  }

  static getDistanceBetweenTwoPoints(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static calculateDegree(p1: Point, p2: Point): number {
    const rad2deg = 180 / Math.PI;
    const degree = Math.atan2((p1.y - p2.y), (p2.x - p1.x)) * rad2deg;
    return ((degree < 0) ? 360 + degree : degree);
  }
}
