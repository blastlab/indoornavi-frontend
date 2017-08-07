import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Anchor} from '../../../../anchor/anchor.type';
import {Sink} from '../../../../sink/sink.type';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AnchorPlacerController {
  private listVisibility: Subject<boolean> = new Subject<boolean>();
  private anchor: Subject<Anchor> = new Subject<Anchor>();
  private coordinates: Subject<Point> = new Subject<Point>();

  listVisibilitySet = this.listVisibility.asObservable();
  chosenAnchor = this.anchor.asObservable();
  newCoordinates = this.coordinates.asObservable();


  setListVisibility(val: boolean): void {
    this.listVisibility.next(val);
  }

  setChosenAnchor(anchor: Anchor): void {
    this.anchor.next(anchor);
    this.setListVisibility(false);
  }

  resetChosenAnchor(): void {
    this.anchor.next(undefined);
    this.setListVisibility(true);
  }

  setCoordinates(coords: Point): void {
    this.coordinates.next(coords);
  }

  resetCoordinates(): void {
    this.coordinates.next(undefined);
  }

  // mocking /sink endpoint
  public getSinks(): Observable<Sink[]> {
    const sinks = [];
    const quota = getRandom(2, 10);
    for (let i = 0; i < quota; i++) {
      sinks.push({
        name: 'sinkGen',
        shortId: getRandom(465, 75633),
        verified: false,
        floorId: null,
        anchors: [],
      });
    }

    function getRandom(min, max): number {
      return Math.floor(Math.random() * (max - min) + min);
    }

    return Observable.of(sinks);
  }
}
