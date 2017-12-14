import {Point} from '../../../map.type';
import {SelectItem} from 'primeng/primeng';

export interface SocketMessage {
  step: Step;
}

export interface FirstStepMessage extends SocketMessage {
  sinkShortId: number;
  floorId: number;
}

export interface SecondStepMessage extends SocketMessage {
  sinkPosition: Point;
  anchorShortId: number;
  degree: number;
}

export class WizardData {
  sinkShortId: number;
  sinkPosition: Point;
  degree: number;
  firstAnchorShortId: number;
  firstAnchorPosition: Point;
  secondAnchorPosition: Point;
  secondAnchorShortId: number;

  constructor() {
  }
}

export enum Step {
  FIRST,
  SECOND,
  THIRD
}

export interface WizardStep {
  load(items: SelectItem[], message: string): SelectItem[];
  getDrawingObjectParams(selectedItem: number): ObjectParams;
  beforePlaceOnMap(selectedItem?: number): void;
  afterPlaceOnMap(): void;
  getBeforePlaceOnMapHint(): string;
  getAfterPlaceOnMapHint(): string;
  getPlaceholder(): string;
  getTitle(): string;
  setSelectedItemId(id: number);
  prepareToSend(wizardData: WizardData): SocketMessage;
  updateWizardData(wizardData: WizardData, id: number, coordinates: Point): void;
  clean(): void;
}

export interface ObjectParams {
  id: string;
  iconName: string;
  groupClass: string;
  markerClass: string;
  fill: string;
}
