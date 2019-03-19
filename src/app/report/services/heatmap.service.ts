import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HeatMapService {
  private isDrawn = new Subject<void>();

  public drawn(): Observable<void> {
    return this.isDrawn.asObservable();
  }

  publishIsDrawn(): void {
    this.isDrawn.next();
  }
}
