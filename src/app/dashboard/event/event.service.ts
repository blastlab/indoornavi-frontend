import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DashboardEventService {
  private eventAdded: Subject<void> = new Subject<void>();
  private eventRemoved: Subject<void> = new Subject<void>();

  emitEventAdded(): void {
    this.eventAdded.next();
  }

  emitEventRemoved(): void {
    this.eventRemoved.next();
  }

  onEventAdded(): Observable<void> {
    return this.eventAdded.asObservable();
  }

  onEventRemoved(): Observable<void> {
    return this.eventRemoved.asObservable();
  }
}
