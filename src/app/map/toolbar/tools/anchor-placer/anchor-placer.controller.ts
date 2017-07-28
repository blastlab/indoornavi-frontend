import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Anchor} from '../../../../anchor/anchor.type';

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

  resetChosenAnchor() {
    this.anchor.next(undefined);
    this.setListVisibility(true);
  }

  setCoordinates(coords: Point): void {
    this.coordinates.next(coords);
  }

  resetCoordinates() {
    this.coordinates.next(undefined);
  }

}
