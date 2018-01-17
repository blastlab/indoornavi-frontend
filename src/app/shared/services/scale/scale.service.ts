import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';

@Injectable()
export class ScaleService {
  private scaleVisibilityEmitter = new Subject<boolean>();
  private scaleChangedEmitter = new Subject<Scale>();

  public scaleVisibilityChanged = this.scaleVisibilityEmitter.asObservable();
  public scaleChanged = this.scaleChangedEmitter.asObservable();

  changeVisibility(val: boolean) {
    this.scaleVisibilityEmitter.next(val);
  }

  publishScaleChanged(scale: Scale) {
    this.scaleChangedEmitter.next(scale);
  }

  // calculateMapDistance (realDistance: number): number {
  //   const onMapDistance = this.scaleLengthInPixels / this.scale.realDistance * realDistance;
  //   return this.scale.measure.toString() === Measure[Measure.CENTIMETERS] ?  onMapDistance : onMapDistance / 100;
  // }
  //
  // calculateRealDistance (distanceInPixels: number): number {
  //   const realDistance = this.scale.realDistance / this.scaleLengthInPixels * distanceInPixels;
  //   return this.scale.measure.toString() === Measure[Measure.CENTIMETERS] ? realDistance : realDistance * 100;
  // }
  //
  // calculateMapPoint (point: Point): Point {
  //   return {x: this.calculateMapDistance(point.x), y: this.calculateMapDistance(point.y)};
  // }
  //
  // calculateRealPoint(point: Point): Point {
  //   return {x: this.calculateRealDistance(point.x), y: this.calculateRealDistance(point.y)};
  // }
}
