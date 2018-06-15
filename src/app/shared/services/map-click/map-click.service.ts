import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {MapSvg} from '../../../map/map.type';

@Injectable()
export class MapClickService {
  private isClicked = new Subject<MapSvg>();

  public clickInvoked(): Observable<MapSvg> {
    return this.isClicked.asObservable();
  }

  public mapIsClicked(mapSvg: MapSvg) {
    this.isClicked.next(mapSvg);
  }
}
