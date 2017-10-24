import {Point} from '../../../map.type';

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

export interface WizardData {
  sinkShortId: number;
  sinkPosition: Point;
  degree: number;
  firstAnchorShortId: number;
  firstAnchorPosition: Point;
  secondAnchorPosition: Point;
  secondAnchorShortId: number;
}

export enum Step {
  FIRST,
  SECOND,
  THIRD
}
