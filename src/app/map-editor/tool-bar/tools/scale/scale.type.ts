import {Point} from '../../../map.type';


export class Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: Measure;

  constructor(scale: Scale) {
    this.start = scale.start;
    this.stop = scale.stop;
    this.realDistance = scale.realDistance;
    this.measure = scale.measure;
  }

  get startPoint(): Point {
    return this.start;
  }

  get stopPoint(): Point {
    return this.stop;
  }

  getRealDistanceInCentimeters(): number {
    return this.realDistance * (this.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
  }

}

export enum Measure {
  CENTIMETERS,
  METERS
}
