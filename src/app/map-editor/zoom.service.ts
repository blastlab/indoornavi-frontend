import {Injectable} from '@angular/core';
import {Point, Transform} from './map.type';
import {MapViewerService} from './map.editor.service';
import * as d3 from 'd3';

@Injectable()
export class ZoomService {

  static calculateTransition (point: Point, transformation: Transform): Point {
    return {x: (point.x - transformation.x) / transformation.k, y: (point.y - transformation.y) / transformation.k};
  }

  static calculateInMapEditorRangeEvent(point: Point, offset: Point[], transformation: Transform): Point {
    const borderNorthWest: Point = ZoomService.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`)
      .attr('x'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('y')}, transformation);
    const borderSouthEast: Point = ZoomService.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`)
      .attr('width'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('height')}, transformation);
    point.x = point.x > borderNorthWest.x + offset[0].x ? point.x : borderNorthWest.x + offset[0].x;
    point.x = point.x < borderSouthEast.x + offset[1].x ? point.x : borderSouthEast.x + offset[1].x;
    point.y = point.y > borderNorthWest.y + offset[0].y ? point.y : borderNorthWest.y + offset[0].y;
    point.y = point.y < borderSouthEast.y + offset[1].y ? point.y : borderSouthEast.y + offset[1].y;
    return {x: point.x, y: point.y};
  }
}
