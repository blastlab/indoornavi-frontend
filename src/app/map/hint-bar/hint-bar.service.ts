import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class HintBarService {
  private hint = new Subject<String>();

  hint$ = this.hint.asObservable();

  publishHint(val: string) {
    this.hint.next(val);
  }
}
