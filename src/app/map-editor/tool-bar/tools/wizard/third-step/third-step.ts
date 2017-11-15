import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorSuggestedPositions} from '../../../../../device/anchor.type';
import {AcceptButtonsService} from '../../../../../shared/components/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {DrawingService, ObjectParams} from '../../../../../utils/drawing/drawing.service';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {SocketMessage, Step, WizardData} from '../wizard.type';

@Component({
  selector: 'app-third-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class ThirdStepComponent implements WizardStep {
  @Output() nextStepIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearView: EventEmitter<boolean> = new EventEmitter<boolean>();
  public stepIndex: number = 2;
  public title = 'wizard.title.step3';
  public socketData = new Collections.Set<AnchorSuggestedPositions>(ThirdStepComponent.compareFn);
  public isLoading: boolean = true;
  public data: AnchorSuggestedPositions;
  public coordinates: Array<Point>;
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  dialogRef: MdDialogRef<MdDialog>;

  private static compareFn(positions: AnchorSuggestedPositions): string {
    return '' + positions.anchorId;
  }

  private static isPositionsType(checkType: any): boolean {
    return (<AnchorSuggestedPositions>checkType.points) !== undefined;
  }

  private static drawSuggestedPositions(positions: Array<Point>) {
    const secondAnchor = d3.select('#map')
      .data(positions);
    for (let i = 0; i < positions.length; i++) {
      secondAnchor.append('circle')
        .attr('class', 'suggested-position')
        .attr('cx', positions[i].x)
        .attr('cy', -positions[i].y)
        .attr('r', 5)
        .style('stroke', 'yellow');
    }
  }

  private static removeSuggestedPositions() {
    d3.select('#map').selectAll('.suggested-position').remove();
  }

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private acceptButtonsService: AcceptButtonsService,
              private drawingService: DrawingService,
              private hintBar: HintBarService) {
  }

  public load(msg: any): void {
    if (ThirdStepComponent.isPositionsType(msg)) {
      this.socketData.add(msg);
    }
    this.isLoading = (!this.socketData.size());
  }

  public openDialog(): void {
    this.translate.get(this.title).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.dialogRef = this.dialog.open(this.dialogTemplate);
    this.dialogRef.afterClosed().subscribe((closeAndPlaceOnMap: boolean) => {
      if (closeAndPlaceOnMap) {
        this.placeOnMap(this.data);
      } else {
        this.closeWizard(false);
      }
    });
  }

  public placeOnMap(data: AnchorSuggestedPositions): void {
    this.coordinates = [];
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.translate.get('wizard.click.place.anchor', {id: this.data.anchorId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    ThirdStepComponent.drawSuggestedPositions(this.data.points);
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coordinates.push(coordinates);
      const anchorParams: ObjectParams = {
        id: 'anchor' + this.data.anchorId, iconName: NaviIcons.ANCHOR,
        groupClass: 'wizardAnchor', markerClass: 'anchorMarker', fill: 'green'
      };
      this.drawingService.drawObject(anchorParams, coordinates);
      map.on('click', null);
      map.style('cursor', 'default');
      this.makeDecision(coordinates);
    });
  }

  public makeDecision(coordinates: Point): void {
    this.translate.get('wizard.confirm.anchor', {id: this.data.anchorId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.acceptButtonsService.publishCoordinates(coordinates);
    this.acceptButtonsService.publishVisibility(true);
    this.acceptButtonsService.decisionMade.first().subscribe(
      data => {
        ThirdStepComponent.removeSuggestedPositions();
        if (data) {
          this.removeGroupDrag();
          this.goToNextStep();
        } else {
          this.clean();
          this.openDialog();
        }
      });
  }

  public goToNextStep(): void {
    this.nextStepIndex.emit(this.stepIndex + 1);
  }

  public prepareToSend(data: WizardData): SocketMessage {
    return {
        step: Step.THIRD
    };
  }

  public updateWizardData(data: WizardData): WizardData {
    return {
      sinkShortId: data.sinkShortId,
      sinkPosition: data.sinkPosition,
      firstAnchorShortId: data.firstAnchorShortId,
      degree: data.degree,
      firstAnchorPosition: data.firstAnchorPosition,
      secondAnchorPosition: this.coordinates[0],
      secondAnchorShortId: this.data.anchorId
    };
  }

  public clean(): void {
    this.coordinates = [];
    if (!!this.data) {
      ThirdStepComponent.removeSuggestedPositions();
      this.socketData.clear();
      d3.select('#map').select('#anchor' + this.data.anchorId).remove();
      this.data = null;
    }
  }

  public closeWizard(clean: boolean): void {
    this.clearView.emit(clean);
  }

  private removeGroupDrag(): void {
    const anchorGroup = d3.select('#map').select('#anchor' + this.data.anchorId);
    anchorGroup.on('.drag', null);
    anchorGroup.style('cursor', 'default');
    anchorGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
  }

}
