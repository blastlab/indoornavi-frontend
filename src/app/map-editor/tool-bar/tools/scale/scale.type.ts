import {Point} from '../../../map.type';


export class Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: Measure;

  constructor(start: Point, stop: Point, realDistance: number, measure: Measure) {
    this.start = start;
    this.stop = stop;
    this.realDistance = realDistance;
    this.measure = measure;
  }

  get startPoint(): Point {
    return this.start;
  }

  get stopPoint(): Point {
    return this.stop;
  }

  getRealDistanceInCentimeters(): number {
    return this.realDistance * (this.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
  };

}

export enum Measure {
  CENTIMETERS,
  METERS
}
