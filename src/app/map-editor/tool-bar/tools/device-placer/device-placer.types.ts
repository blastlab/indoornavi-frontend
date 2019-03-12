import {Anchor, Sink} from '../../../../device/device.type';
import {SinkInEditor} from '../../../../map/models/sink';
import {AnchorInEditor} from '../../../../map/models/anchor';
import {DrawConfiguration} from '../../../../map-viewer/publication.type';

export interface DeviceDto {
  device: Anchor,
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


export interface DeviceInEditorConfiguration extends DrawConfiguration {
  heightInMeters: number;
}

export enum DeviceAppearance {
  IN_SCOPE, OUT_SCOPE, ACTIVE
}

export interface DeviceCallbacks {
  unset: () => void;
}

export interface PlacementResult {
  isValid: boolean;
  message?: string;
}
