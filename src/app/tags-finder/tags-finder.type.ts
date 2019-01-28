import {Tag} from '../device/device.type';
import {Floor} from '../floor/floor.type';

export interface TagListElement {
  lastUpdateTime: number;
  id: number;
  name: string;
  complex: string;
  building: string;
  floor: string;
  floorId: number;
}

export interface TagTracerData {
  tag: Tag;
  floor: Floor
}
