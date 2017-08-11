import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../scale.type';

@Injectable()
export class ScaleHintService {
  private scaleEmitter = new Subject<Scale>();
  private mouseHoverEmitter = new Subject<string>();

  public scaleChanged = this.scaleEmitter.asObservable();
  public mouseHoverChanged = this.mouseHoverEmitter.asObservable();

  publishScale(scale: Scale) {
    this.scaleEmitter.next(scale);
  }

  mouseHover(overOrOut: string) {
    this.mouseHoverEmitter.next(overOrOut);
  }
}
