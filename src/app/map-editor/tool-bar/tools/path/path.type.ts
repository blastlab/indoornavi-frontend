import {Point} from '../../../map.type';

export interface IntersectionIdentifier {
  index: number;
  point: Point;
}

export interface PathContextCallback {
  removeAll: () => void;
}

export interface PathContextMenuLabels {
  removeAll: string;
}
