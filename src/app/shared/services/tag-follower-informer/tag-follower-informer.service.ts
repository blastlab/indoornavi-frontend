import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class TagFollowerInformerService {
  private spiedTag = new Subject<number>();

  spyOnTagToFollow(): Observable<number> {
    return this.spiedTag.asObservable();
  }

  dispatchTagToSpyOn(tagShortId: number): void {
    this.spiedTag.next(tagShortId);
  }
}
