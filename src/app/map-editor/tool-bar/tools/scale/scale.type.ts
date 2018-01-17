import {Point} from '../../../map.type';


export class Scale {
  start: Point;
  stop: Point;
  realDistance: number;
  measure: Measure;

  constructor(private scale: Scale) {
  }

  get startPoint(): Point {
    return this.scale.start;
  }

  get stopPoint(): Point {
    return this.scale.stop;
  }

  getRealDistanceInCentimeters(): number {
    return this.scale.realDistance * (this.scale.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
  };

}

export enum Measure {
  CENTIMETERS,
  METERS
}
