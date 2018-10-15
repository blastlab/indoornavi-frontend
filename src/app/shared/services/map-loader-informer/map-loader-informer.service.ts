import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {MapSvg} from '../../../map/map.type';

@Injectable()
export class MapLoaderInformerService {
  private isLoaded = new Subject<MapSvg>();

  public loadCompleted(): Observable<MapSvg> {
    return this.isLoaded.asObservable();
  }

  publishIsLoaded(mapSvg: MapSvg): void {
    this.isLoaded.next(mapSvg);
  }
}
