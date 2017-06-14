import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorSuggestedPositions} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {StepMsg, WizardData} from '../wizard';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';

@Component({
  selector: 'app-third-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class ThirdStepComponent implements WizardStep {
  @Output() nextStepIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearView: EventEmitter<boolean> = new EventEmitter<boolean>();
  public stepIndex: number = 2;
  public title = 'Select an anchor and place on suggested place.';
  public socketData = new Collections.Set<AnchorSuggestedPositions>((positions: AnchorSuggestedPositions) => {
    return '' + positions.anchorId;
  });
  public isLoading: boolean = true;
  public data: AnchorSuggestedPositions;
  public coords: Array<Point>;
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  dialogRef: MdDialogRef<MdDialog>;

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private _accButtons: AcceptButtonsService,
              private _draw: DrawingService) {
  }

  public load(msg: any): void {
    if (this.isPositionsType(msg)) {
      this.socketData.add(msg);
    }
    this.isLoading = (!this.socketData.size());
  }
  protected isPositionsType(checkType: any): boolean {
    return (<AnchorSuggestedPositions>checkType.points) !== undefined;
  }

  public openDialog(): void {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {disableClose: true});
  }

  public placeOnMap(data: AnchorSuggestedPositions): void {
    this.coords = [];
    this.data = data;
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.drawSuggestedPositions(this.data.points);
    this.dialogRef.close();
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coords.push(coordinates);
      this._draw.drawObject('anchor' + this.data.anchorId,
        {iconName: NaviIcons.ANCHOR, fill: 'green'}, coordinates , ['wizardAnchor', 'anchorMarker']);
      map.on('click', null);
      map.style('cursor', 'default');
      this.makeDecision(coordinates);
    });
  }

  public makeDecision(coordinates: Point): void {
    this._accButtons.publishCoordinates(coordinates);
    this._accButtons.publishVisibility(true);
    this._accButtons.decision$.first().subscribe(
      data => {
        this.removeSuggestedPositions();
        if (data) {
          const anchorGroup = d3.select('#map').select('#anchor' + this.data.anchorId).select('.anchorMarker');
          anchorGroup.on('.drag', null);
          anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
          this.nextStepIndex.emit(this.stepIndex + 1);
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  public drawSuggestedPositions(positions: Array<Point>) {
    const secondAnchor = d3.select('#map')
      .data(positions);
    for (let i = 0 ; i < positions.length ; i++) {

      secondAnchor.append('circle')
        .attr('class', 'suggested-position')
        .attr('cx', positions[i].x)
        .attr('cy', -positions[i].y)
        .attr('r', 5)
        .style('stroke', 'yellow');
    }
  }
  private removeSuggestedPositions() {
    d3.select('#map').selectAll('.suggested-position').remove();
  }

  public prepareToSend(data: WizardData): StepMsg {
    const invertedSinkPosition: Point = data.sinkPosition;
    invertedSinkPosition.y = -invertedSinkPosition.y;
    return {
      socketData: {
        sinkShortId: data.sinkShortId,
        sinkPosition: invertedSinkPosition,
        anchorShortId: data.anchorShortId,
        degree: data.degree
      },
      wizardData: {
        sinkShortId: data.sinkShortId,
        sinkPosition: data.sinkPosition,
        anchorShortId: data.anchorShortId,
        degree: data.degree,
        firstAnchorPosition: data.firstAnchorPosition,
        secondAnchorPosition: this.coords[0]
      }};
  }
  public clean(): void {
    this.coords = [];
    if (!!this.data) {
      this.removeSuggestedPositions();
      this.socketData.clear();
      d3.select('#map').select('#anchor' + this.data.anchorId).remove();
      this.data = null;
    }
    this.dialogRef.close();
  }

  public closeWizard(): void {
    this.clearView.emit(true);
  }
}
