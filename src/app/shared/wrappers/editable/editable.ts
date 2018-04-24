import * as d3 from 'd3';
import {ContextMenuService} from './editable.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {SvgGroupWrapper} from '../../utils/drawing/drawing.builder';

export class Editable {

  private selected: Subject<Editable> = new Subject<Editable>();

  constructor(public groupWrapper: SvgGroupWrapper, private contextMenuService: ContextMenuService) {
  }

  on(callbacks: EditableCallbacks): d3.selection {
    // todo: tłumaczenie
    this.contextMenuService.setItems([
      {
        label: 'Edit',
        command: callbacks.edit
      },
      {
        label: 'Remove',
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
