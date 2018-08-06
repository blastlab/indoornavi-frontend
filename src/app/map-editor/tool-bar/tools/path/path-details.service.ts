import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class PathDetailsService {

  private visibilityChanged: Subject<boolean> = new Subject<boolean>();
  private decisionMade: Subject<boolean> = new Subject<boolean>();

  onDecisionMade(): Observable<boolean> {
    return this.decisionMade.asObservable();
  }

  show(): void {
    this.visibilityChanged.next(true);
  }

  hide(): void {
    this.visibilityChanged.next(false);
  }

  emitDecision(value: boolean): void {
    this.decisionMade.next(value);
  }

  onVisibilityChange(): Observable<boolean> {
    return this.visibilityChanged.asObservable();
  }

}
