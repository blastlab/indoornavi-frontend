import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor.controller';
import {Point} from '../../../map.type';
import {IconService, NaviIcons} from '../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {ActionBarService} from '../../../actionbar/actionbar.service';
import {DrawBuilder, DrawConfiguration} from '../../../../utils/builder/draw.builder';
import {Draggable} from '../../../../utils/builder/draggable';
import {Subscription} from 'rxjs/Subscription';
import {MapLoaderInformerService} from 'app/utils/map-loader-informer/map-loader-informer.service';
import {ConnectingLine} from '../../../../utils/builder/connection';
import {Device} from '../../../../device/device.type';
import {ConnectableDevice} from 'app/utils/builder/connectableDevice';
import {Selectable} from '../../../../utils/builder/selectable';

@Component({
  selector: 'app-anchor-placer',
  templateUrl: './anchor.html',
  styleUrls: ['../tool.css']
})
export class AnchorPlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public active: boolean = false;
  public hintMessage: string;
  private mapDevices: ConnectableDevice[] = [];
  private floorId: number;
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
              private hintBar: HintBarService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private icons: IconService) {
    this.setTranslations();
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

  public createConnection(sink: ConnectableDevice, anchor: ConnectableDevice, id: string): ConnectingLine {
    const connectingLine = new ConnectingLine(sink, anchor, id);
    /*  sink.sinkConnections.push(connectingLine);
        anchor.anchorConnection = connectingLine;*/
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
    this.mapDevices.forEach((draggable) => {
      draggable.dragOn(false);
    });
  }

  private removeDragFromAllAnchorsOnMap() {
    this.mapDevices.forEach((draggable) => {
      draggable.dragOff();
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

  private removeChosenAnchor(mapAnchor: ConnectableDevice): void {
    mapAnchor.domGroup.remove();
    this.anchorPlacerController.resetChosenAnchor();
  }

  /*
    private removeGroupDrag(anchorGroup: d3.selection): void {
      anchorGroup.on('.drag', null);
      anchorGroup.style('cursor', 'default');
      anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
    }*/

  public emitToggleActive(): void {
    this.clicked.emit(this);
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('anchor.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private drawDevice(device: Device, deviceConfig: DrawConfiguration, coordinates: Point): d3.selection {
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
    console.log(droppedDevice);
    const draggableObject = new Draggable(droppedDevice);
    draggableObject.dragOn(true);
    console.log(draggableObject);
    const selectableObject = new Selectable(droppedDevice);
    /*selectableObject.onSelected().subscribe(() => {
    });*/
    console.log(selectableObject);
    const mapDevice = new ConnectableDevice(droppedDevice, device);
    console.log(mapDevice);
    // this.mapDevices.push(mapDevice);
    return droppedDevice;
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (AnchorPlacerComponent.isSinkType(device)) ? this.buildSinkDrawConfiguration(<Sink>device) : this.buildAnchorDrawConfiguration(<Anchor>device);
    const droppedAnchorGroup = this.drawDevice(device, drawOptions, coordinates);
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    droppedAnchorGroup.dragOn(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      // TODO Change after decision logic to allow adding anchors alone
      if (decision) {
        // this.removeGroupDrag(droppedAnchorGroup);
        // this.drawingService.applyDragBehavior(droppedAnchorGroup, false);
        if (AnchorPlacerComponent.isSinkType(device)) {
          // TODO selection -> this.selectSink(<Sink>device);
        } else {
          // this.chosenSink.anchors.push(device);
        }
        // ->  this.configurationService.setSink(this.chosenSink);
      } else {
        this.removeChosenAnchor(droppedAnchorGroup);
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
