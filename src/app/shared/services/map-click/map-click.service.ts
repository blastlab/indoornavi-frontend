import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {Point} from '../../../map-editor/map.type';

@Injectable()
export class MapClickService {
  private isClicked = new Subject<Point>();

  public clickInvoked(): Observable<Point> {
    return this.isClicked.asObservable();
  }

  public mapIsClicked(point: Point) {
    this.isClicked.next(point);
  }
}
