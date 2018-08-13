import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Area} from '../tool-bar/tools/area/areas.type';
import {Sink} from '../../device/device.type';
import {Line} from '../map.type';

export class Configuration {
  id: number;
  version: number;
  floorId: number;
  savedDraftDate: Date;
  publishedDate: Date;
  data: ConfigurationData;

  static getDateFields() {
    return ['savedDraftDate', 'publishedDate'];
  }
}

export interface ConfigurationData {
  sinks: Sink[];
  scale: Scale;
  areas: Area[];
  paths: Line[];
}
