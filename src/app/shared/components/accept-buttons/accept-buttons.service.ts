import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();

  decisionMade: Observable<boolean> = this.decision.asObservable();
  visibilitySet: Observable<boolean> = this.visibility.asObservable();

  publishDecision(val: boolean): void {
    this.decision.next(val);
  }

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

}
