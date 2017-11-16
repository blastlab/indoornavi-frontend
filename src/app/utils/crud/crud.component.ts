import {NgForm} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

export interface CrudComponent extends CrudComponentForm, CrudComponentList {
}

export interface CrudComponentForm {
  open?(object?: CrudItem): Observable<CrudItem>;

  save(isValid: boolean): void;

  cancel(): void;
}

export interface CrudComponentList {
  openDialog(object?: CrudItem): void;

  remove(indexOrItem: number|CrudItem): void;

  goTo?(object: CrudItem): void;
}

export interface CrudItem {
  id?: number;
}

export class CrudHelper {

  /**
   * CrudItem will be added if is a new one, otherwise it will be replaced with the current one on the list
   * @param {CrudItem} what - item to be added to the list or updated
   * @param {CrudItem[]} where - the list of items
   * @param {boolean} isNew - defines if item is newly created
   * @return {CrudItem[]} the list with added or updated item
   */
  static add(what: CrudItem, where: CrudItem[], isNew: boolean): CrudItem[] {
    if (!isNew) {
      const index = where.findIndex((elem) => {
        return elem.id === what.id;
      });
      where.splice(index, 1, what);
    } else {
      where.push(what);
    }
    return [...where];
  }

  /**
   * CrudItem with given index will be removed from list
   * @param {number} index of the item on the list
   * @param {CrudItem[]} from - the list of items
   * @return {CrudItem[]} the list without removed item
   */
  static remove(index: number, from: CrudItem[]) {
    from.splice(index, 1);
    return [...from];
  }

  static validateAllFields(form: NgForm) {
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      control.markAsTouched({onlySelf: true});
      control.markAsDirty({onlySelf: true});
    });
  }
}
