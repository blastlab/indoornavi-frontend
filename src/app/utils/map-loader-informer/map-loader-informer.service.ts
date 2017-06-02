import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Scale} from '../../map/toolbar/tools/scale/scale.type';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<boolean>();

  public isLoaded$ = this.isLoaded.asObservable();

  publishIsLoaded(val: boolean) {
    this.isLoaded.next(val);
  }
}

