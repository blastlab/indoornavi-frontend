import {Injectable} from '@angular/core';
import {MenuItem} from 'primeng/primeng';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ContextMenuService {
  private itemsSet = new Subject<MenuItem[]>();
  private menuToggled = new Subject<void>();
  private hideMenu = new Subject<void>();

  onItemsSet(): Observable<MenuItem[]> {
    return this.itemsSet.asObservable();
  }

  setItems(items: MenuItem[]): void {
    this.itemsSet.next(items);
  }

  openContextMenu(): void {
    this.menuToggled.next();
  }

  onToggle(): Observable<void> {
    return this.menuToggled.asObservable();
  }

  hide(): void {
    this.hideMenu.next();
  }

  onHide(): Observable<void> {
    return this.hideMenu.asObservable();
  }
}
