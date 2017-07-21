import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {AnchorSuggestedPositions} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {SocketMsg, WizardData} from '../wizard';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {DrawingService, ObjectParams} from '../../../../../utils/drawing/drawing.service';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';

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
              private accButtons: AcceptButtonsService,
              private draw: DrawingService,
              private hintBar: HintBarService) {
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
    this.coords = [];
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.translate.get('wizard.click.place.anchor', {id: this.data.anchorId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.drawSuggestedPositions(this.data.points);
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coords.push(coordinates);
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
        this.removeSuggestedPositions();
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

  public drawSuggestedPositions(positions: Array<Point>) {
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

  private removeSuggestedPositions() {
    d3.select('#map').selectAll('.suggested-position').remove();
  }

  public prepareToSend(data: WizardData): SocketMsg {
    const invertedSinkPosition: Point = data.sinkPosition;
    invertedSinkPosition.y = -invertedSinkPosition.y;
    return {
      sinkShortId: data.sinkShortId,
      sinkPosition: invertedSinkPosition,
      anchorShortId: data.anchorShortId,
      degree: data.degree
    };
  }

  public updateWizardData(data: WizardData): WizardData {
    return {
      sinkShortId: data.sinkShortId,
      sinkPosition: data.sinkPosition,
      anchorShortId: data.anchorShortId,
      degree: data.degree,
      firstAnchorPosition: data.firstAnchorPosition,
      secondAnchorPosition: this.coords[0]
    };
  }

  public clean(): void {
    this.coords = [];
    if (!!this.data) {
      this.removeSuggestedPositions();
      this.socketData.clear();
      d3.select('#map').select('#anchor' + this.data.anchorId).remove();
      this.data = null;
    }
  }

  public closeWizard(clean): void {
    this.clearView.emit(clean);
  }
}
