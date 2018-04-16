export class Device {
  id?: number;
  name?: string;
  shortId: number;
  longId?: number;
  verified: boolean;
  x?: number;
  y?: number;
  floorId?: number;
  firmwareVersion?: string;

  constructor(shortId: number, longId: number, verified: boolean, id?: number, name?: string, x?: number, y?: number, floorId?: number, firmwareVersion?: string) {
    this.id = id;
    this.name = name;
    this.shortId = shortId;
    this.longId = longId;
    this.verified = verified;
    this.x = x;
    this.y = y;
    this.floorId = floorId;
    this.firmwareVersion = firmwareVersion;
  }
}

export interface Anchor extends Device {
}

export interface Tag extends Device {
}

export interface Sink extends Anchor {
  anchors: Anchor[];
}

export class UpdateRequest {
  constructor(private devicesShortIds: number[], private base64file: string) {
    this.devicesShortIds = devicesShortIds;
    this.base64file = base64file;
  }
}

export interface DeviceStatus {
  device: Device;
  status: Status;
}

export enum Status {
  ONLINE, OFFLINE, UPDATING, UPDATED
}
