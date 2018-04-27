import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Area} from '../tool-bar/tools/area/areas.type';
import {Anchor, Sink} from '../../device/device.type';

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
  anchors: Anchor[];
  scale: Scale;
  areas: Area[];
}
