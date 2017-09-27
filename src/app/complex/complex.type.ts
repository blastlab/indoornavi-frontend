import {Building} from '../building/building.type';

export interface Complex {
  id?: number;
  name: string;
  buildings?: Building[];
}
