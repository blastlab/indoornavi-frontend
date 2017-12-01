import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ScaleInputService {
  private saveClicked = new Subject<Scale>();
  private visibilityChanged = new Subject<boolean>();

  public confirmClicked = this.saveClicked.asObservable();

  onVisibilityChange(): Observable<boolean> {
    return this.visibilityChanged.asObservable();
  }

  publishSaveClicked(scale: Scale) {
    this.saveClicked.next(scale);
  }

  publishVisibilityChange(value: boolean) {
    this.visibilityChanged.next(value);
  }
}
