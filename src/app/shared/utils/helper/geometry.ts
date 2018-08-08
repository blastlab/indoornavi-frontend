import {Line, Point} from '../../../map-editor/map.type';
import {Box} from '../drawing/drawing.types';

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
    let arcPositionValueClockwise: number = Math.floor((360 - Geometry.calculateDegree(p1, p2) + (arcPitchRelocationValue / 2)) / arcPitchRelocationValue);
    arcPositionValueClockwise = arcPositionValueClockwise === 0 ? 16 : arcPositionValueClockwise; // multiplying by 0 is null,
    const calculateDeltaY = (arcToCalculateTangentFrom: number): number => differenceBetweenPointsInX * Math.tan(radiansArc(arcToCalculateTangentFrom));
    return arcPositionValueClockwise === 12 || arcPositionValueClockwise === 4 ? null : calculateDeltaY(arcPositionValueClockwise * arcPitchRelocationValue);
  }

  static getVerticalEndingOffset(line: Line, endSize: number): number {
    const slope = this.getSlope(line.startPoint, line.endPoint);
    if (isNaN(slope)) {
      return 0;
    }
    return endSize * Math.cos(Math.atan(slope));
  }

  static getHorizontalEndingOffset(line: Line, endSize: number): number {
    const slope = this.getSlope(line.startPoint, line.endPoint);
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

  static areCoordinatesInGivenRange(coordinates: Point, range: Box): boolean {
    if (!!coordinates) {
      return !(coordinates.x < range.x || coordinates.y < range.y || coordinates.x > range.width || coordinates.y > range.height);
    }
    return false;
  }

  static isSamePoint(firstPoint: Point, lastPoint: Point): boolean {
    return Math.floor(firstPoint.x) === Math.floor(lastPoint.x) && Math.floor(firstPoint.y) === Math.floor(lastPoint.y);
  }

  static intersection(firstSection: Line, secondSection: Line): Point {
    const firstSlope: number = Geometry.getSlope(firstSection.startPoint, firstSection.endPoint);
    const secondSlope: number = Geometry.getSlope(secondSection.startPoint, secondSection.endPoint);
    if (firstSlope === secondSlope) {
      return null;
    }
    const precision = 0.01;
    const isBetween = (first: number, middle: number, last: number): boolean => {
      return first - precision <= middle && middle <= last + precision;
    };
    const x1: number = firstSection.startPoint.x;
    const y1: number = firstSection.startPoint.y;
    const x2: number = firstSection.endPoint.x;
    const y2: number = firstSection.endPoint.y;
    const x3: number = secondSection.startPoint.x;
    const y3: number = secondSection.startPoint.y;
    const x4: number = secondSection.endPoint.x;
    const y4: number = secondSection.endPoint.y;

    const x_section: number = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    const y_section: number = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x_section) || isNaN(y_section)) {
      return null;
    } else {
      if (x1 >= x2) {
        if (!isBetween(x2, x_section, x1)) {
          return null;
        }
      } else {
        if (!isBetween(x1, x_section, x2)) {
          return null;
        }
      }
      if (y1 >= y2) {
        if (!isBetween(y2, y_section, y1)) {
          return null;
        }
      } else {
        if (!isBetween(y1, y_section, y2)) {
          return null;
        }
      }
      if (x3 >= x4) {
        if (!isBetween(x4, x_section, x3)) {
          return null;
        }
      } else {
        if (!isBetween(x3, x_section, x4)) {
          return null;
        }
      }
      if (y3 >= y4) {
        if (!isBetween(y4, y_section, y3)) {
          return null;
        }
      } else {
        if (!isBetween(y3, y_section, y4)) {
          return null;
        }
      }
    }
    return {x: Math.floor(x_section), y: Math.floor(y_section)};

  }

}
