import * as d3 from 'd3';
import {AnchorSuggestedPositions} from '../../../../../device/anchor.type';
import {Point} from '../../../../map.type';
import {SocketMessage, Step, WizardData, WizardStep} from '../wizard.type';
import {SelectItem} from 'primeng/primeng';
import {NaviIcons} from '../../../../../shared/services/drawing/icon.service';

export class ThirdStep implements WizardStep {
  private selectedItemId: number;
  private suggestedPositions: AnchorSuggestedPositions[] = [];

  private static isPositionsType(message: any): boolean {
    return (<AnchorSuggestedPositions>message.points) !== undefined;
  }

  constructor() {
  }

  load(items: SelectItem[], message: any): SelectItem[] {
    if (ThirdStep.isPositionsType(message)) {
      const anchorSuggestedPositions: AnchorSuggestedPositions = (<AnchorSuggestedPositions>message);
      const item: SelectItem = {
        label: 'id: ' + anchorSuggestedPositions.anchorId,
        value: anchorSuggestedPositions.anchorId
      };
      if (!items.find((i: SelectItem) => {
          return i.value === item.value;
        })) {
        this.suggestedPositions.push(anchorSuggestedPositions);
        items.push(item);
      }
      return [...items];
    } else {
      return items;
    }
  }

  getDrawingObjectParams(selectedItem: number) {
    return {
      id: 'anchor' + selectedItem, iconName: NaviIcons.ANCHOR,
      groupClass: 'wizardAnchor', markerClass: 'anchorMarker', fill: 'green'
    };
  }

  setSelectedItemId(id: number) {
    this.selectedItemId = id;
  }

  beforePlaceOnMap(selectedItem: number): void {
    const map = d3.select('#map');
    this.suggestedPositions.find((suggestedPosition: AnchorSuggestedPositions) => {
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

  updateWizardData(data: WizardData, id: number, coordinates: Point) {
    data.secondAnchorShortId = id;
    data.secondAnchorPosition = coordinates;
  }

  clean(): void {
    const map = d3.select('#map');
    map.selectAll('.suggested-position').remove();
    map.select('#anchor' + this.selectedItemId).remove();
  }

}
