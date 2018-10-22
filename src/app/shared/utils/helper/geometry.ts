import {Line, Point} from '../../../map-editor/map.type';
import * as d3 from 'd3';
import {Box} from '../drawing/drawing.builder';

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

  static isBetween(first: number, middle: number, last: number, precision: number = 0): boolean {
    return first < last ? first - precision <= middle && middle <= last + precision : last - precision <= middle && middle <= first + precision;
  };

  static findLineToLineIntersection(firstSection: Line, secondSection: Line): Point {
    const precision = 10; // precision how close to the line end intersection can happen (in pixels)
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
        if (!Geometry.isBetween(x2, x_section, x1, precision)) {
          return null;
        }
      } else {
        if (!Geometry.isBetween(x1, x_section, x2, precision)) {
          return null;
        }
      }
      if (y1 >= y2) {
        if (!Geometry.isBetween(y2, y_section, y1, precision)) {
          return null;
        }
      } else {
        if (!Geometry.isBetween(y1, y_section, y2, precision)) {
          return null;
        }
      }
      if (x3 >= x4) {
        if (!Geometry.isBetween(x4, x_section, x3, precision)) {
          return null;
        }
      } else {
        if (!Geometry.isBetween(x3, x_section, x4, precision)) {
          return null;
        }
      }
      if (y3 >= y4) {
        if (!Geometry.isBetween(y4, y_section, y3, precision)) {
          return null;
        }
      } else {
        if (!Geometry.isBetween(y3, y_section, y4, precision)) {
          return null;
        }
      }
    }
    return {x: Math.floor(x_section), y: Math.floor(y_section)};
  }

  static calculatePolygonPointsRealPosition(draggingPolygon: d3.selection, shiftPoint: Point): Point[] {
    const points: Point[] = [];
    draggingPolygon.attr('points').split(' ').forEach((stringData: string): void => {
      if (stringData.length > 0) {
        const strArray: string[] = stringData.split(',');
        points.push({
          x: parseInt(strArray[0], 10) + shiftPoint.x,
          y: parseInt(strArray[1], 10) + shiftPoint.y
        })
      }
    });
    return points;
  }

  static findClosestPointOnLine(line: Line, givenPoint: Point): Point {
    // given line equation: y = a1 * x + b1
    // line that We are looking for equation: y = a2 * x + b2
    const precision = 0.01;
    const a1: number = Geometry.getSlope(line.startPoint, line.endPoint);
    const b1: number = line.startPoint.y - a1 * line.startPoint.x;
    let a2: number;
    let b2: number;
    let point: Point;
    if (a1 === 0) {
      point = {
        x: givenPoint.x,
        y: line.endPoint.y
      };
    } else if (Math.abs(a1) === Infinity) {
      point = {
        x: line.endPoint.x,
        y: givenPoint.y
      };
    } else {
      a2 = -1 / a1;
      b2 = givenPoint.y - a2 * givenPoint.x;
      const x: number = (b2 - b1) / (a1 - a2);
      point = {
        x: x,
        y: a1 * x + b1
      };
    }
    if (Geometry.isBetween(line.startPoint.x, point.x, line.endPoint.x, precision) && Geometry.isBetween(line.startPoint.y, point.y, line.endPoint.y, precision)) {
      point = {
        x: point.x,
        y: point.y
      };
      return point;
    }
    return null;
  }

  static findPointOnPathInGivenRange(path: Line[], givenPoint: Point, accuracy: number = Infinity): Point {
    let coordinatesOnPath: Point = null;
    let distance: number = accuracy;
    path.forEach((line: Line): void => {
      const nearest: NearestPoint = Geometry.pickNearestPoint(line, givenPoint);
      if (nearest.distance < distance) {
        distance = nearest.distance;
        coordinatesOnPath = nearest.coordinates;
      }
    });
    if (!!coordinatesOnPath) {
      return {x: Math.round(coordinatesOnPath.x), y: Math.round(coordinatesOnPath.y)};
    }
    return coordinatesOnPath;
  }

  static pickNearestPoint(line: Line, comparedPoint: Point): NearestPoint {
    let nearest: NearestPoint = null;
    const locationOnLine: Point = Geometry.findClosestPointOnLine(line, comparedPoint);
    if (!!locationOnLine) {
      return nearest = {
        coordinates: locationOnLine,
        distance: Geometry.getDistanceBetweenTwoPoints(locationOnLine, comparedPoint)
      }
    }
    const points: Point[] = [line.startPoint, line.endPoint];
    let distance = Infinity;
    points.forEach((point: Point): void => {
      const distanceToPoint: number = Geometry.getDistanceBetweenTwoPoints(point, comparedPoint);
      if (distanceToPoint < distance) {
        distance = distanceToPoint;
        nearest = {
          coordinates: point,
          distance: distance
        };
      }
    });
    return nearest;
  }

  static pickClosestNodeCoordinates(lines: Line[], coordinates: Point): Point {
    let closestNodeCoordinates: Point = lines[0].startPoint;
    let distance: number = Geometry.getDistanceBetweenTwoPoints(coordinates, lines[0].startPoint);
    lines.forEach((line: Line): void => {
      const startPointDistance: number = Geometry.getDistanceBetweenTwoPoints(coordinates, line.startPoint);
      const endPointDistance: number = Geometry.getDistanceBetweenTwoPoints(coordinates, line.endPoint);
      if (distance > startPointDistance) {
        closestNodeCoordinates = line.startPoint;
        distance = startPointDistance
      }
      if (distance > endPointDistance) {
        closestNodeCoordinates = line.endPoint;
      }
    });
    return closestNodeCoordinates;
  }

  static isPointOnLineBetweenTwoPoints(line: Line, point: Point): boolean {
    const {startPoint, endPoint} = line;

    const onLine: boolean = ((point.y - startPoint.y) * (endPoint.x - startPoint.x)) - ((endPoint.y - startPoint.y) * (point.x - startPoint.x)) <= 10;
    const inRange: boolean = (point.x >= Math.min(startPoint.x, endPoint.x) && point.x <= Math.max(startPoint.x, endPoint.x) &&
      point.y >= Math.min(startPoint.y, endPoint.y) && point.y <= Math.max(startPoint.y, endPoint.y));
    return onLine && inRange;
  }

}

export interface NearestPoint {
  coordinates: Point;
  distance: number;
}

