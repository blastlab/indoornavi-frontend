import {Component, EventEmitter, NgZone, Output, ViewChild, TemplateRef} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../../../../utils/socket/socket.service';
import {MdDialogRef, MdDialog} from '@angular/material';
import {Anchor} from '../../../../anchor/anchor.type';
import {AnchorDist} from '../../../../anchor/achorDist.type';
import {Config} from '../../../../../config';
import {ToastService} from '../../../../utils/toast/toast.service';
import {DialogComponent} from '../../../../utils/dialog/dialog.component';
import * as d3 from 'd3';
import {Point} from '../../../map.type';
import {AcceptButtonsComponent} from 'app/utils/accept-buttons/accept-buttons';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html',
  styleUrls: ['../tool.css']
})
export class WizardComponent implements Tool {
  @Output() clickedWizard: EventEmitter<Tool> = new EventEmitter<Tool>();
  public toolEnum: ToolsEnum = ToolsEnum.WIZARD; // used in hint-bar component as a toolName
  public hintMessage: string;
  public active: boolean = false;
  public wizardMsg: string;
  private socketSubscription: Subscription;
  public isLoading: boolean;
  private canceledWizard: boolean;
  public wizardStep: number;
  public selected: {sink: Anchor, anchor1: AnchorDist, anchor2: AnchorDist} = {sink: null, anchor1: null, anchor2: null};
  public sinks = [];
  public anchors = [];

  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  @ViewChild(AcceptButtonsComponent) accButtons: AcceptButtonsComponent;

  dialogRef: MdDialogRef<DialogComponent>;

  constructor(private socketService: SocketService,
              public dialog: MdDialog,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone) {
  }

  private initSocket() {
    this.wizardStep = 0;
    this.wizardNextStep(true);

    /*this.ngZone.runOutsideAngular(() => {
     const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');

     this.socketSubscription = stream.subscribe((wizardStep: string) => {
     this.ngZone.run(() => {
     // like in 'timeout above' functionality
     });
     });

     });*/
  }

  private destroySocket() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  public toolClicked(): void {
    this.clickedWizard.emit(this);
  }

  public setActive(): void {
    this.setTranslations();
    this.active = true;
    this.initSocket();
  }

  public setInactive(): void {
    this.active = false;
    this.destroySocket();
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
    this.translate.get('wizard.dialog.first.message').subscribe((value: string) => {
      this.wizardMsg = value;
    });
  }
  private wizardNextStep(decision: boolean) {
                                                                                  (decision) ? this.wizardStep++ : console.log('next step: ' + decision);
    if (this.wizardStep <= 4 ) {
      this.isLoading = (this.wizardStep < 3);
      this.openDialog(); // cancellation possible -> after timeout shows list and lets place a device
      this.canceledWizard = false;
      this.translate.get('wizard.dialog.before.step' + this.wizardStep).subscribe((value: string) => {
        this.wizardMsg = value;
      });
      setTimeout(() => {
        if (!this.canceledWizard) {
          if (this.wizardStep === 1) {
            this.sinks = JSON.parse(this.getSinksList());
          } else if (this.wizardStep === 2) {
            this.anchors = JSON.parse(this.getAnchorsList());
          }
          this.translate.get('wizard.dialog.step' + this.wizardStep).subscribe((value: string) => {
            this.wizardMsg = value;
          });
          this.isLoading = false;
        } else {
                                                                                                      console.log('Wizard was canceled');
        }
      }, (this.rdm(3000) + 2000));
    } else {
                                                                                                          console.log('this was last step! all DONE, ready steady... 4br4(4d4br4');
      this.toolClicked();
    }
    this.whichStep(); // like comment below
  }
  // for verification TODO delete this
  protected whichStep() {
                                                                                                          console.log('wizard step: ' + this.wizardStep);
  }

  private openDialog() {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {disableClose: true});

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  public wizardCanceled() {
    this.canceledWizard = true;
    this.isLoading = false;
    this.dialogRef.close();
    // here will be call to clear method TODO delete comments
    this.toolClicked();
  }

  public placeSink(selectedAnchor: Anchor) {
    this.dialogRef.close();
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    map.on('click', () => {
      map.append('g')
        .attr('id', ('sink' + selectedAnchor.shortId))
        .attr('class', 'wizardSink');
      const id = '#sink' + selectedAnchor.shortId;
      map.select(id)
        .append('circle')
        .attr('class', 'sinkMarker')
        .attr('cx', d3.event.offsetX)
        .attr('cy', d3.event.offsetY)
        .attr('r', 10)
        .style('fill', 'green')
      .style('opacity', 0.6);
      map.on('click', null);
      map.style('cursor', 'default');
      // here append AcceptButtons component and set dependency on wizardNextStep
      this.makeDecision();
    });
  }
  public placeAnchor(selectedAnchor: AnchorDist) {
    this.dialogRef.close();
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    if (!this.selected.anchor2) {
    const sink = map.select('#sink' + this.selected.sink.shortId);
    const sinkX = sink.select('.sinkMarker').attr('cx');
    const sinkY = sink.select('.sinkMarker').attr('cy');
    sink.append('circle')
      .attr('class', 'sinkDistance')
      .attr('cx', sinkX)
      .attr('cy', sinkY)
      .attr('r', selectedAnchor.distance)
      .style('stroke', 'green')
      .style('stroke-dasharray', '10,3')
      .style('stroke-opacity', '0.9')
      .style('fill-opacity', 0.07);
    } else {
      map.append('circle')
        .attr('class', 'suggestedPosition')
        .attr('cx', selectedAnchor.coords.x)
        .attr('cy', selectedAnchor.coords.y)
        .attr('r', 7)
        .style('fill', 'red')
        .style('fill-opacity', 0.8);
      map.append('circle')
        .attr('class', 'suggestedPosition')
        .attr('cx', selectedAnchor.altCoords.x)
        .attr('cy', selectedAnchor.altCoords.y)
        .attr('r', 8)
        .style('fill', 'red')
        .style('fill-opacity', 0.7);
    }
    map.on('click', () => {
      map.append('g')
        .attr('id', ('anchor' + selectedAnchor.shortId))
        .attr('class', 'wizardAnchor');
      const id = '#anchor' + selectedAnchor.shortId;
      map.select(id)
        .append('circle')
        .attr('cx', d3.event.offsetX)
        .attr('cy', d3.event.offsetY)
        .attr('r', 5)
        .style('stroke', 'blue')
        .style('opacity', 0.5);
      map.on('click', null);
      map.style('cursor', 'default');
      if (!this.selected.anchor2) {
        map.select('.sinkDistance').remove();
      } else {
        console.log(map.select('.suggestedPosition'));
        map.selectAll('.suggestedPosition').remove();
      }
      this.makeDecision();
    });
  }
  private makeDecision(): void {
    this.accButtons.show({x: 100, y: 200}); // change to input and outpu data
    this.wizardNextStep(true);
  }

// below are 'protected' methods used to generate response as websocket // TODO delete comments
  protected generateSink(): Anchor {
    const text = 'S' + this.makeName();
    const short = 1000 + this.rdm(10000);
    const long = 12345678 + this.rdm(89999999);
    const verify = (!!this.rdm(1));
    return {
      name: text,
      shortId: short,
      longId: long,
      verified: verify
    };
  }
  protected generateAnchor(): AnchorDist {
    const text = 'A' + this.makeName();
    const short = 1000 + this.rdm(10000);
    const long = 12345678 + this.rdm(89999999);
    const verify = (!!this.rdm(1));
    const dist = this.rdm(125) + 175;
    const pnt: Point = {x: this.rdm(500) + 100, y: this.rdm(500) + 100};
    const altPnt: Point = {x: this.rdm(500) + 100, y: this.rdm(500) + 100};
    return {
      name: text,
      shortId: short,
      longId: long,
      verified: verify,
      distance: dist,
      coords: pnt,
      altCoords: altPnt
    };
  }
  protected getAnchorsList(): string {
    const sinksQuota = this.rdm(6) + 4;
    for (let i = 0; i < sinksQuota; i++) {
      this.anchors.push(this.generateAnchor());
    }
    return JSON.stringify(this.anchors);
  }

  protected getSinksList(): string {
    const sinksQuota = (this.rdm(6) + 4);
    for (let i = 0; i < sinksQuota; i++) {
      this.sinks.push(this.generateSink());
    }
    return JSON.stringify(this.sinks);
  }

  protected rdm(max: number): number {
    return Math.floor(Math.random() * (max + 1));
  }

  protected makeName(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
