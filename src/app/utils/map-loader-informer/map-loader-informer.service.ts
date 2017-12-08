import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import * as d3 from 'd3';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<d3.selection>();

  public loadCompleted(): Observable<d3.selection> {
    return this.isLoaded.asObservable();
  }

  publishIsLoaded() {
    this.isLoaded.next(d3.select('#map'));
  }
}
