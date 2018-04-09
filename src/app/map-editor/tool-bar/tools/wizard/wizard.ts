import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ToolName} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../../../../config';
import {SocketService} from '../../../../shared/services/socket/socket.service';
import {FirstStep} from './first-step/first-step';
import {SecondStep} from './second-step/second-step';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {SocketMessage, WizardData, WizardStep} from './wizard.type';
import {Floor} from '../../../../floor/floor.type';
import {SelectItem} from 'primeng/primeng';
import {ThirdStep} from './third-step/third-step';
import {Point} from '../../../map.type';
import * as d3 from 'd3';
import {ToolbarService} from '../../toolbar.service';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {AcceptButtonsService} from '../../../../shared/components/accept-buttons/accept-buttons.service';
import {ZoomService} from '../../../../shared/services/zoom/zoom.service';
import {ScaleService} from '../../../../shared/services/scale/scale.service';
import {Scale, ScaleCalculations, ScaleDto} from '../scale/scale.type';
import {Geometry} from '../../../../shared/utils/helper/geometry';
import {Anchor, Sink} from '../../../../device/device.type';
import {DrawConfiguration} from '../../../../map-viewer/publication.type';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {DevicePlacerController} from '../devices/device-placer.controller';
import {IconService} from '../../../../shared/services/drawing/icon.service';
import {DrawBuilder} from '../../../../shared/utils/drawing/drawing.builder';
import {CommonDevice} from '../../../../shared/utils/drawing/common/device';
import {Expandable} from '../../../../shared/utils/drawing/drawables/expandable';


@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html'
})
export class WizardComponent extends CommonDevice implements Tool, OnInit, OnDestroy {
  @Input() floor: Floor;
  displayDialog: boolean = false;
  options: SelectItem[];
  selectedItemId: number;
  placeholder: string;
  title: string;
  isLoading: boolean = true;
  active: boolean = false;
  disabled: boolean = true;
  private scale: Scale;
  private steps: WizardStep[];
  private activeStep: WizardStep;
  private currentIndex: number = 0;
  private socketSubscription: Subscription;
  private map: d3.selection;
  private mapLoadedSubscription: Subscription;
  private drawnDevices: Expandable[] = [];
  private wizardData: WizardData = new WizardData();
  private hintMessage: string;
  private scaleChanged: Subscription;
  private scaleCalculations: ScaleCalculations;

  constructor(public translate: TranslateService,
              protected iconService: IconService,
              private ngZone: NgZone,
              private socketService: SocketService,
              private acceptButtons: AcceptButtonsService,
              private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private hintBarService: HintBarService,
              private actionBarService: ActionBarService,
              private zoomService: ZoomService,
              private placerController: DevicePlacerController,
              private scaleService: ScaleService) {
    super(iconService);
  }

  ngOnInit() {
    this.setTranslations();
    this.steps = [new FirstStep(this.floor.id), new SecondStep(), new ThirdStep()];
    this.getMapSelection();
    this.getScaleChanges();
  }

  ngOnDestroy(): void {
    this.mapLoadedSubscription.unsubscribe();
    this.mapLoadedSubscription = null;
    this.scaleChanged.unsubscribe();
  }

  private getMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded) => {
      this.map = mapLoaded.container;
    });
  }

  private getScaleChanges(): void {
    this.scaleChanged = this.scaleService.scaleChanged.subscribe((scale: ScaleDto): void => {
      this.scale = new Scale(scale);
      if (!!this.scale.start && !!this.scale.stop) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    })
  }

  nextStep(): void {
    if (!this.activeStep) { // init wizard
      this.toolbarService.emitToolChanged(this);
      this.activeStep = this.steps[this.currentIndex];
      this.openSocket();
    } else {
      this.activeStep.afterPlaceOnMap();
      this.activeStep.updateWizardData(this.wizardData, this.selectedItemId, this.scaleCalculations);
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

  previousStep(): void {
    if (this.currentIndex === 0) { // current step if first so we close wizard
      this.cleanBeforeClosingWizard();
      this.toolbarService.emitToolChanged(null);
      return;
    } else if (this.currentIndex === 1) { // We need to reset socket connection, so we will get Sinks again
      this.closeSocket();
      this.openSocket();
    }
    this.currentIndex -= 1;
    this.activeStep = this.steps[this.currentIndex];
    this.activeStep.clean();
    this.drawnDevices[this.currentIndex] = null;
    this.activeStep.updateWizardData(this.wizardData, this.selectedItemId, this.scaleCalculations);
    const message: SocketMessage = this.activeStep.prepareToSend(this.wizardData);
    this.socketService.send(message);
    this.stepChanged();
  }

  placeOnMap(): void {
    this.hintBarService.sendHintMessage(this.activeStep.getBeforePlaceOnMapHint());
    this.activeStep.beforePlaceOnMap(this.selectedItemId);
    this.displayDialog = false;
    this.map.style('cursor', 'crosshair');
    this.map.on('click', () => {
      const coordinates: Point = this.zoomService.calculateTransition({x: d3.event.offsetX, y: d3.event.offsetY});
      const deviceConfig: DrawConfiguration = this.activeStep.getDrawConfiguration(this.selectedItemId);
      const drawBuilder = new DrawBuilder(this.map, deviceConfig);
      const wrapper = this.drawEditorDevice(drawBuilder, deviceConfig, coordinates);
      const drawnDevice = WizardComponent.createConnectableDevice(wrapper);
      this.drawnDevices[this.currentIndex] = drawnDevice;
      drawnDevice.connectable.dragOn();
      drawnDevice.connectable.handleHovering();
      drawnDevice.selectable.handleHovering();
      this.map.on('click', null);
      this.map.style('cursor', 'default');
      this.showAcceptButtons();
    });
  }

  setActive(): void {
    this.active = true;
  }

  setInactive(): void {
    this.active = false;
    this.closeSocket();
    this.currentIndex = 0;
    this.cleanBeforeClosingWizard();
    this.acceptButtons.publishVisibility(false);
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  getToolName(): ToolName {
    return ToolName.WIZARD;
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
    this.placerController.emitWizardSaveConfiguration(this.drawnDevices);
  }

  private cleanBeforeClosingWizard(): void {
    if (!!this.activeStep) {
      this.activeStep.setSelectedItemId(this.selectedItemId);
      this.activeStep.clean();
    }
    this.steps.forEach((step: WizardStep) => {
      this.activeStep = step;
      this.activeStep.clean();
    });
    this.activeStep = null;
    this.displayDialog = false;
    this.selectedItemId = undefined;
  }

  private stepChanged() {
    this.placeholder = this.activeStep.getPlaceholder();
    this.title = this.activeStep.getTitle();
    this.selectedItemId = undefined;
    this.options = [];
    this.isLoading = true;
  }

  private showAcceptButtons(): void {
    this.hintBarService.sendHintMessage(this.activeStep.getAfterPlaceOnMapHint());
    this.acceptButtons.publishVisibility(true);
    this.acceptButtons.decisionMade.first().subscribe(
      data => {
        this.activeStep.setSelectedItemId(this.selectedItemId);
        if (data) {
          this.drawnDevices[this.currentIndex].connectable.dragOff();
          this.nextStep();
        } else {
          this.activeStep.clean();
          this.displayDialog = true;
        }
      });
  }

  private openSocket(): void {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');
      this.socketSubscription = stream.subscribe((message: any) => {
        this.ngZone.run(() => {
          this.options = this.activeStep.load(this.options, message, this.scaleCalculations);
          this.isLoading = !this.options.length;
        });
      });
    });
  }

  private closeSocket(): void {
    if (!!this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((text: string): void => {
      this.hintMessage = text;
    });
  }
}
