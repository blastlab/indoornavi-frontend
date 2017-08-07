import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor.controller';
import {Point} from '../../../map.type';
import {MapObject} from '../selection/map-object.type';
import {Anchor} from '../../../../anchor/anchor.type';
import {NaviIcons} from '../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../sink/sink.type';
import {ConfigurationService} from '../../../../floor/configuration/configuration.service';


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
  public selectedAnchor: Anchor;

  constructor(public translate: TranslateService,
              private anchorPlacerController: AnchorPlacerController,
              private accButtons: AcceptButtonsService,
              private drawingService: DrawingService,
              private hintBar: HintBarService,
              private configuration: ConfigurationService) {
    this.setTranslations();
  }

  ngOnInit() {
    this.subscribeForAnchor();
    this.configuration.configurationLoaded().first().subscribe((config) => {
      this.floorId = config.floorId;
    });
  }

  public getToolName(): ToolName {
    return ToolName.ANCHOR;
  }

  setActive(): void {
    this.active = true;
    this.allowToDragAllAnchorsOnMap();
    this.showList();
  }

  setInactive(): void {
    this.removeObjectsDrag();
    this.hideList();
    this.active = false;
  }

  private hideList(): void {
    this.anchorPlacerController.setListVisibility(false);
  }

  private showList(): void {
    this.anchorPlacerController.setListVisibility(true);
  }

  private getSelectionOfAnchorsOnMap(): d3.selection {
    const map = d3.select('#map');
    return map.selectAll('.anchor');
  }

  private allowToDragAllAnchorsOnMap(): void {
    this.drawingService.applyDragBehavior(this.getSelectionOfAnchorsOnMap(), false);
  }

  private getAnchorsOnMapArray(selection: d3.selection): Array<HTMLElement> {
    const anchors = [];
    for (const anchor of selection._groups['0']) {
      anchors.push(anchor);
    }
    return anchors;
  }

  private removeObjectsDrag() {
    this.removeGroupDrag(this.getSelectionOfAnchorsOnMap());
  }

  private subscribeForAnchor() {
    this.anchorPlacerController.chosenAnchor.subscribe((anchor) => {
      if (!!anchor) {
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
          this.placeAnchorOnMap(anchor, coordinates);
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
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private drawDroppedAnchor(anchorMapObject: MapObject): d3.selection {
    return this.drawingService.drawObject(anchorMapObject.parameters, anchorMapObject.coordinates);
  }

  private placeAnchorOnMap(anchor: Anchor | Sink, coords: Point): void {
    const mapObject = (isSinkType(anchor)) ? this.buildSinkMapObject(<Sink>anchor, coords) : this.buildAnchorMapObject(anchor, coords);
    const droppedAnchorGroup = this.drawDroppedAnchor(mapObject);
    this.accButtons.publishCoordinates(coords);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      if (decision) {
        this.removeGroupDrag(droppedAnchorGroup);
        this.drawingService.applyDragBehavior(droppedAnchorGroup, false);
        // anchor.floorId = this.floorId;
        if (isSinkType(anchor)) {
          this.chosenSink = <Sink>anchor;
          this.configuration.addSink(this.chosenSink);
        } else {
          this.configuration.addAnchor(this.chosenSink, anchor);
        }
      } else {
        this.removeChosenAnchor(droppedAnchorGroup);
      }
      this.anchorPlacerController.setListVisibility(true);
    });

    function isSinkType(checkType: any): boolean {
      return (<Sink>checkType.anchors) !== undefined;
    }
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
        groupClass: 'sink',
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
