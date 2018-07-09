import {Point} from '../../../map.type';
import {Editable} from '../../../../shared/wrappers/editable/editable';
import {SelectTag} from '../../../../device/device.type';

export class Area {
  id: number;
  name: string;
  configurations: AreaConfiguration[] = [];
  points: Point[] = [];
  buffer: Point[];
  heightMin: number;
  heightMax: number;
  floorId: number;

  static getCustomSettings(): AreaCustomSettings {
    return <AreaCustomSettings> {
      opacity: '0.3',
      fill: 'grey'
    };
  }

  constructor(floorId: number) {
    this.floorId = floorId;
  }
}

export class AreaConfiguration {
  offset: number;
  tags: SelectTag[];
  mode: Mode;

  constructor(mode: Mode, offset: number) {
    this.mode = mode;
    this.offset = offset;
  }
}

export enum Mode {
  ON_ENTER,
  ON_LEAVE
}

export interface AreaCustomSettings {
  opacity: string;
  fill: string;
}

export interface AreaBag {
  dto: Area;
  editable: Editable;
}
