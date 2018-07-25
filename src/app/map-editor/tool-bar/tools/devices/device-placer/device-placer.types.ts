import {Anchor, Device, Sink} from '../../../../../device/device.type';
import {SinkInEditor} from '../../../../../map/models/sink';
import {AnchorInEditor} from '../../../../../map/models/anchor';

export interface DeviceDto {
  device: Device,
  type: DeviceType
}

export interface SinkBag {
  deviceInList: Sink,
  deviceInEditor: SinkInEditor
}

export interface AnchorBag {
  deviceInList: Anchor,
  deviceInEditor: AnchorInEditor
}

export enum DeviceType {
  ANCHOR, SINK
}
