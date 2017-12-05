import {Line, Point} from '../../../map-editor/map.type';

export class Geometry {

  static getSlope(p1: Point, p2: Point): number {
    return (p1.y - p2.y) / (p1.x - p2.x);
  }

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
