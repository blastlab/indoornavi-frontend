import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorDistance} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {StepMsg, WizardData} from '../wizard';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';

@Component({
  selector: 'app-second-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class SecondStepComponent implements WizardStep {
  @Output() nextStepIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearView: EventEmitter<boolean> = new EventEmitter<boolean>();
  public stepIndex: number = 1;
  public title = 'Select an anchor and place on dashed circle.';
  public socketData = new Collections.Set<AnchorDistance>((distance: AnchorDistance) => {
    return '' + distance.anchorId;
  });
  public isLoading: boolean = true;
  public data: AnchorDistance;
  public coords: Array<Point> = [];
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  dialogRef: MdDialogRef<MdDialog>;

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private _accButtons: AcceptButtonsService,
              private _draw: DrawingService) {
  }

  public load(msg: any): void {
    this.socketData.add(msg);
    this.isLoading = (!this.socketData.size());
    }

  public openDialog(): void {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {disableClose: true});
  }

  public placeOnMap(data: AnchorDistance): void {
    this.coords = [];
    this.data = data;
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.dialogRef.close();
    this.drawSinkDistance(this.data.distance);
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
        this.removeSinkDistance();
        if (data) {
          const anchorGroup = d3.select('#map').select('#anchor' + this.data.anchorId);
          anchorGroup.on('.drag', null);
          anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
          this.nextStepIndex.emit(this.stepIndex + 1);
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  public drawSinkDistance(distance: number) {
    const map = d3.select('#map');
    const boxMargin = DrawingService.boxSize / 2;
    const sinkX = map.select('.wizardSink').attr('x');
    const sinkY = map.select('.wizardSink').attr('y');
      map.append('circle')
        .attr('id', 'sinkDistance')
        .attr('cx', parseInt(sinkX, null) + boxMargin)
        .attr('cy', parseInt(sinkY, null) + boxMargin)
        .attr('r', distance)
        .style('stroke', 'green')
        .style('stroke-dasharray', '10,3')
        .style('stroke-opacity', '0.9')
        .style('fill', 'none');
  }
  private removeSinkDistance() {
    d3.select('#map').select('#sinkDistance').remove();
  }

  public showSinkDistance() {
   d3.select('#map').select('#sinkDistance').style('display', 'flex');
  }

  public hideSinkDistance() {
   d3.select('#map').select('#sinkDistance').style('display', 'none');
  }

  public prepareToSend(data: WizardData): StepMsg {
    const degree = this.calculateDegree(data.sinkPosition, this.coords[0]);
    const invertedSinkPosition: Point = data.sinkPosition;
    invertedSinkPosition.y = -invertedSinkPosition.y;
    return {
      socketData: {
        sinkShortId: data.sinkShortId,
        sinkPosition: invertedSinkPosition,
        anchorShortId: this.data.anchorId,
        degree: degree
      },
      wizardData: {
        sinkShortId: data.sinkShortId,
        sinkPosition: data.sinkPosition,
        anchorShortId: this.data.anchorId,
        degree: degree,
        firstAnchorPosition: this.coords[0],
        secondAnchorPosition: null
      }};
  }

  private calculateDegree(sinkPosition: Point, anchorPosition: Point): number {
    const rad2deg = 180 / Math.PI;
    const degree = Math.atan2((sinkPosition.y - anchorPosition.y), (anchorPosition.x - sinkPosition.x)) * rad2deg;
    return ((degree < 0) ? 360 + degree : degree);
  }

  public clean(): void {
    this.coords = [];
    if (!!this.data) {
      d3.select('#map').select('#anchor' + this.data.anchorId).remove();
      this.data = null;
    }
    this.dialogRef.close();
  }
  public closeWizard(): void {
    this.clearView.emit(true);
  }
}
