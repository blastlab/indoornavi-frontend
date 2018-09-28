import {Point} from '../../../map.type';

export class ScaleDto {
  constructor(public start: Point,
              public stop: Point,
              public realDistance: number,
              public measure: Measure) {
  }

}

export class Scale extends ScaleDto {

  constructor(scale: ScaleDto) {
    super(scale.start, scale.stop, scale.realDistance, scale.measure)
  }

  getRealDistanceInCentimeters(): number {
    return this.realDistance * (this.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
  }

  isReady(): boolean {
    return !!this.realDistance && !!this.measure && !!this.start && !!this.stop;
  }

  getLenInPix(): Measure {
    return this.measure;
  }


}

export enum Measure {
  CENTIMETERS,
  METERS
}

export interface ScaleCalculations {
  scaleLengthInPixels: number;
  scaleInCentimeters: number;
}
