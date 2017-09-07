import {Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {Anchor} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {DrawingService, ObjectParams} from '../../../../../utils/drawing/drawing.service';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {FirstStepMessage, Step, WizardData} from '../wizard.type';
import {Sink} from '../../../../../sink/sink.type';
import {Floor} from '../../../../../floor/floor.type';

@Component({
  selector: 'app-first-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class FirstStepComponent implements WizardStep {
  @Output() nextStepIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearView: EventEmitter<boolean> = new EventEmitter<boolean>();
  public stepIndex: number = 0;
  public title = 'wizard.title.step1';
  public socketData = new Collections.Set<Anchor>(FirstStepComponent.compareFn);
  public isLoading: boolean = true;
  public data: Sink;
  public coordinates: Array<Point>;
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;
  @Input() floor: Floor;

  dialogRef: MdDialogRef<MdDialog>;

  private static compareFn(sink: Anchor): string {
    return '' + sink.shortId;
  }

  constructor(public translate: TranslateService,
              public dialog: MdDialog,
              private accButtons: AcceptButtonsService,
              private draw: DrawingService,
              private hintBar: HintBarService) {
  }

  public load(msg: any): void {
    Collections.arrays.forEach(msg, (sink: Anchor) => {
      this.socketData.add(sink);
      this.isLoading = (!this.socketData.size());
    });
  }

  public openDialog(): void {
    this.translate.get('wizard.dialog.select.sink').subscribe((text: string) => {
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

  public placeOnMap(data: Sink): void {
    this.coordinates = [];
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.translate.get('wizard.click.place.sink', {id: this.data.shortId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coordinates.push(coordinates);
      const sinkParams: ObjectParams = {
        id: 'sink' + this.data.shortId, iconName: NaviIcons.ANCHOR,
        groupClass: 'wizardSink', markerClass: 'sinkMarker', fill: 'blue'
      };
      this.draw.drawObject(sinkParams, coordinates);
      map.on('click', null);
      map.style('cursor', 'default');
      this.makeDecision(coordinates);
    });
  }

  public makeDecision(coordinates: Point): void {
    this.translate.get('wizard.confirm.sink', {id: this.data.shortId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    this.accButtons.decisionMade.first().subscribe(
      data => {
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
    const map = d3.select('#map');
    const sinkGroup = map.select('#sink' + this.data.shortId);
    map.style('cursor', 'default');
    sinkGroup.on('.drag', null);
    sinkGroup.style('cursor', 'default');
    sinkGroup.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
  }

  public goToNextStep(): void {
    this.nextStepIndex.emit(this.stepIndex + 1);
  }

  public prepareToSend(data: WizardData): FirstStepMessage {
    return {
      step: Step.FIRST, sinkShortId: this.data.shortId,
      floorId: this.floor.id
    };
  }

  public updateWizardData(data: WizardData): WizardData {
    return {
      sinkShortId: this.data.shortId,
      sinkPosition: this.coordinates[0],
      firstAnchorShortId: null,
      degree: null,
      firstAnchorPosition: null,
      secondAnchorPosition: null,
      secondAnchorShortId: null
    };
  }

  public clean(): void {
    this.coordinates = [];
    if (!!this.data) {
      const map = d3.select('#map');
      map.select('#sink' + this.data.shortId).remove();
      map.style('cursor', 'default');
      this.accButtons.publishVisibility(false);
      this.data = null;
    }
  }

  public closeWizard(clean: boolean): void {
    this.clearView.emit(clean);
  }
}
