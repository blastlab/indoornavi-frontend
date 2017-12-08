import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import * as d3 from 'd3';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<boolean>();
  private mapSelection: Subject<d3.selection> = new Subject<d3.selection>();

  public loadCompleted(): Observable<boolean> {
    return this.isLoaded.asObservable();
  }

  public getMapSelection(): Observable<d3.selection> {
    return this.mapSelection.asObservable();
  }

  private setMap(): void {
    this.mapSelection.next(d3.select('#map'));
  }

  publishIsLoaded() {
    this.isLoaded.next(true);
    this.setMap();
  }
}
