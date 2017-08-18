import {Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Sink} from '../../sink/sink.type';

export interface Configuration {
  version: number;
  floorId: number;
  data: ConfigurationData;
}

export interface ConfigurationData {
  sinks: Sink[];
  scale: Scale;
}
