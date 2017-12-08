import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {DevicePlacerController} from './device-placer.controller';
import {Point} from '../../../map.type';
import {IconService, NaviIcons} from '../../../../utils/drawing/icon.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {DrawBuilder, DrawConfiguration} from '../../../../utils/builder/draw.builder';
import {Subscription} from 'rxjs/Subscription';
import {MapLoaderInformerService} from 'app/utils/map-loader-informer/map-loader-informer.service';
import {ConnectingLine} from '../../../../utils/builder/connection';
import {Device} from '../../../../device/device.type';
import {ConnectableDevice} from 'app/utils/builder/connectableDevice';
import {Selectable} from '../../../../utils/builder/selectable';
import {Expandable} from '../../../../utils/builder/expandable';
import {ActionBarService} from 'app/map-editor/action-bar/actionbar.service';
import {ToolbarService} from '../../toolbar.service';
import {DeviceService} from '../../../../device/device.service';

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html',
  styleUrls: ['../tool.css', './device-placer.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(125%, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      transition('in <=> out', animate('400ms easeInOut'))
    ]),
  ]
})
export class DevicePlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public active: boolean = false;
  public remainingDevices: Device[] = [];
  public draggedDevice: Sink | Anchor;
  public queryString;
  private listState: string = 'out';
  private hintMessage: string;
  private floorId: number;
  private mapLoadedSubscription: Subscription;
  private map: d3.selection;
  private anchors: Anchor[];
  private sinks: Sink[];
  private mapDevices: Expandable[] = [];
  private chosenSink: Sink;
  private selectedDevice: Sink | Anchor;
  private placementDone: boolean = true;
  private managedSelectables: Subscription[];

  static getShortIdFromSelection(selection: d3.selection): number {
    return parseInt(selection._groups[0][0].id, 10);
  }

  static isSinkType(checkType: any): boolean {
    return (<Sink>checkType.anchors) !== undefined;
  }

  static buildAnchorDrawConfiguration(anchor: Anchor): DrawConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      cursor: `pointer`
    };
  }

  static buildSinkDrawConfiguration(sink: Sink): DrawConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      cursor: `pointer`
    };
  }

  static createConnection(sink: Expandable, anchor: Expandable, id: string): ConnectingLine {
    const connectingLine = new ConnectingLine(sink.connectable, anchor.connectable, id);
    sink.connectable.sinkConnections.push(connectingLine);
    anchor.connectable.anchorConnection = connectingLine;
    return connectingLine;
  }

  constructor(public translate: TranslateService,
              private devicePlacerController: DevicePlacerController,
              private accButtons: AcceptButtonsService,
              private deviceService: DeviceService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private toolbarService: ToolbarService,
              private icons: IconService) {
    this.setTranslations();
  }

  public onClick(): void {
    this.toolbarService.emitToolChanged(this);
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  ngOnInit() {
    this.getMapSelection();
    this.getConfiguredDevices();
    this.subscribeForDroppedDevice();
    this.fetchDevices();
    // this.toggleList();
  }

  setActive(): void {
    this.active = true;
    this.allowToDragAllAnchorsOnMap();
    this.toggleList();
    this.activateAllSelectablesBahavior();
  }

  setInactive(): void {
    this.removeDragFromAllAnchorsOnMap();
    this.toggleList();
    this.active = false;
    if (!this.placementDone) {
      this.accButtons.publishDecision(false);
      this.accButtons.publishVisibility(false);
    }
    this.deactivateAllSelectablesBahavior();
  }

  private getMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded) => {
      this.map = mapLoaded;
    });
  }

  private getConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        this.drawConfiguredDevices(configuration.data.sinks);
      }
      if (!!configuration.data.anchors) {
        this.drawAnchorsWithoutConnection(configuration.data.anchors);
      }
    });
  }

  private subscribeForDroppedDevice() {
    this.devicePlacerController.droppedDevice.subscribe(() => {
      if (!!this.draggedDevice) {
        this.placementDone = false;
        this.devicePlacerController.newCoordinates.first().subscribe((coords) => {
          let coordinates: Point;
          const map = d3.select('#map');
          if (!coords) {
            map.style('cursor', 'crosshair');
            map.on('click', () => {
              coordinates = {x: d3.event.offsetX, y: d3.event.offsetY};
              map.on('click', null);
              map.style('cursor', 'default');
            });
          } else {
            coordinates = coords;
          }
          this.placeDeviceOnMap(this.draggedDevice, coordinates);
        });
      }
    });
  }

  private fetchDevices() {
    this.deviceService.setUrl('anchors/');
    this.deviceService.getAll().subscribe((anchors: Anchor[]) => {
      anchors.forEach((anchor: Anchor) => {
        if (anchor.verified && !anchor.floorId) {
          this.remainingDevices.push(anchor);
        }
      });
    });
    this.deviceService.setUrl('sinks/');
    this.deviceService.getAll().subscribe((sinks: Sink[]) => {
      const testingArr: Sink[] = [];
      sinks.forEach((sink: Sink) => {
        testingArr.push(sink);
        if (sink.verified && !sink.floorId) {
          this.remainingDevices.push(sink);
        }
      });
    });
  }

  dragDeviceStarted(device: Anchor | Sink) {
    this.draggedDevice = device;
    this.toggleList();
  }

  dragDeviceEnded() {
    if (this.draggedDevice && this.placementDone) {
      this.toggleList();
    }
    this.draggedDevice = null;
  }


  private manageSelectable(mapDevice: Expandable): void {
    mapDevice.selectable.selectOn();
    const managedSelectable: Subscription = mapDevice.selectable.onSelected().subscribe((selectedMapDevice): d3.selection => {
      const id = DevicePlacerComponent.getShortIdFromSelection(selectedMapDevice);
      const selectedDevice = this.findMapDeviceByShortId(id);
      // TODO mark selected
    });
    this.managedSelectables.push(managedSelectable);
  }

  private activateAllSelectablesBahavior(): void {
    this.managedSelectables = [];
    this.mapDevices.forEach((mapDevice: Expandable) => {
      this.manageSelectable(mapDevice);
    });
  }

  private deactivateAllSelectablesBahavior(): void {
    this.mapDevices.forEach((mapDevice: Expandable) => {
      mapDevice.selectable.selectOff();
    });
    this.managedSelectables.forEach( (selectableSubscription) => {
      selectableSubscription.unsubscribe();
    });
    this.managedSelectables = [];
  }

  private findMapDeviceByShortId(shortId: number): Expandable {
    return this.mapDevices.find( (mapDevice: Expandable) => {
      return DevicePlacerComponent.getShortIdFromSelection(mapDevice.groupCreated.domGroup) === shortId;
    });
  }

  private drawConfiguredDevices(sinks: Array<Sink>): void {
    sinks.forEach((sink) => {
      const mapSink = this.drawDevice(sink,
        DevicePlacerComponent.buildSinkDrawConfiguration(sink),
        {x: sink.x, y: sink.y});
      sink.anchors.forEach((anchor) => {
        const mapAnchor = this.drawDevice(anchor,
          DevicePlacerComponent.buildAnchorDrawConfiguration(anchor),
          {x: anchor.x, y: anchor.y});
        const identifier = '' + sink.shortId + anchor.shortId;
        DevicePlacerComponent.createConnection(mapSink, mapAnchor, identifier);
      });
    });
  }

  private drawAnchorsWithoutConnection(anchors: Array<Anchor>): void {
    anchors.forEach((anchor) => {
      this.drawDevice(anchor, DevicePlacerComponent.buildAnchorDrawConfiguration(anchor), {x: anchor.x, y: anchor.y});
    });
  }

  public getToolName(): ToolName {
    return ToolName.ANCHOR;
  }

  private toggleList() {
    this.listState = this.listState === 'out' ? 'in' : 'out';
  }

  private allowToDragAllAnchorsOnMap(): void {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOn(false);
    });
  }

  private removeDragFromAllAnchorsOnMap() {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOff();
    });
  }

  private removeChosenAnchor(mapAnchor: Expandable): void {
    mapAnchor.connectable.domGroup.remove();
    this.devicePlacerController.resetChosenAnchor();
  }

  public emitToggleActive(): void {
    this.clicked.emit(this);
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('anchor.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private drawDevice(device: Device, deviceConfig: DrawConfiguration, coordinates: Point): Expandable {
    const drawBuilder = new DrawBuilder(this.map, deviceConfig);
    const droppedDevice = drawBuilder.createGroup()
      .place(coordinates)
      .addPointer({x: -12, y: -12}, this.icons.getIcon(NaviIcons.POINTER))
      .addText({x: 5, y: -5}, `${deviceConfig.clazz}-${deviceConfig.id}`);
      if (deviceConfig.clazz.includes(`sink`)) {
        droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.SINK));
      } else if (deviceConfig.clazz.includes(`anchor`)) {
        droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    const mapDevice: Expandable = {
      groupCreated: droppedDevice,
      selectable: new Selectable(droppedDevice),
      connectable: new ConnectableDevice(droppedDevice)
    };
    this.mapDevices.push(mapDevice);
    return mapDevice;
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (DevicePlacerComponent.isSinkType(device))
      ? DevicePlacerComponent.buildSinkDrawConfiguration(<Sink>device)
      : DevicePlacerComponent.buildAnchorDrawConfiguration(<Anchor>device);
    const expandableMapObject = this.drawDevice(device, drawOptions, coordinates);
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    expandableMapObject.connectable.dragOn(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      // TODO Change after decision logic to allow adding anchors alone GET THIS LOGIC DONE ~!
      if (decision) {
        // this.removeGroupDrag(droppedAnchorGroup);
        // this.drawingService.applyDragBehavior(droppedAnchorGroup, false);
        if (DevicePlacerComponent.isSinkType(device)) {
          // TODO selection -> this.selectSink(<Sink>device);
        } else {
          // this.chosenSink.anchors.push(device);
        }
        // TODO subscribe on selected event and push to managedArray
        this.manageSelectable(expandableMapObject);
        // ->  this.configurationService.setSink(this.chosenSink);
      } else {
        this.removeChosenAnchor(expandableMapObject);
      }
      this.devicePlacerController.resetCoordinates();
      this.placementDone = true;
      this.toggleList();
    });
  }

}
