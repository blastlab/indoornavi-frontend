import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {LineBag} from './path';

@Injectable()
export class PathDetailsService {

  private visibilityChanged: Subject<boolean> = new Subject<boolean>();
  private decisionMade: Subject<LineBag> = new Subject<LineBag>();

  show(): void {
    this.visibilityChanged.next(true);
  }

  hide(): void {
    this.visibilityChanged.next(false);
  }

  reject(): void {
    this.decisionMade.next(null);
  }

  accept(lines: LineBag): void {
    this.decisionMade.next(lines);
  }

  onVisibilityChange(): Observable<boolean> {
    return this.visibilityChanged.asObservable();
  }

  onDecisionMade(): Observable<LineBag> {
    return this.decisionMade.asObservable();
  }
}
