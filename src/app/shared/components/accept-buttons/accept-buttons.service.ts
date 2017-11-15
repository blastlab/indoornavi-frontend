import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map-editor/map.type';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();
  private coordinates = new Subject<Point>();

  decisionMade = this.decision.asObservable();
  visibilitySet = this.visibility.asObservable();
  coordinatesChanged = this.coordinates.asObservable();

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
