import {Point} from '../../../map.type';
import {MapObjectParams} from '../../../../utils/drawing/drawing.service';

export interface MapObject {
  parameters: MapObjectParams;
  coordinates: Point;
}
