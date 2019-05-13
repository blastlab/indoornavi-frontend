import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {AreaBag} from '../area.type';

@Injectable()
export class AreaDetailsService {

  private visibilityChanged: Subject<boolean> = new Subject<boolean>();
  private decisionAccepted: Subject<AreaBag> = new Subject<AreaBag>();
  private hasBeenSet: Subject<AreaBag> = new Subject<AreaBag>();
  private hasBeenRemoved: Subject<void> = new Subject<void>();
  private decisionRejected: Subject<void> = new Subject<void>();

  show(): void {
    this.visibilityChanged.next(true);
  }

  hide(): void {
    this.visibilityChanged.next(false);
  }

  reject(): void {
    this.decisionRejected.next(null);
  }

  accept(area: AreaBag): void {
    this.decisionAccepted.next(area);
  }

  set(area: AreaBag): void {
    this.hasBeenSet.next(area);
  }

  remove(): void {
    this.hasBeenRemoved.next();
  }

  onVisibilityChange(): Observable<boolean> {
    return this.visibilityChanged.asObservable();
  }

  onDecisionRejected(): Observable<void> {
    return this.decisionRejected.asObservable();
  }

  onDecisionAccepted(): Observable<AreaBag> {
    return this.decisionAccepted.asObservable();
  }

  onSet(): Observable<AreaBag> {
    return this.hasBeenSet.asObservable();
  }

  onRemove(): Observable<void> {
    return this.hasBeenRemoved.asObservable();
  }

}
