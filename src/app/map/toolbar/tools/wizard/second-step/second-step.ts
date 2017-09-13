import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorDistance} from '../../../../../device/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {DrawingService, ObjectParams} from '../../../../../utils/drawing/drawing.service';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {SecondStepMessage, Step, WizardData} from '../wizard.type';

@Component({
  selector: 'app-second-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class SecondStepComponent implements WizardStep {
  @Output() nextStepIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearView: EventEmitter<boolean> = new EventEmitter<boolean>();
  public stepIndex: number = 1;
  public title = 'wizard.title.step2';
  public socketData = new Collections.Set<AnchorDistance>(SecondStepComponent.compareFn);
  public isLoading: boolean = true;
  public data: AnchorDistance;
  public coordinates: Array<Point> = [];
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  dialogRef: MdDialogRef<MdDialog>;

  private static compareFn(distance: AnchorDistance): string {
    return '' + distance.anchorId;
  }

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private accButtons: AcceptButtonsService,
              private draw: DrawingService,
              private hintBar: HintBarService) {
  }

  public load(msg: any): void {
    if (this.isDistanceType(msg)) {
      this.socketData.add(msg);
    }
    this.isLoading = (!this.socketData.size());
  }

  protected isDistanceType(checkType: any): boolean {
    return (<AnchorDistance>checkType.distance) !== undefined;
  }

  public openDialog(): void {
    this.translate.get(this.title).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.dialogRef = this.dialog.open(this.dialogTemplate);
    this.dialogRef.afterClosed().subscribe((closeAndPlaceOnMap: boolean) => {
      if (closeAndPlaceOnMap === true) {
        this.placeOnMap(this.data);
      } else {
        this.closeWizard(false);
      }
    });
  }

  public placeOnMap(data: AnchorDistance): void {
    this.coordinates = [];
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.translate.get('wizard.click.place.anchor', {id: this.data.anchorId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.drawSinkDistance(this.data.distance);
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coordinates.push(coordinates);
      const anchorParams: ObjectParams = {
        id: 'anchor' + this.data.anchorId, iconName: NaviIcons.ANCHOR,
        groupClass: 'wizardAnchor', markerClass: 'anchorMarker', fill: 'green'
      };
      this.draw.drawObject(anchorParams, coordinates);
      map.on('click', null);
      map.style('cursor', 'default');
      this.makeDecision(coordinates);
    });
  }

  public makeDecision(coordinates: Point): void {
    this.translate.get('wizard.confirm.anchor', {id: this.data.anchorId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe(
      data => {
        this.removeSinkDistance();
        if (data) {
          this.removeGroupDrag();
          this.goToNextStep();
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  private removeGroupDrag(): void {
    const anchorGroup = d3.select('#map').select('#anchor' + this.data.anchorId);
    anchorGroup.on('.drag', null);
    anchorGroup.style('cursor', 'default');
    anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
  }

  public goToNextStep(): void {
    this.nextStepIndex.emit(this.stepIndex + 1);
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

  public prepareToSend(data: WizardData): SecondStepMessage {
    const invertedSinkPosition: Point = {...data.sinkPosition};
    invertedSinkPosition.y = -invertedSinkPosition.y;
    return {

        sinkPosition: invertedSinkPosition,
        anchorShortId: this.data.anchorId,
      degree: data.degree,
      step: Step.SECOND
    };
  }

  public updateWizardData(data: WizardData): WizardData {
    return {
      sinkShortId: data.sinkShortId,
      sinkPosition: data.sinkPosition,
      firstAnchorShortId: this.data.anchorId,
      degree: this.calculateDegree(data.sinkPosition, this.coordinates[0]),
      firstAnchorPosition: this.coordinates[0],
      secondAnchorPosition: null,
      secondAnchorShortId: null
    };
  }

  private calculateDegree(sinkPosition: Point, anchorPosition: Point): number {
    const rad2deg = 180 / Math.PI;
    const degree = Math.atan2((sinkPosition.y - anchorPosition.y), (anchorPosition.x - sinkPosition.x)) * rad2deg;
    return ((degree < 0) ? 360 + degree : degree);
  }

  public clean(): void {
    this.coordinates = [];
    if (!!this.data) {
      const map = d3.select('#map');
      map.select('#anchor' + this.data.anchorId).remove();
      map.select('#sinkDistance').remove();
      this.data = null;
    }
  }

  public closeWizard(clean: boolean): void {
    this.clearView.emit(clean);
  }
}
