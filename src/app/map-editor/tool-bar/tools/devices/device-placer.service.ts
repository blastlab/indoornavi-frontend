import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Device} from '../../../../device/device.type';
import {DeviceInEditor} from '../../../../map/models/device';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class DevicePlacerService {
  private draggedStarted: Subject<DeviceDto> = new Subject();
  private droppedOutside: Subject<void> = new Subject();
  private droppedInside: Subject<Point> = new Subject();
  private active: Subject<DeviceInEditor> = new Subject();
  private selected: Subject<DeviceInEditor> = new Subject<DeviceInEditor>();
  private removedFromMap: Subject<DeviceInEditor> = new Subject<DeviceInEditor>();
  private listVisibility: Subject<boolean> = new Subject<boolean>();

  onDragStarted: Observable<DeviceDto> = this.draggedStarted.asObservable();
  onDroppedOutside: Observable<void> = this.droppedOutside.asObservable();
  onDroppedInside: Observable<Point> = this.droppedInside.asObservable();
  onActive: Observable<DeviceInEditor> = this.active.asObservable();
  onSelected: Observable<DeviceInEditor> = this.selected.asObservable();
  onRemovedFromMap: Observable<DeviceInEditor> = this.removedFromMap.asObservable();
  onListVisibility: Observable<boolean> = this.listVisibility.asObservable();

  constructor() {
  }

  emitDragStarted(device: DeviceDto): void {
    this.draggedStarted.next(device);
  }

  emitDroppedOutside(): void {
    this.droppedOutside.next();
  }

  emitDroppedInside(coordinates: Point): void {
    this.droppedInside.next(coordinates);
  }

  emitActive(deviceId: DeviceInEditor): void {
    this.active.next(deviceId);
  }

  emitSelected(device: DeviceInEditor): void {
    this.selected.next(device);
  }

  emitRemovedFromMap(device: DeviceInEditor): void {
    this.removedFromMap.next(device);
  }

  emitListVisibility(visible: boolean): void {
    this.listVisibility.next(visible);
  }

}

export interface DeviceDto {
  device: Device,
  type: DeviceType
}

export enum DeviceType {
  ANCHOR, SINK
}
