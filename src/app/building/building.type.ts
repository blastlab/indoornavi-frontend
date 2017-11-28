import {Floor} from '../floor/floor.type';
import {Complex} from '../complex/complex.type';
import {CrudItem} from '../utils/crud/crud.component';

export class Building implements CrudItem {
  id?: number;
  name: string;
  complex: Complex;
  floors?: Floor[];

  constructor(name?: string, complex?: Complex, floors?: Floor[], id?: number) {
    this.name = name;
    this.complex = complex;
    this.floors = floors;
    this.id = id;
  };
}
