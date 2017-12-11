import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Expandable} from '../../../../utils/builder/expandable';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DevicePlacerController {
  private droppedOnMap: Subject<any> = new Subject();
  private coordinates: Subject<Point> = new Subject<Point>();
  private selectedDevice: Subject<Expandable> = new Subject<Expandable>();
  private anchor: Subject<Expandable> = new Subject<Expandable>();
  private sink: Subject<Expandable> = new Subject<Expandable>();

  droppedDevice = this.droppedOnMap.asObservable();
  newCoordinates = this.coordinates.asObservable();


  deviceDropped(): void {
    this.droppedOnMap.next();
  }

  setCoordinates(coords: Point): void {
    this.coordinates.next(coords);
  }

  resetCoordinates(): void {
    this.coordinates.next(undefined);
  }

  setChosenAnchor(anchor: Expandable): void {
    this.anchor.next(anchor);
  }

  getChosenAnchor(): Observable<Expandable> {
    return this.anchor.asObservable()
  }

  resetChosenAnchor(): void {
    this.anchor.next(undefined);
  }

  setChosenSink(sink: Expandable): void {
    this.sink.next(sink);
  }

  getChosenSink(): Observable<Expandable> {
    return this.sink.asObservable()
  }

  resetChosenSink(): void {
    this.sink.next(undefined);
  }

  selectDevice(device: Expandable): void {
    this.selectedDevice.next(device);
  }

  getSelectedDevice(): Observable<Expandable> {
    return this.selectedDevice.asObservable()
  }

  deselectDevice(): void {
    this.selectedDevice.next(undefined);
  }

}
