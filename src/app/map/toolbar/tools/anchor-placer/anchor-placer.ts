import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from './anchor-placer.controller';
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
  templateUrl: './anchor-placer.html',
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
        // TODO if there's no coords:
        const map = d3.select('#map');
        map.style('cursor', 'crosshair');
        console.log('cross');
        map.on('click', () => {
          const coordinates = {x: d3.event.offsetX, y: d3.event.offsetY};
          this.drawStickyAnchor(this.buildAnchorMapObject(anchor, coordinates));
          map.on('click', null);
          map.style('cursor', 'default');
          this.accButtons.publishCoordinates(coordinates);
          this.accButtons.publishVisibility(true);
          this.accButtons.decisionMade.first().subscribe((decision) => {
            if (decision) {
              this.removeGroupDrag(anchor);
              // TODO update remainingDevices
            } else {
              this.removeChosenAnchor(anchor);
            }
            this.anchorPlacerController.setListVisibility(true);
          });
        });

      }
    });
  }

  private removeChosenAnchor(anchor: Anchor): void {
    d3.select('#map').select('#anchor' + anchor.shortId).remove();
    this.anchorPlacerController.resetChosenAnchor();

  }

  private removeGroupDrag(anchor: Anchor): void {
    const anchorGroup = d3.select('#map').select('#anchor' + anchor.shortId);
    anchorGroup.on('.drag', null);
    anchorGroup.style('cursor', 'default');
    anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
  }

  public emitToggleActive(): void {
    this.clicked.emit(this);
  }

  private allowDrag(): void {
  }

  private drawStickyAnchor(anchorMapObject: MapObject) {
    this.draw.drawObject(anchorMapObject.parameters, anchorMapObject.coordinates);
  }

  private buildAnchorMapObject(anchor: Anchor, coordinates: Point): MapObject {
    return {
      parameters: {
        id: 'anchor' + anchor.shortId,
        iconName: NaviIcons.ANCHOR,
        groupClass: 'anchor' + anchor.shortId,
        markerClass: 'anchorMarker' + anchor.id,
        fill: 'green'
      },
      coordinates: {
        x: coordinates.x,
        y: coordinates.y
      }
    };
  }

  private placeOnMap(coords: Point): void {
    // call drawing service
  }

  setActive(): void {
    this.active = true;
    this.anchorPlacerController.setListVisibility(true);
  }

  setInactive(): void {
    this.active = false;
    this.anchorPlacerController.setListVisibility(false);
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }
}
