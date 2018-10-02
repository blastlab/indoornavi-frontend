import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {MenuItem} from 'primeng/primeng';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class BreadcrumbService {
  private ready = new Subject<MenuItem[]>();

  public isReady(): Observable<MenuItem[]> {
    return this.ready.asObservable();
  }

  public publishIsReady(menuItems: MenuItem[]) {
    this.ready.next(menuItems);
  }

}
