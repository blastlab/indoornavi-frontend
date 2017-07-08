import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';

@Injectable()
export class ScaleHintService {
  private scale = new Subject<Scale>();

  public scale$ = this.scale.asObservable();

  publishScale(val: Scale) {
    this.scale.next(val);
  }
}
