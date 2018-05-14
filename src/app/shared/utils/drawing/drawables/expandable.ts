import {Draggable} from './draggables/draggable';
import {Selectable} from './selectables/selectable';
import {ConnectableDevice} from './draggables/connectables/connectableDevice';
import {SelectableDevice} from './selectables/selectableDevice';
import {SvgGroupWrapper} from '../drawing.builder';

export interface Expandable {
  groupCreated: SvgGroupWrapper;
  draggable?: Draggable;
  selectable?: Selectable | SelectableDevice;
  connectable?: ConnectableDevice;
}
