import {UWB} from '../../device/device.type';

export class Event {
  level: string;
  message: string;
  areaName: string;
  device: UWB;
}

export enum EventLevel {
  WARNING,
  DANGER
}
