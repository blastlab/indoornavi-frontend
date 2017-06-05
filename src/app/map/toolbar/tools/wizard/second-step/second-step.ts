import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {DialogComponent} from '../../../../../utils/dialog/dialog.component';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorDistance} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {StepMsg, WizardData} from '../wizard';

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

  dialogRef: MdDialogRef<DialogComponent>;

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private _accButtons: AcceptButtonsService) {
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
      map.on('click', null);
      map.style('cursor', 'default');
      this.updateAnchorMarker();
      this.makeDecision(coordinates);
    });
  }

  private updateAnchorMarker() {
    const anchorDist = d3.select('#map').append('g')
      .attr('id', ('anchor' + this.data.anchorId))
      .attr('class', 'wizardAnchor wizardFirstAnchor');
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
        this.removeSinkDistance();
        if (data) {
          d3.select('#map').select('#anchor' + this.data.anchorId).select('.anchorMarker').on('.drag', null);
          this.nextStepIndex.emit(this.stepIndex + 1);
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  public drawSinkDistance(distance: number) {
    const sink = d3.select('#map').select('.wizardSink');
    const sinkX = sink.select('.sinkMarker').attr('cx');
    const sinkY = sink.select('.sinkMarker').attr('cy');
      sink.append('circle')
        .attr('class', 'sinkDistance')
        .attr('cx', sinkX)
        .attr('cy', sinkY)
        .attr('r', distance)
        .style('stroke', 'green')
        .style('stroke-dasharray', '10,3')
        .style('stroke-opacity', '0.9')
        .style('fill', 'none');
  }
  private removeSinkDistance() {
    d3.select('#map').select('.wizardSink').select('.sinkDistance').remove();
  }

  public showSinkDistance() {
   d3.select('#map').select('.wizardSink').select('.sinkDistance').style('display', 'flex');
  }

  public hideSinkDistance() {
   d3.select('#map').select('.wizardSink').select('.sinkDistance').style('display', 'none');
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
    console.log(degree);
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
