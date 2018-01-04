import {Draggable} from './draggables/draggable';
import {Selectable} from './selectables/selectable';
import {ConnectableDevice} from './draggables/connectables/connectableDevice';
import {GroupCreated} from './draw.builder';
import {SelectableDevice} from './selectables/selectableDevice';

export interface Expandable {
  groupCreated: GroupCreated;
  draggable?: Draggable;
  selectable?: Selectable | SelectableDevice;
  connectable?: ConnectableDevice;
}
