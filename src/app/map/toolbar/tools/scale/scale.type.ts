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

export const getRealDistanceInCentimeters = (scale: Scale): number => {
  return scale.realDistance * (scale.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
};
