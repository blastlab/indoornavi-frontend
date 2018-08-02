import * as d3 from 'd3';
import {Point} from '../../../../map.type';
import {AnchorSuggestedPositions, SocketMessage, Step, WizardData, WizardStep} from '../wizard.type';
import {SelectItem} from 'primeng/primeng';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {ScaleCalculations} from '../../scale/scale.type';

export class ThirdStep implements WizardStep {
  private selectedItemId: number;
  private suggestedPositions: AnchorSuggestedPositions[] = [];
  private coordinates: Point;

  private static isPositionsType(message: any): boolean {
    return (<AnchorSuggestedPositions>message.points) !== undefined;
  }

  constructor() {
  }

  load(items: SelectItem[], message: any, scaleCalculations: ScaleCalculations): SelectItem[] {
    if (ThirdStep.isPositionsType(message)) {
      const anchorSuggestedPositions: AnchorSuggestedPositions = (<AnchorSuggestedPositions>message);
      const item: SelectItem = {
        label: 'id: ' + anchorSuggestedPositions.anchorId,
        value: anchorSuggestedPositions.anchorId
      };
      if (!items.find((i: SelectItem): boolean => {
          return i.value === item.value;
        })) {
        this.suggestedPositions.push({
          anchorId: anchorSuggestedPositions.anchorId,
          points: [
            Geometry.calculatePointPositionInPixels(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, anchorSuggestedPositions.points[0]),
            Geometry.calculatePointPositionInPixels(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, anchorSuggestedPositions.points[1])
          ]
        });
        items.push(item);
      }
      return [...items];
    } else {
      return items;
    }
  }

  getDrawConfiguration(selectedItemID: number): any {
    return {
      id: `` + selectedItemID, clazz: 'wizard anchor', name: 'anchor' + selectedItemID,
      color: 'green', display: 'true', heightInMeters: 2 // TODO: change it to value taken from device (not now, since we don't know the future for wizard)
    };
  }

  setSelectedItemId(id: number): void {
    this.selectedItemId = id;
  }

  beforePlaceOnMap(selectedItem: number): void {
    const map = d3.select('#map');
    this.suggestedPositions.find((suggestedPosition: AnchorSuggestedPositions): boolean => {
      return suggestedPosition.anchorId === selectedItem
    }).points.forEach((point: Point) => {
      map.append('circle')
        .attr('class', 'suggested-position')
        .attr('cx', point.x)
        .attr('cy', -point.y)
        .attr('r', 5)
        .style('stroke', 'yellow');
    });
  }

  afterPlaceOnMap(): void {
    const objectOnMap: d3.selection = d3.select('#map').select(`[id='${this.selectedItemId}']`);
    this.coordinates = {x: +objectOnMap.attr('x'), y: +objectOnMap.attr('y')};
    d3.select('#map').selectAll('.suggested-position').remove();
  }

  getBeforePlaceOnMapHint(): string {
    return 'wizard.click.place.anchor';
  }

  getAfterPlaceOnMapHint(): string {
    return 'wizard.confirm.anchor';
  }

  getPlaceholder(): string {
    return 'wizard.placeholder.selectAnchor';
  }

  getTitle(): string {
    return 'wizard.title.step3';
  }

  prepareToSend(data: WizardData): SocketMessage {
    return {
      step: Step.THIRD
    };
  }

  updateWizardData(data: WizardData, id: number, scaleCalculations: ScaleCalculations): void {
    data.secondAnchorShortId = id;
    data.secondAnchorPosition = Geometry.calculatePointPositionInCentimeters(scaleCalculations.scaleLengthInPixels, scaleCalculations.scaleInCentimeters, this.coordinates);
  }

  clean(): void {
    const map = d3.select('#map');
    map.selectAll('.suggested-position').remove();
    map.select(`[id='${this.selectedItemId}']`).remove();
  }

}
