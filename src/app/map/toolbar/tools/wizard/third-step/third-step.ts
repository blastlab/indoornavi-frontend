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
              private _accButtons: AcceptButtonsService) {
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
      map.on('click', null);
      map.style('cursor', 'default');
      this.updateAnchorMarker();
      this.makeDecision(coordinates);
    });
  }

  private updateAnchorMarker() {
    const anchorDist = d3.select('#map').append('g')
      .attr('id', ('anchor' + this.data.anchorId))
      .attr('class', 'wizardAnchor wizardSecondAnchor');
    const marker = anchorDist.selectAll('circle').data(this.coords).enter().append('circle')
      .attr('class', 'anchorMarker')
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      })
      .attr('r', 7)
      .style('fill', 'blue')
      .style('opacity', 0.6);
    const anchorDrag = d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);
    function dragStarted() {
      d3.select(this).raise().classed('active', true);
    }
    function dragged() {
      d3.select(this).attr('cx', (d) => {
        return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), d3.event.x));
      })
        .attr('cy', (d) => {
          return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
        });
      d3.select('#accept-buttons').style('top', Math.max(0, Math.min((d3.select('#map').attr('height') - 100 ), d3.event.y)) + 'px');
      d3.select('#accept-buttons').style('left', Math.max(75, Math.min((d3.select('#map').attr('width') - 75 ), d3.event.x)) + 'px');
    }
    function dragEnded() {
      d3.select(this).classed('active', false);
    }
    marker.call(anchorDrag);
  }

  public makeDecision(coordinates: Point): void {
    this._accButtons.publishCoordinates(coordinates);
    this._accButtons.publishVisibility(true);
    this._accButtons.decision$.first().subscribe(
      data => {
        this.removeSuggestedPositions();
        if (data) {
          d3.select('#map').select('#anchor' + this.data.anchorId).select('.anchorMarker').on('.drag', null);
          this.nextStepIndex.emit(this.stepIndex + 1);
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  public drawSuggestedPositions(positions: Array<Point>) {
    const secondAnchor = d3.select('#map').select('.wizardFirstAnchor')
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
    d3.select('#map').select('.wizardFirstAnchor').selectAll('.suggested-position').remove();
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
