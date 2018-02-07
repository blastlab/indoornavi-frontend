import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';

@Injectable()
export class MapObjectService {
  private objects: Map<number, SvgGroupWrapper> = new Map();
  private pointRadius: number = 5;

  constructor() {}

  create(container: d3.selection): number {
    const id = this.objects.size + 1;
    this.objects.set(id, new DrawBuilder(container, {id: `map-object-${id}`, clazz: 'map-object'}).createGroup());
    return id;
  }
  delete(id: number): void {
    this.objects.get(id).remove();
    this.objects.delete(id);
  }
  draw (objectMetadata: MapObjectMetadata) {
    switch (objectMetadata.type) {
      case MapObjectType.POLYLINE:
        this.objects.get(objectMetadata.object.id).addPolyline((<Polyline>objectMetadata.object).points, this.pointRadius);
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
  type: MapObjectType;
  object: MapObject
}

enum MapObjectType {
  POLYLINE
}
