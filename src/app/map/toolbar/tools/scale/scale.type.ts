import {Point} from '../../../map.type';

export enum MeasureEnum {
  M = 0,
  CM,
  MM
}
export interface Scale {
  start: Point;
  stop: Point;
  scale: number;
  measure: MeasureEnum;
}
