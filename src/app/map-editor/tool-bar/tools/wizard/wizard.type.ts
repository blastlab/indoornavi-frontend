import {Point} from '../../../map.type';
import {SelectItem} from 'primeng/primeng';
import {ScaleCalculations} from '../scale/scale.type';
import {CommonDeviceConfiguration} from '../../../../shared/utils/drawing/common/device.common';

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
  sinkPositionInPixels: Point;
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
  load(items: SelectItem[], message: string, scaleCalculations?: ScaleCalculations): SelectItem[];
  getDrawConfiguration(selectedItem: number): CommonDeviceConfiguration;
  beforePlaceOnMap(selectedItem?: number): void;
  afterPlaceOnMap(): void;
  getBeforePlaceOnMapHint(): string;
  getAfterPlaceOnMapHint(): string;
  getPlaceholder(): string;
  getTitle(): string;
  setSelectedItemId(id: number);
  prepareToSend(wizardData: WizardData): SocketMessage;
  updateWizardData(wizardData: WizardData, id: number, scaleCalculations: ScaleCalculations): void;
  clean(): void;
}

export interface AnchorDistance {
  anchorId: number;
  distance: number;
}

export interface AnchorSuggestedPositions {
  anchorId: number;
  points: Point[];
}
