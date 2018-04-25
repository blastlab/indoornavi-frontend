import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Point} from '../../../map.type';
import {Expandable} from '../../../../shared/utils/drawing/drawables/expandable';
import {Observable} from 'rxjs/Observable';
import {Anchor, Sink} from '../../../../device/device.type';

@Injectable()
export class DevicePlacerController {
  private droppedOnMap: Subject<any> = new Subject();
  private dragEnd: Subject<any> = new Subject();
  private coordinates: Subject<Point> = new Subject<Point>();
  private selectedDevice: Subject<Expandable> = new Subject<Expandable>();
  removedDevice = this.removeListDevice.asObservable();
  private removal: Subject<any> = new Subject();
  private addListDevice: Subject<Anchor | Sink> = new Subject<Anchor | Sink>();
  private draggedDevice: Subject<Anchor | Sink> = new Subject<Anchor | Sink>();
  private removeListDevice: Subject<Anchor | Sink> = new Subject<Anchor | Sink>();
  private connectingModeSet: Subject<boolean> = new Subject<false>();
  private showDevicesList: Subject<boolean> = new Subject<false>();
  private wizardConfiguration: Subject<Expandable[]> = new Subject<Expandable[]>();

  droppedDevice = this.droppedOnMap.asObservable();
  newCoordinates = this.coordinates.asObservable();
  addedDevice = this.addListDevice.asObservable();
  private deselectDevice: Subject<any> = new Subject();
  deselectedDevice = this.deselectDevice.asObservable();
  deleteClicked = this.removal.asObservable();
  draggingDevice = this.draggedDevice.asObservable();
  dragEnded = this.dragEnd.asObservable();
  connectingMode = this.connectingModeSet.asObservable();
  listVisibility = this.showDevicesList.asObservable();
  wizardSavesConfiguration = this.wizardConfiguration.asObservable();

  devicePlacement(): void {
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

  deselected(device: Expandable): void {
    this.deselectDevice.next(device);
  }

  getSelectedDevice(): Observable<Expandable> {
    return this.selectedDevice.asObservable()
  }

  setConnectingMode(on: boolean): void {
    this.connectingModeSet.next(on);
  }

  emitDeviceDragStarted(device: Anchor | Sink): void {
    this.draggedDevice.next(device);
  }

  emitDeviceDragEnded(): void {
    this.dragEnd.next();
  }

  emitDeleteButtonClicked(): void {
    this.removal.next();
  }

  addToRemainingDevicesList(device: Anchor | Sink): void {
    this.addListDevice.next(device);
  }

  removeFromRemainingDevicesList(device: Anchor | Sink): void {
    this.removeListDevice.next(device)
  }

  setListVisibility(shown: boolean): void {
    this.showDevicesList.next(shown);
  }

  emitWizardSaveConfiguration(expandables: Expandable[]): void {
    this.wizardConfiguration.next(expandables);
  }

}
