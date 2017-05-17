import {Point} from '../../../map.type';

export enum MeasureEnum {
  CENTIMETERS = 0,
  METERS
}
export interface Scale {
  start: Point;
  stop: Point;
  scale: number;
  measure: MeasureEnum;
}
