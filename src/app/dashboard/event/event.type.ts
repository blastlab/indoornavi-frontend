export class Event {
  level: string;
  message: string;
  areaName: string;
  deviceName: string;
}

export enum EventLevel {
  WARNING,
  DANGER
}
