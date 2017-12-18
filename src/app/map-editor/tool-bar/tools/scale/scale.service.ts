import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from './scale.type';

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
}
