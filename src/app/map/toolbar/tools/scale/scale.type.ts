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
