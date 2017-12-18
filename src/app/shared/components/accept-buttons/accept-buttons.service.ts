import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();

  decisionMade = this.decision.asObservable();
  visibilitySet = this.visibility.asObservable();

  publishDecision(val: boolean): void {
    this.decision.next(val);
  }

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

}
