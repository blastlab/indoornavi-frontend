import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Sink} from '../../device/sink.type';
import {Area} from '../tool-bar/tools/area/area.type';

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
