import {Component, EventEmitter, Output, TemplateRef, ViewChild} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {Anchor} from '../../../../../anchor/anchor.type';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {Point} from '../../../../map.type';
import {SocketMsg, WizardData} from '../wizard';
import {DrawingService, ObjectParams} from '../../../../../utils/drawing/drawing.service';
import {NaviIcons} from '../../../../../utils/drawing/icon.service';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';

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
  public socketData = new Collections.Set<Anchor>((sink: Anchor) => {
    return '' + sink.shortId;
  });
  public isLoading: boolean = true;
  public data: Anchor;
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

  public placeOnMap(data: Anchor): void {
    this.coords = [];
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    this.translate.get('wizard.click.place.sink', {id: this.data.shortId}).subscribe((text: string) => {
      this.hintBar.publishHint(text);
    });
    map.on('click', () => {
      const coordinates: Point = {x: d3.event.offsetX, y: d3.event.offsetY};
      this.coords.push(coordinates);
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

  public prepareToSend(data: WizardData): SocketMsg {
    return {
        sinkShortId: this.data.shortId,
        sinkPosition: null,
        anchorShortId: null,
        degree: null
    };
  }

  public updateWizardData(data: WizardData): WizardData {
    return {
      sinkShortId: this.data.shortId,
        sinkPosition: this.coords[0],
        anchorShortId: null,
        degree: null,
        firstAnchorPosition: null,
        secondAnchorPosition: null
    };
  }

  public clean(): void {
    this.coords = [];
    if (!!this.data) {
      const map = d3.select('#map');
      map.select('#sink' + this.data.shortId).remove();
      map.style('cursor', 'default');
      this.accButtons.publishVisibility(false);
      this.data = null;
    }
  }

  public closeWizard(clean): void {
    this.clearView.emit(clean);
  }
}
