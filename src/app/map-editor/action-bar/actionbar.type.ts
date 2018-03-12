import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Area} from '../tool-bar/tools/area/area.type';
import {Sink} from '../../device/device.type';

export interface Configuration {
  version: number;
  floorId: number;
  publishedDate: number;
  data: ConfigurationData;
}

export interface ConfigurationData {
  sinks: Sink[];
  scale: Scale;
  areas: Area[];
}
