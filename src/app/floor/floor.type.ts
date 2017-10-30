import {Scale} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Building} from '../building/building.type';

export interface Floor {
  id?: number;
  level: number;
  name: string;
  displayName?: string;
  building: Building;
  imageId?: number;
  scale?: Scale;
}
