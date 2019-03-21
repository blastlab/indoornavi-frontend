import {Tag} from '../../device/device.type';

export interface HeatmapFilterProperties {
  from: Date;
  to: Date;
  tags: Tag[];
}
