import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';

@Injectable()
export class ScaleService {
  private scaleVisibilityEmitter = new Subject<boolean>();
  private coordinatesChangedEmitter = new Subject<Point>();

  public scaleVisibilityChanged = this.scaleVisibilityEmitter.asObservable();
  public coordinatesChanged = this.coordinatesChangedEmitter.asObservable();

  changeVisibility(val: boolean) {
    this.scaleVisibilityEmitter.next(val);
  }

  publishCoordinates(point: Point) {
    this.coordinatesChangedEmitter.next(point);
  }
}
