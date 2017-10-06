import {Point} from '../../../map.type';

export interface Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: Measure;
}

export enum Measure {
  CENTIMETERS,
  METERS
}

export const scaleCoordinates = (point: Point, pixelsToCentimeters: number): Point => {
  return {
    x: point.x / pixelsToCentimeters,
    y: point.y / pixelsToCentimeters
  };
};
