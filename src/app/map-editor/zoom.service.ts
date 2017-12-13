import {Injectable} from '@angular/core';
import {Point, Transform} from './map.type';
import {MapViewerService} from './map.editor.service';
import * as d3 from 'd3';

@Injectable()
export class ZoomService {

  private transformation: Transform = {x: 0, y: 0, k: 1};

  constructor () {
    MapViewerService.mapIsTransformed().subscribe((transformation: Transform) => {
      this.transformation = transformation;
    });
  }

  calculateTransition (point: Point): Point {
    // to understand zoom transformation think of it as on inflating a balloon,
    // each point on the balloon surface has unique transformation vector
    return {x: (point.x - this.transformation.x) / this.transformation.k, y: (point.y - this.transformation.y) / this.transformation.k};
  }

  calculateInMapEditorRangeEvent(point: Point, offset: Point[]): Point {
    const borderNorthWest: Point = this.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`)
      .attr('x'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('y')});
    const borderSouthEast: Point = this.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`)
      .attr('width'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('height')});
    point.x = point.x > borderNorthWest.x + offset[0].x ? point.x : borderNorthWest.x + offset[0].x;
    point.x = point.x < borderSouthEast.x + offset[1].x ? point.x : borderSouthEast.x + offset[1].x;
    point.y = point.y > borderNorthWest.y + offset[0].y ? point.y : borderNorthWest.y + offset[0].y;
    point.y = point.y < borderSouthEast.y + offset[1].y ? point.y : borderSouthEast.y + offset[1].y;
    return {x: point.x, y: point.y};
  }
}
