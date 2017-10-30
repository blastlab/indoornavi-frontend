import {Point} from '../map-editor/map.type';

export interface Area {
  id: number;
  points: Point[];
  buffer: Point[];
}
