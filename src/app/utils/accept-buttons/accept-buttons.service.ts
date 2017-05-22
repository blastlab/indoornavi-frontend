import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../map/map.type';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();
  private coordinates = new Subject<Point>();

  decision$ = this.decision.asObservable();
  visibility$ = this.visibility.asObservable();
  coordinates$ = this.coordinates.asObservable();

  publishDecision(val: boolean) {
    this.decision.next(val);
  }
  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }
  publishCoordinates(val: Point) {
    this.coordinates.next(val);
  }
}
