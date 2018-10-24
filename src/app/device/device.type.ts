export class Device {
  verified: boolean;
  id?: number;
  name?: string;
  macAddress?: string;

  constructor(verified: boolean, id?: number, name?: string, macAddress?: string) {
    this.id = id;
    this.name = name;
    this.verified = verified;
    this.macAddress = macAddress;
  }
}

export class UWB extends Device {
  shortId: number;
  firmwareVersion?: string;

  constructor(
    verified: boolean,
    shortId: number,
    id?: number,
    name?: string,
    macAddress?: string,
    firmwareVersion?: string,
  ) {
    super(verified, id, name, macAddress);
    this.shortId = shortId;
    this.firmwareVersion = firmwareVersion;
  }
}

export class Anchor extends UWB {
  x?: number;
  y?: number;
  z?: number;
  xInPixels?: number;
  yInPixels?: number;
  floorId?: number;
  battery?: number;

  constructor(
    verified: boolean,
    shortId: number,
    id?: number,
    name?: string,
    macAddress?: string,
    firmwareVersion?: string,
    x?: number,
    y?: number,
    z?: number,
    xInPixels?: number,
    yInPixels?: number,
    floorId?: number
  ) {
    super(verified, shortId, id, name, macAddress, firmwareVersion);
    this.x = x;
    this.y = y;
    this.z = z;
    this.xInPixels = xInPixels;
    this.yInPixels = yInPixels;
    this.floorId = floorId;
  }
}

export class Tag extends UWB {
}

export class Sink extends Anchor {
  anchors: Anchor[];
}

export class Bluetooth extends Device {
  major: number;
  minor?: number;
  powerTransmition?: number;

  constructor(
    verified: boolean,
    major: number,
    id?: number,
    name?: string,
    macAddress?: string,
    minor?: number,
    powerTransmition?: number
  ) {
    super(verified, id, name, macAddress);
    this.major = major;
    this.minor = minor;
    this.powerTransmition = powerTransmition;
  }
}

export class UpdateRequest {
  constructor(private devicesShortIds: number[], private base64file: string) {
    this.devicesShortIds = devicesShortIds;
    this.base64file = base64file;
  }
}

export interface DeviceStatus {
  device: Device;
  anchor: Anchor;
  status: Status;
}

export enum Status {
  ONLINE, OFFLINE, UPDATING, UPDATED
}
