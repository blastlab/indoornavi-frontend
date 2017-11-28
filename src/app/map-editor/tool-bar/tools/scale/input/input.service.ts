import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';

@Injectable()
export class ScaleInputService {
  private saveClicked = new Subject<Scale>();

  public confirmClicked = this.saveClicked.asObservable();

  publishSaveClicked(scale: Scale) {
    this.saveClicked.next(scale);
  }
}
