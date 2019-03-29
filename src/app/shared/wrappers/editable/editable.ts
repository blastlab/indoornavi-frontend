import * as d3 from 'd3';
import {ContextMenuService} from './editable.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {SvgGroupWrapper} from '../../utils/drawing/drawing.builder';
import {TranslateService} from '@ngx-translate/core';

export class Editable {

  private selected: Subject<Editable> = new Subject<Editable>();
  private edit: string;
  private remove: string;

  constructor(public groupWrapper: SvgGroupWrapper,
              private contextMenuService: ContextMenuService,
              private translate: TranslateService
              ) {
    this.translate.setDefaultLang('en');
    this.translate.get('edit').first().subscribe((value: string) => {
      this.edit = value;
    });
    this.translate.get('remove').first().subscribe((value: string) => {
      this.remove = value;
    });
  }

  on(callbacks: EditableCallbacks): d3.selection {
    this.contextMenuService.setItems([
      {
        label: this.edit,
        command: callbacks.edit
      },
      {
        label: this.remove,
        command: callbacks.remove
      }
    ]);
    this.groupWrapper.getGroup().on('contextmenu', (): void => {
      d3.event.preventDefault();
      this.contextMenuService.openContextMenu();
      this.selected.next(this);
    });
    return this;
  }

  off(): d3.selection {
    this.groupWrapper.getGroup().on('contextmenu', null);
    return this;
  }

  onSelected(): Observable<Editable> {
    return this.selected.asObservable();
  }

}

export interface EditableCallbacks {
  edit: () => void;
  remove: () => void;
}
