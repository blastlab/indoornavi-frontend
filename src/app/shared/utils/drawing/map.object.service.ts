import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';

@Injectable()
export class MapObjectService {
  private objects: Map<number, SvgGroupWrapper> = new Map();
  // TODO: standardize pointRadius for all points that will be drawn on the map
  private pointRadius: number = 5;

  constructor() {}

  create(container: d3.selection): number {
    const id = this.objects.size + 1;
    this.objects.set(id, new DrawBuilder(container, {id: `map-object-${id}`, clazz: 'map-object'}).createGroup());
    return id;
  }

  remove(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).remove();
    this.objects.delete(objectMetadata.object.id);
  }

  draw (objectMetadata: MapObjectMetadata, scale): void {
    const points: Point[] = [];
    (<Polyline>objectMetadata.object).points.forEach((point: Point): void => {
      points.push(Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(scale.start, scale.stop),
        scale.getRealDistanceInCentimeters(),
        point));
    });
    switch (objectMetadata.type) {
      case 'POLYLINE':
        this.objects.get(objectMetadata.object.id).addPolyline(points, this.pointRadius);
        break;
    }
  }
}

interface MapObject {
  id: number;
}

interface Polyline extends MapObject {
  points: Point[];
}

interface MapObjectMetadata {
  type: string;
  object: MapObject
}
