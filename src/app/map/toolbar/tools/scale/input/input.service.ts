import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';

@Injectable()
export class ScaleInputService {
  private scale = new Subject<Scale>();
  private saveClicked = new Subject<Scale>();

  public scaleChanged = this.scale.asObservable();
  public confirmClicked = this.saveClicked.asObservable();

  publishScale(val: Scale) {
    this.scale.next(val);
  }

  publishSaveClicked(scale: Scale) {
    this.saveClicked.next(scale);
  }
}
