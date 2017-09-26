import {Floor} from '../floor/floor.type';

export interface Building {
  id?: number;
  name: string;
  complexId: number;
  floors?: Floor[];
}
