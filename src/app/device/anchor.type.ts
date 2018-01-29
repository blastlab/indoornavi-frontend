import {Device} from './device.type';
import {Point} from '../map-editor/map.type';

export interface Anchor extends Device {
}

export interface AnchorDistance {
  anchorId: number;
  distance: number;
}

export interface AnchorSuggestedPositions {
  anchorId: number;
  points: Point[];
}
