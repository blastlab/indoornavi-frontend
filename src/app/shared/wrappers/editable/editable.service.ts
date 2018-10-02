import {Injectable} from '@angular/core';
import {MenuItem} from 'primeng/primeng';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ContextMenuService {
  private itemsSet = new Subject<MenuItem[]>();
  private menuToggled = new Subject<void>();

  onItemsSet(): Observable<MenuItem[]> {
    return this.itemsSet.asObservable();
  }

  setItems(items: MenuItem[]) {
    this.itemsSet.next(items);
  }

  openContextMenu() {
    this.menuToggled.next();
  }

  onToggle(): Observable<void> {
    return this.menuToggled.asObservable();
  }
}
