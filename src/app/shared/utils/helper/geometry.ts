import {Line, Point} from '../../../map-editor/map.type';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {log} from 'util';

export class Geometry {

  static getSlope(p1: Point, p2: Point): number {
    return (p1.y - p2.y) / (p1.x - p2.x);
  }

  static getDeltaY(p1: Point, p2: Point): number {
    // arcRelocationValue value can be in the future set to other value to increase or decrease angular pitch precision
    const arcPitchRelocationValue = 22.5;
    const differenceBetweenPointsInX: number = p2.x - p1.x;
    const radiansArc = (arcToRadians: number): number => arcToRadians * Math.PI / 180;
    // calculate angular p1 position regarding to p2 and 0X axis
    let arcPositionValueClockwise: number =  Math.floor((360 - Geometry.calculateDegree(p1 , p2) + (arcPitchRelocationValue / 2)) / arcPitchRelocationValue);
    arcPositionValueClockwise = arcPositionValueClockwise === 0 ? 16 : arcPositionValueClockwise; // multiplying by 0 is null,
    const calculateDeltaY = (arcToCalculateTangentFrom: number): number => differenceBetweenPointsInX * Math.tan(radiansArc(arcToCalculateTangentFrom));
    return arcPositionValueClockwise === 12 || arcPositionValueClockwise === 4 ? null : calculateDeltaY(arcPositionValueClockwise * arcPitchRelocationValue);
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

  static calculateDistanceInPixels(lengthInPixels: number, lengthInCentimeters: number, realDistance: number): number {
    return lengthInPixels / lengthInCentimeters * realDistance;
  }

  static calculateDistanceInCentimeters(lengthInPixels: number, lengthInCentimeters: number, pixelDistance: number): number {
    return lengthInCentimeters / lengthInPixels * pixelDistance;
  }

  static calculatePointPositionInPixels(lengthInPixels: number, lengthInCentimeters: number, point: Point): Point {
    return {
      x: Geometry.calculateDistanceInPixels(lengthInPixels, lengthInCentimeters, point.x),
      y: Geometry.calculateDistanceInPixels(lengthInPixels, lengthInCentimeters, point.y)
    };
  }

  static calculatePointPositionInCentimeters(lengthInPixels: number, lengthInCentimeters: number, point: Point): Point {
    return {
      x: Geometry.calculateDistanceInCentimeters(lengthInPixels, lengthInCentimeters, point.x),
      y: Geometry.calculateDistanceInCentimeters(lengthInPixels, lengthInCentimeters, point.y)
    };
  }

}
