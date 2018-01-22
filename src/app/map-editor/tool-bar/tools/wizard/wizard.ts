import {Component, Input, NgZone, OnInit, QueryList, ViewChildren} from '@angular/core';
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
import {ObjectParams, SocketMessage, WizardData, WizardStep} from './wizard.type';
import {Floor} from '../../../../floor/floor.type';
import {SelectItem} from 'primeng/primeng';
import {ThirdStep} from './third-step/third-step';
import {Point} from '../../../map.type';
import * as d3 from 'd3';
import {ToolbarService} from '../../toolbar.service';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {AcceptButtonsService} from '../../../../shared/components/accept-buttons/accept-buttons.service';
import {DrawBuilder} from '../../../../map-viewer/published.builder';
import {IconService, NaviIcons} from '../../../../shared/services/drawing/icon.service';
import {MapViewerService} from '../../../map.editor.service';
import {ZoomService} from '../../../../shared/services/zoom/zoom.service';
import {Device} from '../../../../device/device.type';
import {ScaleService} from '../../../../shared/services/scale/scale.service';
import {Scale} from '../scale/scale.type';
import {Geometry} from '../../../../shared/utils/helper/geometry';


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
  disabled: boolean = true;
  private scale: Scale;

  private steps: WizardStep[];
  private activeStep: WizardStep;
  private currentIndex: number = 0;
  private coordinates: Point;
  private socketSubscription: Subscription;
  private wizardData: WizardData = new WizardData();
  private hintMessage: string;

  constructor(public translate: TranslateService,
              private ngZone: NgZone,
              private socketService: SocketService,
              private acceptButtons: AcceptButtonsService,
              private toolbarService: ToolbarService,
              private hintBarService: HintBarService,
              private actionBarService: ActionBarService,
              private iconService: IconService,
              private zoomService: ZoomService,
              private scaleService: ScaleService
              ) {
  }

  ngOnInit() {
    this.setTranslations();
    this.steps = [new FirstStep(this.floor.id), new SecondStep(), new ThirdStep()];
    this.checkIsLoading();
    this.scaleService.scaleChanged.subscribe((scale: Scale) => {
      this.scale = new Scale(scale.start, scale.stop, scale.realDistance, scale.measure);
    });
  }

  nextStep(): void {
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
    this.hintBarService.sendHintMessage(this.activeStep.getBeforePlaceOnMapHint());
    this.displayError = false;
    this.activeStep.beforePlaceOnMap(this.selected);
    this.displayDialog = false;
    const map: d3.selector = d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`);
    map.style('cursor', 'crosshair');
    map.on('click', () => {
      this.coordinates = this.zoomService.calculateTransition({x: d3.event.offsetX, y: d3.event.offsetY});
      const device: ObjectParams = this.activeStep.getDrawingObjectParams(this.selected);
      const drawBuilder = new DrawBuilder(map, {id: device.id, clazz: device.groupClass}, this.zoomService);
      drawBuilder
        .createGroup()
        .addIcon({x: -12, y: -12}, this.iconService.getIcon(NaviIcons.POINTER))
        .addIcon({x: 0, y: 0}, this.iconService.getIcon(device.iconName))
        .addText({x: 0, y: 36}, device.id)
        .place({x: this.coordinates.x, y: this.coordinates.y})
        .setDraggable();
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
    const scaleLengthInPixels = Geometry.getDistanceBetweenTwoPoints(this.scale.startPoint, this.scale.stopPoint);
    const scaleInCentimeters = this.scale.getRealDistanceInCentimeters();
    const calculatePoint = (distance: number): number => Geometry.calculateDistanceInCentimeters(scaleLengthInPixels, scaleInCentimeters, distance);
    anchors.push(<Anchor>{
      shortId: this.wizardData.firstAnchorShortId,
      x: calculatePoint(this.wizardData.firstAnchorPosition.x),
      y: calculatePoint(this.wizardData.firstAnchorPosition.y)
    });
    anchors.push(<Anchor>{
      shortId: this.wizardData.secondAnchorShortId,
      x: calculatePoint(this.wizardData.secondAnchorPosition.x),
      y: calculatePoint(this.wizardData.secondAnchorPosition.y)
    });
    this.actionBarService.setSink(<Sink>{
      shortId: this.wizardData.sinkShortId,
      x: calculatePoint(this.wizardData.sinkPosition.x),
      y: calculatePoint(this.wizardData.sinkPosition.y),
      anchors: anchors
    });
  }

  private cleanBeforeClosingWizard(): void {
    if (!!this.activeStep) {
      this.activeStep.setSelectedItemId(this.selected);
      this.activeStep.clean();
    }
    this.steps.forEach((step: WizardStep) => {
      this.activeStep = step;
      this.activeStep.clean();
    });
    this.activeStep = null;
    this.displayDialog = false;
    this.selected = undefined;
    this.displayError = false;
  }

  private stepChanged() {
    this.placeholder = this.activeStep.getPlaceholder();
    this.title = this.activeStep.getTitle();
    this.selected = undefined;
    this.options = [];
    this.isLoading = true;
  }

  private showAcceptButtons(): void {
    this.hintBarService.sendHintMessage(this.activeStep.getAfterPlaceOnMapHint());
    this.acceptButtons.publishVisibility(true);
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

  private openSocket(): void {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');
      this.socketSubscription = stream.subscribe((message: any) => {
        const scaleLengthInPixels = Geometry.getDistanceBetweenTwoPoints(this.scale.startPoint, this.scale.stopPoint);
        const scaleInCentimeters = this.scale.getRealDistanceInCentimeters();
        this.ngZone.run(() => {
          if (Object.keys(message).indexOf('distance') > 0) {
            message.distance = Geometry.calculateDistanceInPixels(scaleLengthInPixels, scaleInCentimeters, message.distance);
          } else if (Array.isArray(message)) {
            message.forEach((item) => {
              if (Object.keys(item).indexOf('anchors') > 0) {
                item.anchors.forEach((anchor: Device) => {
                  let point: Point = {x: anchor.x, y: anchor.y};
                  point = Geometry.calculatePointPositionInPixels(scaleLengthInPixels, scaleInCentimeters, point);
                  anchor.x = point.x;
                  anchor.y = point.y;
                });
              }
            });
          }
          this.options = this.activeStep.load(this.options, message);
        });
      });
    });
  }

  private closeSocket(): void {
    if (!!this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  private removeGroupDrag(): void {
    const map = d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`);
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
}
