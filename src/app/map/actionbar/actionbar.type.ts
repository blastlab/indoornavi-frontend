import {Scale} from '../toolbar/tools/scale/scale.type';
import {Sink} from '../../device/sink.type';

export interface Configuration {
  version: number;
  floorId: number;
  publishedDate: number;
  data: ConfigurationData;
}

export interface ConfigurationData {
  sinks: Sink[];
  scale: Scale;
}
