import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {Point} from '../../../../map.type';
import {FirstStepMessage, ObjectParams, ScaleCalculations, Step, WizardData, WizardStep} from '../wizard.type';
import {Sink} from '../../../../../device/sink.type';
import {SelectItem} from 'primeng/primeng';
import {NaviIcons} from '../../../../../shared/services/drawing/icon.service';
import {Geometry} from '../../../../../shared/utils/helper/geometry';

export class FirstStep implements WizardStep {
  private selectedItemId: number;

  constructor(private floorId: number) {
  }

  load(items: SelectItem[], message: any): SelectItem[] {
    Collections.arrays.forEach(message, (sink: Sink) => {
      const item: SelectItem = {
        label: 'id: ' + sink.shortId,
        value: sink.shortId
      };
      if (!items.find((i: SelectItem) => {
          return i.value === item.value;
        })) {
        items.push(item);
      }
    });
    return [...items];
  }

  getDrawingObjectParams(selectedItem: number): ObjectParams {
    return {
      id: 'sink' + selectedItem, iconName: NaviIcons.ANCHOR,
      groupClass: 'wizardSink', markerClass: 'sinkMarker', fill: 'blue'
    };
  }

  beforePlaceOnMap(): void {
  }

  afterPlaceOnMap(): void {
  }

  getBeforePlaceOnMapHint(): string {
    return 'wizard.click.place.sink';
  }

  getAfterPlaceOnMapHint(): string {
    return 'wizard.confirm.sink';
  }

  getPlaceholder(): string {
    return 'wizard.placeholder.selectSink';
  }

  getTitle(): string {
    return 'wizard.title.step1';
  }

  setSelectedItemId(id: number): void {
    this.selectedItemId = id;
  }

  prepareToSend(data: WizardData): FirstStepMessage {
    return {
      step: Step.FIRST, sinkShortId: data.sinkShortId,
      floorId: this.floorId
    };
  }

  updateWizardData(wizardData: WizardData, id: number, coordinates: Point, scaleCalculations?: ScaleCalculations): void {
    wizardData.sinkShortId = id;
    wizardData.sinkPosition = Geometry.calculatePointPositionInCentimeters(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, coordinates);
  }

  clean(): void {
    const map = d3.select('#map');
    map.select('#sink' + this.selectedItemId).remove();
  }
}
