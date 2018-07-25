import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {DeviceInEditor} from '../../../../map/models/device';
import {Observable} from 'rxjs/Observable';
import {AnchorBag, DeviceDto, SinkBag} from './device-placer/device-placer.types';


@Injectable()
export class DevicePlacerService {
  private draggedStarted: Subject<DeviceDto> = new Subject();
  private droppedOutside: Subject<void> = new Subject();
  private droppedInside: Subject<Point> = new Subject();
  private active: Subject<DeviceInEditor> = new Subject();
  private selected: Subject<DeviceInEditor> = new Subject<DeviceInEditor>();
  private removedFromMap: Subject<AnchorBag | SinkBag> = new Subject<AnchorBag | SinkBag>();
  private listVisibility: Subject<boolean> = new Subject<boolean>();
  private mapClick: Subject<void> = new Subject();
  private tableRendered: Subject<void> = new Subject();

  onDragStarted: Observable<DeviceDto> = this.draggedStarted.asObservable();
  onDroppedOutside: Observable<void> = this.droppedOutside.asObservable();
  onDroppedInside: Observable<Point> = this.droppedInside.asObservable();
  onActive: Observable<DeviceInEditor> = this.active.asObservable();
  onSelected: Observable<DeviceInEditor> = this.selected.asObservable();
  onRemovedFromMap: Observable<AnchorBag | SinkBag> = this.removedFromMap.asObservable();
  onListVisibility: Observable<boolean> = this.listVisibility.asObservable();
  onMapClick: Observable<void> = this.mapClick.asObservable();
  onTableRendered: Observable<void> = this.tableRendered.asObservable();

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

  emitActivated(device: DeviceInEditor): void {
    this.active.next(device);
  }

  emitSelected(device: DeviceInEditor): void {
    this.selected.next(device);
  }

  emitRemovedFromMap(device: AnchorBag | SinkBag): void {
    this.removedFromMap.next(device);
  }

  emitListVisibility(visible: boolean): void {
    this.listVisibility.next(visible);
  }

  emitMapModeActivated(): void {
    this.mapClick.next();
  }

  emitTableRendered(): void {
    this.tableRendered.next();
  }

}
