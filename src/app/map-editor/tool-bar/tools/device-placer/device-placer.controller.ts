import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Expandable} from '../../../../shared/utils/drawing/drawables/expandable';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DevicePlacerController {
  private droppedOnMap: Subject<any> = new Subject();
  private coordinates: Subject<Point> = new Subject<Point>();
  private selectedDevice: Subject<Expandable> = new Subject<Expandable>();

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

  setSelectedDevice(device: Expandable): void {
    this.selectedDevice.next(device);
  }

  getSelectedDevice(): Observable<Expandable> {
    return this.selectedDevice.asObservable()
  }
}
