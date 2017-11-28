import {Building} from '../building/building.type';
import {CrudItem} from '../utils/crud/crud.component';

export class Complex implements CrudItem {
  id?: number;
  name: string;
  buildings?: Building[];

  constructor(name?: string, buildings?: Building[], id?: number) {
    this.id = id;
    this.name = name;
    this.buildings = buildings;
  }
}
