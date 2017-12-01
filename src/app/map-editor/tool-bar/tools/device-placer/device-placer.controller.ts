import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {Draggable} from '../../../../utils/builder/draggable';

@Injectable()
export class DevicePlacerController {
  private listVisibility: Subject<boolean> = new Subject<boolean>();
  private anchor: Subject<Anchor> = new Subject<Anchor>();
  private sink: Subject<Sink> = new Subject<Sink>();
  private coordinates: Subject<Point> = new Subject<Point>();
  private mapDevice: Subject<Draggable> = new Subject<Draggable>();

  listVisibilitySet = this.listVisibility.asObservable();
  chosenAnchor = this.anchor.asObservable();
  chosenSink = this.sink.asObservable();
  newCoordinates = this.coordinates.asObservable();
  selectedDevice = this.mapDevice.asObservable();


  toggleListVisibility(): void {
    this.listVisibility.next();
  }

  setChosenAnchor(anchor: Anchor): void {
    this.anchor.next(anchor);
  }

  resetChosenAnchor(): void {
    this.anchor.next(undefined);
  }

  setChosenSink(sink: Sink): void {
    this.sink.next(sink);
  }

  resetChosenSink(): void {
    this.sink.next(undefined);
  }

  setCoordinates(coords: Point): void {
    this.coordinates.next(coords);
  }

  resetCoordinates(): void {
    this.coordinates.next(undefined);
  }

  selectDevice(device: Draggable): void {
    this.mapDevice.next(device);
  }

  deselectDevice(): void {
    this.mapDevice.next(undefined);
  }

}
