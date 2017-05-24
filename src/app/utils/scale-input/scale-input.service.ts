import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../map/map.type';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';

@Injectable()
export class ScaleInputService {
  private visibility = new Subject<boolean>();
  private coordinates = new Subject<Point>();
  private realDistance = new Subject<number>();
  private unit = new Subject<number>();
  private scale = new Subject<Scale>();

  public visibility$ = this.visibility.asObservable();
  public coordinates$ = this.coordinates.asObservable();
  public realDistance$ = this.realDistance.asObservable();
  public unit$ = this.unit.asObservable();
  public scale$ = this.scale.asObservable();

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

  publishCoordinates(val: Point) {
    this.coordinates.next(val);
  }

  publishRealDistance(val: number) {
    this.realDistance.next(val);
  }

  publishUnit(val: number) {
    this.unit.next(val);
  }

  publishScale(val: Scale) {
    this.scale.next(val);
    console.log('w servisie');
    console.log(val);
  }
}
