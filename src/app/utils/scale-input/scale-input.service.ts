import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../map/map.type';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';

@Injectable()
export class ScaleInputService {
  private visibility = new Subject<boolean>();
  private coordinates = new Subject<Point>();
  private scale = new Subject<Scale>();

  public visibility$ = this.visibility.asObservable();
  public coordinates$ = this.coordinates.asObservable();
  public scale$ = this.scale.asObservable();

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

  publishCoordinates(val: Point) {
    this.coordinates.next(val);
  }

  publishScale(val: Scale) {
    this.scale.next(val);
  }
}
