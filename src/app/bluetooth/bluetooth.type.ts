export class Bluetooth {
  id?: number;
  name?: string;
  shortId: number;
  longId?: number;
  verified: boolean;
  x?: number;
  y?: number;
  z?: number;
  xInPixels?: number;
  yInPixels?: number;
  floorId?: number;
  firmwareVersion?: string;
  major?: number;
  macAddress?: string;
  powerTransmition?: number;

  constructor(shortId: number, longId: number, verified: boolean, id?: number, name?: string, x?: number, y?: number, z?: number,
              floorId?: number, firmwareVersion?: string, xInPixels?: number, yInPixels?: number, major?: number, macAddress?: string, powerTransmition?: number) {
    this.id = id;
    this.name = name;
    this.shortId = shortId;
    this.longId = longId;
    this.verified = verified;
    this.x = x;
    this.y = y;
    this.floorId = floorId;
    this.firmwareVersion = firmwareVersion;
    this.xInPixels = xInPixels;
    this.yInPixels = yInPixels;
    this.major = major;
    this.macAddress = macAddress;
    this.powerTransmition = powerTransmition;
  }
}
