import {MapService} from './map.service';
import {Point, Transform} from './map.type';
import {Injectable} from '@angular/core';

@Injectable()
export class ZoomService {
  private transformation: Transform = {x: 0, y: 0, k: 1};

  constructor (private mapService: MapService) {
    this.mapService.mapIsTransformed().subscribe((transformation: Transform) => {
      this.transformation = transformation;
    });
  }

  public calculate (point: Point): Point {
    return {x: (point.x - this.transformation.x) / this.transformation.k, y: (point.y - this.transformation.y) / this.transformation.k}
  }

}
