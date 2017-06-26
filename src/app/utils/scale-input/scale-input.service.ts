import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../map/map.type';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';

@Injectable()
export class ScaleInputService {
  private visibility = new Subject<boolean>();
  private coordinates = new Subject<Point>();
  private scale = new Subject<Scale>();
  private saveClicked = new Subject<boolean>();
  private removeClicked = new Subject<Scale>();

  public visibility$ = this.visibility.asObservable();
  public coordinates$ = this.coordinates.asObservable();
  public scale$ = this.scale.asObservable();
  public saveClicked$ = this.saveClicked.asObservable();
  public removeClicked$ = this.removeClicked.asObservable();

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

  publishCoordinates(val: Point) {
    this.coordinates.next(val);
  }

  publishScale(val: Scale) {
    this.scale.next(val);
  }

  publishSaveClicked(val: boolean) {
    this.saveClicked.next(val);
  }

  publishRemoveClicked(val: Scale) {
    this.removeClicked.next(val);
  }
}
