import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HintBarService {
  private hintMessageChanged = new Subject<string>();

  onHintMessageReceived(): Observable<string> {
    return this.hintMessageChanged.asObservable();
  }

  emitHintMessage(value: string): void {
    this.hintMessageChanged.next(value);
  }
}
