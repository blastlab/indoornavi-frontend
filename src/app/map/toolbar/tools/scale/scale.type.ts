import {Point} from '../../../map.type';

export enum MeasureEnum {
  CENTIMETERS,
  METERS
}
export interface Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: MeasureEnum;
}
