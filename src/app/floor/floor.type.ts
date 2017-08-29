import {Scale} from '../map/toolbar/tools/scale/scale.type';

export interface Floor {
  id?: number;
  level: number;
  name: string;
  buildingId: number;
  imageId?: number;
  scale?: Scale;
}
