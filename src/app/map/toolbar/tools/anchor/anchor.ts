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


@Component({
  selector: 'app-anchor-placer',
  templateUrl: './anchor.html',
  styleUrls: ['../tool.css']
})
export class AnchorPlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public toolName: ToolName = ToolName.ANCHOR;
  public hintMessage: string;
  public active: boolean = false;

  constructor(public translate: TranslateService,
              private anchorPlacerController: AnchorPlacerController,
              private accButtons: AcceptButtonsService,
              private draw: DrawingService,
              private hintBar: HintBarService) {
    this.setTranslations();
  }

  ngOnInit() {
    this.subscribeForAnchor();
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

  private allowDrag(): void {
    // TODO select all anchors and bind drag
  }

  private drawDroppedAnchor(anchorMapObject: MapObject): d3.selection {
    return this.draw.drawObject(anchorMapObject.parameters, anchorMapObject.coordinates);
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

  private placeAnchorOnMap(anchor: Anchor, coords: Point): void {
    const droppedAnchorGroup = this.drawDroppedAnchor(this.buildAnchorMapObject(anchor, coords));
    this.accButtons.publishCoordinates(coords);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      if (decision) {
        this.removeGroupDrag(droppedAnchorGroup);
        this.draw.applyDragBehavior(droppedAnchorGroup, false);
        // TODO update remainingDevices
      } else {
        this.removeChosenAnchor(droppedAnchorGroup);
      }
      this.anchorPlacerController.setListVisibility(true);
    });
  }

  setActive(): void {
    this.active = true;
    this.showList();
  }

  setInactive(): void {
    this.removeObjectsDrag();
    this.hideList();
    this.active = false;
  }

  private selectAnchorsOnMap(): d3.selection {
    const map = d3.select('#map');
    return map.selectAll('.anchor');
  }

  private removeObjectsDrag() {
    console.log(this.selectAnchorsOnMap());
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private hideList(): void {
    this.anchorPlacerController.setListVisibility(false);
  }

  private showList(): void {
    this.anchorPlacerController.setListVisibility(true);
  }

}
