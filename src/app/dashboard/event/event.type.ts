import {UWB} from '../../device/device.type';

export class Event {
  level: string;
  message: string;
  device: UWB;
}

export enum EventLevel {
  WARNING,
  DANGER
}
