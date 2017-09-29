import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor.controller';
import {Point} from '../../../map.type';
import {MapObject} from '../selection/map-object.type';
import {NaviIcons} from '../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {ActionBarService} from '../../../actionbar/actionbar.service';


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

  static getSelectionOfAnchorsOnMap(): d3.selection {
    const map = d3.select('#map');
    return map.selectAll('.anchor');
  }

  constructor(public translate: TranslateService,
              private anchorPlacerController: AnchorPlacerController,
              private accButtons: AcceptButtonsService,
              private drawingService: DrawingService,
              private hintBar: HintBarService,
              private configurationService: ActionBarService) {
    this.setTranslations();
  }

  ngOnInit() {
    this.subscribeForAnchor();
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      // draw sinks and their anchors
      this.drawConfiguredDevices(configuration.data.sinks);
      console.log(configuration);
      // each sink group and his anchors - with connection
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

  private drawDroppedAnchor(anchorMapObject: MapObject): d3.selection {
    return this.drawingService.drawObject(anchorMapObject.parameters, anchorMapObject.coordinates);
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const mapObject = (isSinkType(device)) ? this.buildSinkMapObject(<Sink>device, coordinates) : this.buildAnchorMapObject(device, coordinates);
    const droppedAnchorGroup = this.drawDroppedAnchor(mapObject);
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      if (decision) {
        this.removeGroupDrag(droppedAnchorGroup);
        this.drawingService.applyDragBehavior(droppedAnchorGroup, false);
        if (isSinkType(device)) {
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

    function isSinkType(checkType: any): boolean {
      return (<Sink>checkType.anchors) !== undefined;
    }
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

  private buildAnchorMapObject(anchor: Anchor, coordinates: Point): MapObject {
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
  }

}
