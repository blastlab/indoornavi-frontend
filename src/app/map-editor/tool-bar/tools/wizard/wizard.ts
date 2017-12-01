import {Component, Input, NgZone, OnInit} from '@angular/core';
import {ToolName} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../../../../config';
import {SocketService} from '../../../../shared/services/socket/socket.service';
import {FirstStep} from './first-step/first-step';
import {SecondStep} from './second-step/second-step';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {SocketMessage, WizardData, WizardStep} from './wizard.type';
import {Floor} from '../../../../floor/floor.type';
import {SelectItem} from 'primeng/primeng';
import {ThirdStep} from './third-step/third-step';
import {Point, Transform} from '../../../map.type';
import * as d3 from 'd3';
import {ToolbarService} from '../../toolbar.service';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {DrawingService} from '../../../../shared/services/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../shared/components/accept-buttons/accept-buttons.service';
import {MapService} from '../../../map.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html'
})
export class WizardComponent implements Tool, OnInit {
  @Input() floor: Floor;
  displayDialog: boolean = false;
  options: SelectItem[] = [];
  selected: number;
  placeholder: string;
  title: string;
  isLoading: boolean = true;
  displayError: boolean;
  active: boolean = false;

  private steps: WizardStep[];
  private activeStep: WizardStep;
  private currentIndex: number = 0;
  private coordinates: Point;
  private socketSubscription: Subscription;
  private wizardData: WizardData = new WizardData();
  private hintMessage: string;
  private map2DTranslation: Transform = {k: 1, x: 0, y: 0};

  constructor(public translate: TranslateService,
              private socketService: SocketService,
              private drawService: DrawingService,
              private ngZone: NgZone,
              private acceptButtons: AcceptButtonsService,
              private toolbarService: ToolbarService,
              private hintBarService: HintBarService,
              private actionBarService: ActionBarService,
              private mapService: MapService) {
  }

  ngOnInit() {
    this.setTranslations();
    this.steps = [new FirstStep(this.floor.id), new SecondStep(), new ThirdStep()];
    this.checkIsLoading();
    this.mapService.mapIsTransformed().subscribe((transformation: Transform) => {
      this.map2DTranslation.k = transformation.k;
      this.map2DTranslation.x = transformation.x;
      this.map2DTranslation.y = transformation.y;
    });
  }

  nextStep() {
    if (!this.activeStep) { // init wizard
      this.toolbarService.emitToolChanged(this);
      this.activeStep = this.steps[this.currentIndex];
      this.openSocket();
    } else {
      this.activeStep.afterPlaceOnMap();
      this.activeStep.updateWizardData(this.wizardData, this.selected, this.coordinates);
      const message: SocketMessage = this.activeStep.prepareToSend(this.wizardData);
      this.socketService.send(message);
      this.currentIndex += 1;
      if (this.currentIndex === 3) { // No more steps, wizard configuration is done
        this.saveConfiguration();
        this.activeStep = null;
        this.currentIndex = 0;
        this.toolbarService.emitToolChanged(null);
        return;
      }
      this.activeStep = this.steps[this.currentIndex];
    }
    this.stepChanged();
    this.displayDialog = true;
  }

  previousStep() {
    if (this.currentIndex === 0) { // current step if first so we close wizard
      this.activeStep = null;
      this.displayDialog = false;
      this.selected = undefined;
      this.displayError = false;
      this.toolbarService.emitToolChanged(null);
      return;
    } else if (this.currentIndex === 1) { // We need to reset socket connection, so we will get Sinks again
      this.closeSocket();
      this.openSocket();
    }

    this.currentIndex -= 1;
    this.activeStep = this.steps[this.currentIndex];
    this.activeStep.clean();
    this.activeStep.updateWizardData(this.wizardData, this.selected, this.coordinates);
    const message: SocketMessage = this.activeStep.prepareToSend(this.wizardData);
    this.socketService.send(message);
    this.stepChanged();
  }

  placeOnMap(): void {
    if (!this.selected) { // Do not allow to go to the next step if there is no selected item
      this.displayError = true;
      return;
    }
    this.translate.get(this.activeStep.getBeforePlaceOnMapHint()).subscribe((value: string) => {
      this.hintBarService.emitHintMessage(value);
    });
    this.displayError = false;
    this.activeStep.beforePlaceOnMap(this.selected);
    this.displayDialog = false;
    const map: d3.selector = d3.select('#map');
    map.style('cursor', 'crosshair');
    map.on('click', () => {
      this.coordinates = {x: (d3.event.offsetX - this.map2DTranslation.x) / this.map2DTranslation.k, y: (d3.event.offsetY - this.map2DTranslation.y) / this.map2DTranslation.k};
      this.drawService.drawObject(this.activeStep.getDrawingObjectParams(this.selected), this.coordinates);
      map.on('click', null);
      map.style('cursor', 'default');
      this.showAcceptButtons();
    });
  }

  setActive(): void {
    this.active = true;
  }

  setInactive(): void {
    this.active = false;
    this.closeSocket();
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  getToolName(): ToolName {
    return ToolName.WIZARD;
  }

  private stepChanged() {
    this.placeholder = this.activeStep.getPlaceholder();
    this.title = this.activeStep.getTitle();
    this.selected = undefined;
    this.options = [];
    this.isLoading = true;
  }

  private showAcceptButtons(): void {
    this.translate.get(this.activeStep.getAfterPlaceOnMapHint()).subscribe((value: string) => {
      this.hintBarService.emitHintMessage(value);
    });
    this.acceptButtons.publishVisibility(true);
    this.acceptButtons.publishCoordinates({x: this.coordinates.x, y: this.coordinates.y + 30});
    this.acceptButtons.decisionMade.first().subscribe(
      data => {
        this.activeStep.setSelectedItemId(this.selected);
        if (data) {
          this.removeGroupDrag();
          this.nextStep();
        } else {
          this.activeStep.clean();
          this.displayDialog = true;
        }
      });
  }

  private openSocket() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');
      this.socketSubscription = stream.subscribe((message: any) => {
        this.ngZone.run(() => {
          this.options = this.activeStep.load(this.options, message);
        });
      });
    });
  }

  private closeSocket() {
    if (!!this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  private removeGroupDrag(): void {
    const map = d3.select('#map');
    const selections: d3.selection[] = [
      map.select('#anchor' + this.selected),
      map.select('#sink' + this.selected)
    ];
    selections.forEach((selection: d3.selection) => {
      if (!selection.empty()) {
        selection.on('.drag', null);
        selection.style('cursor', 'default');
        selection.select('.pointer').attr('fill', 'rgba(0,0,0,0.7)');
      }
    });
    map.style('cursor', 'default');
  }

  private checkIsLoading() {
    setInterval(() => {
      if (this.options.length) {
        this.isLoading = false;
      }
    }, 300);
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((text: string) => {
      this.hintMessage = text;
    });
  }

  saveConfiguration(): void {
      const anchors: Anchor[] = [];
      anchors.push(<Anchor>{
        shortId: this.wizardData.firstAnchorShortId,
        x: this.wizardData.firstAnchorPosition.x,
        y: this.wizardData.firstAnchorPosition.y
      });
      anchors.push(<Anchor>{
        shortId: this.wizardData.secondAnchorShortId,
        x: this.wizardData.secondAnchorPosition.x,
        y: this.wizardData.secondAnchorPosition.y
      });
      this.actionBarService.setSink(<Sink>{
        shortId: this.wizardData.sinkShortId,
        x: this.wizardData.sinkPosition.x,
        y: this.wizardData.sinkPosition.y,
        anchors: anchors
      });
  }
}
