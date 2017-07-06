import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<boolean>();

  public isLoaded$ = this.isLoaded.asObservable();

  publishIsLoaded(val: boolean) {
    this.isLoaded.next(val);
  }
}
