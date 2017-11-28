import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor.controller';
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

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html',
  styleUrls: ['../tool.css']
})
export class DevicePlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public active: boolean = false;
  private mapDevices: Expandable[] = [];
  private floorId: number;
  private hintMessage: string;
  public chosenSink: Sink;
  private placementDone: boolean;
  private mapLoadedSubscription: Subscription;
  protected map: d3.selection;

  static isSinkType(checkType: any): boolean {
    return (<Sink>checkType.anchors) !== undefined;
  }

  constructor(public translate: TranslateService,
              private anchorPlacerController: AnchorPlacerController,
              private accButtons: AcceptButtonsService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
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
    this.subscribeForAnchor();
  }

  private getMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.map = d3.select('#map');
    });
  }

  private getConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      console.log(configuration);
      if (!!configuration.data.sinks) {
        this.drawConfiguredDevices(configuration.data.sinks);
      }
      if (!!configuration.data.anchors) {
        this.drawAnchorsWithoutConnection(configuration.data.anchors);
      }
    });
  }

  private drawConfiguredDevices(sinks: Array<Sink>): void {
    sinks.forEach((sink) => {
      const mapSink = this.drawDevice(sink, this.buildSinkDrawConfiguration(sink), {x: sink.x, y: sink.y});
      sink.anchors.forEach((anchor) => {
        const mapAnchor = this.drawDevice(anchor, this.buildAnchorDrawConfiguration(anchor), {
          x: anchor.x,
          y: anchor.y
        });
        const identifier = '' + sink.shortId + anchor.shortId;
        this.createConnection(mapSink, mapAnchor, identifier);
      });
    });
  }

  public createConnection(sink: Expandable, anchor: Expandable, id: string): ConnectingLine {
    const connectingLine = new ConnectingLine(sink.connectable, anchor.connectable, id);
    sink.connectable.sinkConnections.push(connectingLine);
    anchor.connectable.anchorConnection = connectingLine;
    return connectingLine;
  }

  private drawAnchorsWithoutConnection(anchors: Array<Anchor>): void {
    anchors.forEach((anchor) => {
      this.drawDevice(anchor, this.buildAnchorDrawConfiguration(anchor), {x: anchor.x, y: anchor.y});
    });
  }


  public getToolName(): ToolName {
    return ToolName.ANCHOR;
  }

  setActive(): void {
    this.active = true;
    this.allowToDragAllAnchorsOnMap();
    this.toggleList();
  }

  setInactive(): void {
    this.removeDragFromAllAnchorsOnMap();
    this.toggleList();
    this.active = false;
    if (!this.placementDone) {
      this.accButtons.publishDecision(false);
      this.accButtons.publishVisibility(false);
    }
  }

  private toggleList(): void {
    this.anchorPlacerController.toggleListVisibility();
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

  private subscribeForAnchor() {
    this.anchorPlacerController.chosenAnchor.subscribe((anchor) => {
      if (!!anchor) {
        this.placementDone = false;
        this.anchorPlacerController.newCoordinates.first().subscribe((coords) => {
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
          this.placeDeviceOnMap(anchor, coordinates);
        });
      }
    });
  }

  private removeChosenAnchor(mapAnchor: Expandable): void {
    mapAnchor.connectable.domGroup.remove();
    this.anchorPlacerController.resetChosenAnchor();
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
    const drawOptions = (DevicePlacerComponent.isSinkType(device)) ? this.buildSinkDrawConfiguration(<Sink>device) : this.buildAnchorDrawConfiguration(<Anchor>device);
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
        // ->  this.configurationService.setSink(this.chosenSink);
      } else {
        this.removeChosenAnchor(expandableMapObject);
      }
      this.anchorPlacerController.resetCoordinates();
      this.placementDone = true;
      this.toggleList();
    });
  }

  private buildAnchorDrawConfiguration(anchor: Anchor): DrawConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      cursor: `pointer`
    };
  }

  private buildSinkDrawConfiguration(sink: Sink): DrawConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      cursor: `pointer`
    };
  }

}
