import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor.controller';
import {Point} from '../../../map.type';
import {IconService, NaviIcons} from '../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {ActionBarService} from '../../../actionbar/actionbar.service';
import {DrawBuilder, DrawConfiguration} from '../../../../utils/builder/draw.builder';
import {Draggable} from '../../../../utils/builder/draggable';
import {Subscription} from 'rxjs/Subscription';
import {MapLoaderInformerService} from 'app/utils/map-loader-informer/map-loader-informer.service';


@Component({
  selector: 'app-anchor-placer',
  templateUrl: './anchor.html',
  styleUrls: ['../tool.css']
})
export class AnchorPlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: string;
  public active: boolean = false;
  private floorId: number;
  public chosenSink: Sink;
  private placementDone: boolean;
  private mapLoadedSubscription: Subscription;
  private map: d3.selection;

  static isSinkType(checkType: any): boolean {
    return (<Sink>checkType.anchors) !== undefined;
  }

  static getSelectionOfAnchorsOnMap(): d3.selection {
    const map = d3.select('#map');
    return map.selectAll('.anchor');
  }

  constructor(public translate: TranslateService,
              private anchorPlacerController: AnchorPlacerController,
              private accButtons: AcceptButtonsService,
              private drawingService: DrawingService,
              private hintBar: HintBarService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private icons: IconService) {
    this.setTranslations();
  }

  ngOnInit() {
    this.subscribeForAnchor();
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      this.drawConfiguredDevices(configuration.data.sinks);
      console.log(configuration);
    });
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.map = d3.select('#map');
    });
  }

  private drawConfiguredDevices(sinks: Array<Sink>): void {
    const mapAnchorsSelection = AnchorPlacerComponent.getSelectionOfAnchorsOnMap().data(sinks);
    console.log(mapAnchorsSelection.enter());
    // TODO call drawing service here
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
    this.removeObjectsDrag();
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
    this.drawingService.applyDragBehavior(AnchorPlacerComponent.getSelectionOfAnchorsOnMap(), false);
  }

  private removeObjectsDrag() {
    this.removeGroupDrag(AnchorPlacerComponent.getSelectionOfAnchorsOnMap());
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

  private removeChosenAnchor(anchorGroup: d3.selection): void {
    anchorGroup.remove();
    this.anchorPlacerController.resetChosenAnchor();
  }

  private removeGroupDrag(anchorGroup: d3.selection): void {
    anchorGroup.on('.drag', null);
    anchorGroup.style('cursor', 'default');
    anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
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

  private drawDroppedDevice(deviceConfig: DrawConfiguration, coordinates: Point): d3.selection {
    const droppedDevice = new DrawBuilder(this.map, deviceConfig);
    const deviceGroup = droppedDevice.createGroup()
      .addIcon({x: coordinates.x - 12, y: coordinates.y - 12}, this.icons.getIcon(NaviIcons.POINTER));
    if (deviceConfig.clazz === `sink`) {
      deviceGroup.addIcon({x: coordinates.x + 5, y: coordinates.y + 5}, this.icons.getIcon(NaviIcons.SINK));
    } else if (deviceConfig.clazz === `anchor`) {
      deviceGroup.addIcon({x: coordinates.x + 5, y: coordinates.y + 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    deviceGroup.group.append();
    return new Draggable(deviceGroup);
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (AnchorPlacerComponent.isSinkType(device)) ? this.buildSinkDrawConfiguration(<Sink>device) : this.buildAnchorDrawConfiguration(<Anchor>device);
    const droppedAnchorGroup = this.drawDroppedDevice(drawOptions, coordinates);
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      // TODO Change after decision logic to allow adding anchors alone
      if (decision) {
        this.removeGroupDrag(droppedAnchorGroup);
        this.drawingService.applyDragBehavior(droppedAnchorGroup, false);
        if (AnchorPlacerComponent.isSinkType(device)) {
          this.selectSink(<Sink>device);
        } else {
          this.chosenSink.anchors.push(device);
        }
        this.configurationService.setSink(this.chosenSink);
      } else {
        this.removeChosenAnchor(droppedAnchorGroup);
      }
      this.anchorPlacerController.resetCoordinates();
      this.placementDone = true;
      this.toggleList();
    });
  }

  private selectSink(sink: Sink) {
    this.anchorPlacerController.setChosenSink(sink);
    this.chosenSink = sink;
    this.anchorPlacerController.selectDevice(sink);
  }

  private deselectSink() {
    this.anchorPlacerController.resetChosenSink();
    this.chosenSink = undefined;
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
      clazz: `sink`,
      cursor: `pointer`
    };
  }

  /*private buildAnchorMapObject(anchor: Anchor, coordinates: Point): MapObject {
    return {
      parameters: {
        id: 'anchor' + anchor.shortId,
        iconName: NaviIcons.ANCHOR,
        groupClass: 'anchor',
        markerClass: 'anchorMarker' + anchor.id,
        fill: 'green'
      },
      coordinates: {
        x: coordinates.x,
        y: coordinates.y
      }
    };
  }

  private buildSinkMapObject(sink: Sink, coordinates: Point): MapObject {
    return {
      parameters: {
        id: 'sink' + sink.shortId,
        iconName: NaviIcons.SINK,
        groupClass: 'sink anchor',
        markerClass: 'sinkMarker' + sink.id,
        fill: 'blue'
      },
      coordinates: {
        x: coordinates.x,
        y: coordinates.y
      }
    };
  }*/

}
