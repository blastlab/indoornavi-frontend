import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Sink} from '../../device/sink.type';
import {Anchor} from '../../device/anchor.type';
import {Area} from '../tool-bar/tools/area/area.type';

export interface Configuration {
  version: number;
  floorId: number;
  publishedDate: number;
  data: ConfigurationData;
}

export interface ConfigurationData {
  sinks: Sink[];
  anchors: Anchor[];
  scale: Scale;
  areas: Area[];
}
