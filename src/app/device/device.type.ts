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

export interface ClientRequest {
  type: string;
  args: any
}

export interface DeviceStatus {
  device: Device;
  anchor: Anchor;
  status: Status;
}

export interface BatteryUptime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface BatteryState {
  deviceShortId: number;
  percentage: number;
  uptime: BatteryUptime
}

export class BatteryStatus {
  constructor(public percentage: number, public message: string) {}
}

export interface DeviceMessage {
  type: string;
  devices?: any[];
  code?: string;
  shortId?: number;
}

export interface FirmwareMessage extends DeviceMessage {
  deviceStatus: DeviceStatus;
}

export interface BatteryMessage extends DeviceMessage {
  batteryLevelList: BatteryState[]
}

export interface DeviceShortId {
  shortId: number
}

export enum Status {
  ONLINE, OFFLINE, UPDATING, UPDATED
}

export enum CommandType {
  BatteryUpdate = 'CHECK_BATTERY_LEVEL',
  FirmwareUpdate = 'UPDATE_FIRMWARE'
}

export interface TxConfigData {
  txPower: TxPower
}

export interface TxPower {
  transmitterCoarse1: number;
  transmitterFine1: number;
  transmitterCoarse2: number;
  transmitterFine2: number;
  transmitterCoarse3: number;
  transmitterFine3: number;
  transmitterCoarse4: number;
  transmitterFine4: number;
}

export interface RfData {
  radioChannel: number;
  radioBaudRate: number;
  preambleLength: number;
  pulseRepetitionFrequency: number;
  preambleAcquisitionChunk: number;
  communicationCode: number;
  sfd: number;
  nsfd: boolean;
}

export interface RfsetConfigData {
  radioChannels: FormSelectData[];
  radioBaudRate: FormSelectData[];
  preambleLength: FormSelectData[];
  pulseRepetitionFrequency: FormSelectData[];
  preambleAcquisitionChunk: FormSelectData[];
}

export interface FormSelectData {
  label: string;
  value: number;
}
