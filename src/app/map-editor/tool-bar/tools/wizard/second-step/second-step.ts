import * as d3 from 'd3';
import {AnchorDistance} from '../../../../../device/anchor.type';
import {Point} from '../../../../map.type';
import {SelectItem} from 'primeng/primeng';
import {WizardData, WizardStep, SecondStepMessage, Step, ObjectParams} from '../wizard.type';
import {NaviIcons} from 'app/shared/services/drawing/icon.service';
import {Geometry} from '../../../../../shared/utils/helper/geometry';

export class SecondStep implements WizardStep {
  private selectedItemId: number;
  private distances: AnchorDistance[] = [];

  private static isDistanceType(message: any): boolean {
    return (<AnchorDistance>message.distance) !== undefined;
  }

  constructor() {
  }

  load (items: SelectItem[], message: any): SelectItem[] {
    if (SecondStep.isDistanceType(message)) {
      const anchorDistance: AnchorDistance = (<AnchorDistance>message);
      const item: SelectItem = {
        label: 'id: ' + anchorDistance.anchorId,
        value: anchorDistance.anchorId
      };
      if (!items.find((i: SelectItem) => {
          return i.value === item.value;
        })) {
        this.distances.push(anchorDistance);
        items.push(item);
      }
      return [...items];
    } else {
      return items;
    }
  }

  getDrawingObjectParams (selectedItem: number): ObjectParams {
    return {
      id: 'anchor' + selectedItem, iconName: NaviIcons.ANCHOR,
      groupClass: 'wizardAnchor', markerClass: 'anchorMarker', fill: 'green'
    };
  }

  beforePlaceOnMap (selectedItem: number): void {
    const map = d3.select('#map');
    const boxMargin = 20 ;
    const sinkX = map.select('.wizardSink').attr('x');
    const sinkY = map.select('.wizardSink').attr('y');
    map.append('circle')
      .attr('id', 'sinkDistance')
      .attr('cx', parseInt(sinkX, 10) + boxMargin)
      .attr('cy', parseInt(sinkY, 10) + boxMargin)
      .attr('r', this.distances.find((distance: AnchorDistance) => {
        return distance.anchorId === selectedItem;
      }).distance)
      .style('stroke', 'green')
      .style('stroke-dasharray', '10,3')
      .style('stroke-opacity', '0.9')
      .style('fill', 'none');
  }

  afterPlaceOnMap (): void {
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

  updateWizardData(data: WizardData, id: number, coordinates: Point): void {
    data.firstAnchorShortId = id;
    data.firstAnchorPosition = coordinates;
    data.degree = Geometry.calculateDegree(data.sinkPosition, coordinates);
  }

  clean(): void {
    const map = d3.select('#map');
    map.select('#sinkDistance').remove();
    map.select('#anchor' + this.selectedItemId).remove();
  }
}
