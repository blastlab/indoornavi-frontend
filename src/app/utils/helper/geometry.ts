import {Line, Point} from '../../map-editor/map.type';

export class Geometry {

  static getSlope(p1: Point, p2: Point): number {
    return (p1.y - p2.y) / (p1.x - p2.x);
  }

  static getDeltaY(p1: Point, p2: Point) {
    const arcRelocationValue = 22.5;

    const differenceBetweenPointsInX: number = p2.x - p1.x;
    const differenceBetweenPointsInY: number = p2.y - p1.y;

    const arcus: number = Math.asin((p2.y - p1.y) / Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))) * 180 / Math.PI;
    const radiansArc = (arcToRadians: number): number => arcToRadians * Math.PI / 180;
    const calculateDeltaY = (arcToCalculateTangensFrom: number): number => differenceBetweenPointsInX * Math.tan(radiansArc(arcToCalculateTangensFrom));
    let arcOfScale360: number;
    let arcToCalculate: number;
    let dy: number;

    if (arcus > 0) {
      arcOfScale360 = differenceBetweenPointsInX > 0 ? arcus : 180 - arcus;
    } else {
      arcOfScale360 = differenceBetweenPointsInX < 0 ? 180 - arcus : 360 + arcus;
    }
    // todo calculate proper margine
    if (arcOfScale360 % arcRelocationValue < 1) {
      const arcFloored: number = Math.floor(arcOfScale360);
      switch (arcFloored) {
        case 90:
        case 270:
          dy = differenceBetweenPointsInY;
          break;
        case 0:
        case 180:
          dy = 0;
          break;
        case 22:
        case 23:
          arcToCalculate = 22.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 67:
        case 68:
          arcToCalculate = 67.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 112:
        case 113:
          arcToCalculate = 112.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 157:
        case 158:
          arcToCalculate = 157.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 202:
        case 203:
          arcToCalculate = 202.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 247:
        case 248:
          arcToCalculate = 247.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 293:
        case 297:
          arcToCalculate = 293.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        case 337:
        case 338:
          arcToCalculate = 337.5;
          dy = calculateDeltaY(arcToCalculate);
          break;
        default:
          dy = differenceBetweenPointsInY
      }
      console.log('arc: ', arcOfScale360);
      console.log('dy: ', dy);
    } else {
      dy = differenceBetweenPointsInY;
    }
    return dy;
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
