import {Device} from '../device/device.type';
import {Point} from '../map/map.type';

export interface Anchor extends Device {
}

export interface AnchorDistance {
  anchorId: number;
  distance: number;
}

export interface AnchorSuggestedPositions {
  anchorId: number;
  points: Array<Point>;
}
