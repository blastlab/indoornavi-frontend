import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Device} from '../../../../device/device.type';


@Injectable()
export class DevicePlacerService {
  private draggedStarted: Subject<Device> = new Subject();
  private droppedOutside: Subject<void> = new Subject();
  private droppedInside: Subject<Point> = new Subject();

  onDragStarted = this.draggedStarted.asObservable();
  onDroppedOutside = this.droppedOutside.asObservable();
  onDroppedInside = this.droppedInside.asObservable();

  constructor() {
  }

  emitDragStarted(device: Device): void {
    this.draggedStarted.next(device);
  }

  emitDroppedOutside(): void {
    this.droppedOutside.next();
  }

  emitDroppedInside(coordinates: Point): void {
    this.droppedInside.next(coordinates);
  }

}
