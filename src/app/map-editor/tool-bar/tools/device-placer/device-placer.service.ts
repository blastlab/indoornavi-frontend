import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {DeviceInEditor} from '../../../../map/models/device';
import {Observable} from 'rxjs/Observable';
import {AnchorBag, DeviceDto, SinkBag} from './device-placer.types';
import {Anchor, Sink} from '../../../../device/device.type';


@Injectable()
export class DevicePlacerService {
  private draggedStarted: Subject<DeviceDto> = new Subject();
  private droppedOutside: Subject<void> = new Subject();
  private droppedInside: Subject<Point> = new Subject();
  private activated: Subject<DeviceInEditor> = new Subject();
  private selected: Subject<DeviceInEditor> = new Subject<DeviceInEditor>();
  private removedFromMap: Subject<AnchorBag | SinkBag> = new Subject<AnchorBag | SinkBag>();
  private listVisibilityChanged: Subject<boolean> = new Subject<boolean>();
  private mapClicked: Subject<void> = new Subject();
  private tableRendered: Subject<void> = new Subject();
  private devicePositionChanged: Subject<void> = new Subject<void>();
  private dviceInActiveConfiguration: Subject<Sink | Anchor> = new Subject<Sink | Anchor>();

  onDragStarted: Observable<DeviceDto> = this.draggedStarted.asObservable();
  onDroppedOutside: Observable<void> = this.droppedOutside.asObservable();
  onDroppedInside: Observable<Point> = this.droppedInside.asObservable();
  onActivated: Observable<DeviceInEditor> = this.activated.asObservable();
  onSelected: Observable<DeviceInEditor> = this.selected.asObservable();
  onRemovedFromMap: Observable<AnchorBag | SinkBag> = this.removedFromMap.asObservable();
  onListVisibilityChanged: Observable<boolean> = this.listVisibilityChanged.asObservable();
  onMapClicked: Observable<void> = this.mapClicked.asObservable();
  onTableRendered: Observable<void> = this.tableRendered.asObservable();
  onDevicePositionChanged: Observable<void> = this.devicePositionChanged.asObservable();
  onDeviceInActiveConfiguration: Observable<Sink | Anchor> = this.dviceInActiveConfiguration.asObservable();
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
    this.activated.next(device);
  }

  emitSelected(device: DeviceInEditor): void {
    this.selected.next(device);
  }

  emitRemovedFromMap(device: AnchorBag | SinkBag): void {
    this.removedFromMap.next(device);
  }

  emitListVisibility(visible: boolean): void {
    this.listVisibilityChanged.next(visible);
  }

  emitMapModeActivated(): void {
    this.mapClicked.next();
  }

  emitTableRendered(): void {
    this.tableRendered.next();
  }

  emitDevicePositionChanged(): void {
    this.devicePositionChanged.next();
  }

  emitDeviceInActiveConfiguration(device: Sink | Anchor): void {
    this.dviceInActiveConfiguration.next(device);
  }
}
