import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Scale} from './scale.type';

@Injectable()
export class ScaleService {
  private scaleVisibilityEmitter = new Subject<boolean>();
  private coordinatesChangedEmitter = new Subject<Point>();
  private scaleChangedEmitter = new Subject<Scale>();

  public scaleVisibilityChanged = this.scaleVisibilityEmitter.asObservable();
  public coordinatesChanged = this.coordinatesChangedEmitter.asObservable();
  public scaleChanged = this.scaleChangedEmitter.asObservable();

  changeVisibility(val: boolean) {
    this.scaleVisibilityEmitter.next(val);
  }

  publishCoordinates(point: Point) {
    this.coordinatesChangedEmitter.next(point);
  }

  publishScaleChanged(scale: Scale) {
    this.scaleChangedEmitter.next(scale);
  }
}
