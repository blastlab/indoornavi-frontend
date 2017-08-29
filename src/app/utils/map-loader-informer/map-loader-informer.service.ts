import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<boolean>();

  public loadCompleted(): Observable<boolean> {
    return this.isLoaded.asObservable();
  }

  publishIsLoaded() {
    this.isLoaded.next();
  }
}
