import {Anchor} from './anchor.type';
import {Point} from '../map/map.type';

export interface AnchorDist extends Anchor {
  distance: number;
  coords: Point;
  altCoords: Point;
}
export interface AnchorDistance {
  anchorId: number;
  distance: number;
}
