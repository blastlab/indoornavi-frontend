import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Device} from '../../../../device/device.type';
import {DeviceInEditor} from '../../../../map/models/device';


@Injectable()
export class DevicePlacerService {
  private draggedStarted: Subject<Device> = new Subject();
  private droppedOutside: Subject<void> = new Subject();
  private droppedInside: Subject<Point> = new Subject();
  private active: Subject<number> = new Subject();
  private selected: Subject<DeviceInEditor> = new Subject<DeviceInEditor>();

  onDragStarted = this.draggedStarted.asObservable();
  onDroppedOutside = this.droppedOutside.asObservable();
  onDroppedInside = this.droppedInside.asObservable();
  onActive = this.active.asObservable();
  onSelected = this.selected.asObservable();

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

  emitActive(deviceId: number): void {
    this.active.next(deviceId);
  }

  emitSelected(device: DeviceInEditor): void {
    this.selected.next(device);
  }

}
