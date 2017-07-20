import {Point} from '../../../map.type';

export interface Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: MeasureEnum;
}

export enum MeasureEnum {
  CENTIMETERS,
  METERS
}
