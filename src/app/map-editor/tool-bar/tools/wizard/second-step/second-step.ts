import * as d3 from 'd3';
import {Point} from '../../../../map.type';
import {SelectItem} from 'primeng/primeng';
import {AnchorDistance, SecondStepMessage, Step, WizardData, WizardStep} from '../wizard.type';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {ScaleCalculations} from '../../scale/scale.type';
import {CommonDeviceConfiguration} from '../../../../../shared/utils/drawing/common/device.common';

export class SecondStep implements WizardStep {
  private selectedItemId: number;
  private distances: AnchorDistance[] = [];
  private coordinates: Point;

  private static isDistanceType(message: any): boolean {
    return (<AnchorDistance>message.distance) !== undefined;
  }

  constructor() {
  }

  load (items: SelectItem[], message: any, scaleCalculations: ScaleCalculations): SelectItem[] {
    if (SecondStep.isDistanceType(message)) {
      const anchorDistance: AnchorDistance = (<AnchorDistance>message);
      const item: SelectItem = {
        label: 'id: ' + anchorDistance.anchorId,
        value: anchorDistance.anchorId
      };
      if (!items.find((i: SelectItem): boolean => {
          return i.value === item.value;
        })) {
        anchorDistance.distance = Geometry.calculateDistanceInPixels(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, anchorDistance.distance);
        this.distances.push(anchorDistance);
        items.push(item);
      }
      return [...items];
    } else {
      return items;
    }
  }

  getDrawConfiguration (selectedItemID: number): CommonDeviceConfiguration {
    return {
      id: `` + selectedItemID, clazz: 'wizard anchor', name: 'anchor' + selectedItemID,
      color: 'green', display: 'true', heightInMeters: 2 // TODO: change it to value taken from device (not now, since we don't know the future for wizard)
    };
  }

  beforePlaceOnMap (selectedItem: number): void {
    const map = d3.select('#map');
    const sinkX = map.select('.wizard.sink').attr('x');
    const sinkY = map.select('.wizard.sink').attr('y');
    map.append('circle')
      .attr('id', 'sinkDistance')
      .attr('cx', parseInt(sinkX, 10))
      .attr('cy', parseInt(sinkY, 10))
      .attr('r', this.distances.find((distance: AnchorDistance): boolean => {
        return distance.anchorId === selectedItem;
      }).distance)
      .style('stroke', 'green')
      .style('stroke-dasharray', '10,3')
      .style('stroke-opacity', '0.9')
      .style('fill', 'none');
  }

  afterPlaceOnMap (): void {
    const objectOnMap: d3.selection = d3.select('#map').select(`[id='${this.selectedItemId}']`);
    this.coordinates = {x: +objectOnMap.attr('x'), y: +objectOnMap.attr('y')};
    d3.select('#map').select('#sinkDistance').remove();
  }

  getBeforePlaceOnMapHint (): string {
    return 'wizard.click.place.anchor';
  }

  getAfterPlaceOnMapHint (): string {
    return 'wizard.confirm.anchor';
  }

  getPlaceholder (): string {
    return 'wizard.placeholder.selectAnchor';
  }

  getTitle(): string {
    return 'wizard.title.step2';
  }

  setSelectedItemId(id: number): void {
    this.selectedItemId = id;
  }

  prepareToSend(data: WizardData): SecondStepMessage {
    const invertedSinkPosition: Point = {...data.sinkPosition};
    invertedSinkPosition.y = -invertedSinkPosition.y;
    return {
      sinkPosition: invertedSinkPosition,
      anchorShortId: data.firstAnchorShortId,
      degree: data.degree,
      step: Step.SECOND
    };
  }

  updateWizardData(data: WizardData, id: number, scaleCalculations: ScaleCalculations): void {
    data.firstAnchorShortId = id;
    data.firstAnchorPosition = Geometry.calculatePointPositionInCentimeters(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, this.coordinates);
    data.degree = Geometry.calculateDegree(data.sinkPositionInPixels, this.coordinates);
  }

  clean(): void {
    const map = d3.select('#map');
    map.select('#sinkDistance').remove();
    map.select(`[id='${this.selectedItemId}']`).remove();
  }
}
