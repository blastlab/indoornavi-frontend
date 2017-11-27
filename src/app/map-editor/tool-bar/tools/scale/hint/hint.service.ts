import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ScaleHintService {
  private mouseHoverEmitter = new Subject<string>();

  public mouseHoverChanged = this.mouseHoverEmitter.asObservable();

  mouseHover(overOrOut: string) {
    this.mouseHoverEmitter.next(overOrOut);
  }
}
