import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';

@Injectable()
export class ScaleHintService {
  private scaleEmitter = new Subject<Scale>();

  public scalePublished = this.scaleEmitter.asObservable();

  publishScale(val: Scale) {
    this.scaleEmitter.next(val);
  }
}
