import {Point} from '../map/map.type';

export interface Area {
  id: number;
  points: Point[];
  buffer: Point[];
}
