import * as d3 from 'd3';
import * as Collections from 'typescript-collections';
import {Point} from '../../../../map.type';
import {FirstStepMessage, ScaleCalculations, Step, WizardData, WizardStep} from '../wizard.type';
import {SelectItem} from 'primeng/primeng';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {Sink} from '../../../../../device/device.type';
import {DrawConfiguration} from 'app/map-viewer/publication.type';

export class FirstStep implements WizardStep {
  private selectedItemId: number;
  private coordinates: Point;

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

  getDrawConfiguration(selectedItemID: number): DrawConfiguration {
    return {
      id: `` + selectedItemID, clazz: 'wizard sink anchor', name: 'sink' + selectedItemID,
      color: 'blue', display: 'true'
    };
  }

  beforePlaceOnMap(): void {
  }

  afterPlaceOnMap(): void {
    const objectOnMap: d3.selection = d3.select('#map').select(`[id='${this.selectedItemId}']`);
    this.coordinates = {x: +objectOnMap.attr('x'), y: +objectOnMap.attr('y')};
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

  updateWizardData(wizardData: WizardData, id: number, scaleCalculations: ScaleCalculations): void {
    wizardData.sinkShortId = id;
    wizardData.sinkPositionInPixels = this.coordinates;
    wizardData.sinkPosition = Geometry.calculatePointPositionInCentimeters(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, this.coordinates);
  }

  clean(): void {
    const map = d3.select('#map');
    map.select(`[id='${this.selectedItemId}']`).remove();
  }
}
