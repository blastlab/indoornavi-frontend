import {Draggable} from './draggable';
import {Selectable} from './selectable';
import {ConnectableDevice} from './connectableDevice';
import {GroupCreated} from './draw.builder';

export interface Expandable {
  groupCreated: GroupCreated;
  draggable?: Draggable;
  selectable?: Selectable;
  connectable?: ConnectableDevice;
}
