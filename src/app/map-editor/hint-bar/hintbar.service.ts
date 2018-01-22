import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HintBarService {
  private hintMessageReceived = new Subject<string>();

  onHintMessageReceived(): Observable<string> {
    return this.hintMessageReceived.asObservable();
  }

  sendHintMessage(key: string): void {
    this.hintMessageReceived.next(key);
  }
}
