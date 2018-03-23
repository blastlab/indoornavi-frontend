import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {IconService, NaviIcons} from '../../services/drawing/icon.service';

@Injectable()
export class MapObjectService {
  private objects: Map<number, SvgGroupWrapper> = new Map();
  private icons: Map<number, Icon> = new Map();
  // TODO: standardize pointRadius for all points that will be drawn on the map
  private pointRadius: number = 5;
  private marker: Marker = {
    icon: NaviIcons.MARKER,
    translation: {x: 12, y: 22}
  };

  constructor(
    private iconService: IconService,
  ) {}

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
    (<CoordinatesArray>objectMetadata.object).points.forEach((point: Point): void => {
      points.push(Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(scale.start, scale.stop),
        scale.getRealDistanceInCentimeters(),
        point));
    });
    switch (objectMetadata.type) {
      case 'POLYLINE':
        this.objects.get(objectMetadata.object.id).addPolyline(points, this.pointRadius);
        break;
      case 'AREA':
        this.objects.get(objectMetadata.object.id).addPolygon(points);
        break;
      case 'MARKER':
        this.addMarker(objectMetadata, points);
        break;
    }
  }

  addMarker(objectMetadata: MapObjectMetadata, points: Point[]): void {
    let markerIcon: Icon = {path: this.iconService.getIcon(this.marker.icon), point: {x: points[0].x - this.marker.translation.x, y: points[0].y - this.marker.translation.y}};
    if (this.icons.get(objectMetadata.object.id)) {
      markerIcon = this.icons.get(objectMetadata.object.id);
      markerIcon.point = {x: points[0].x - markerIcon.point.x, y: points[0].y - markerIcon.point.y}
    } else {
      this.icons.set(objectMetadata.object.id, markerIcon);
    }
    if (!!this.objects.get(objectMetadata.object.id).getGroup().select('svg')) {
      this.objects.get(objectMetadata.object.id).getGroup().select('svg').remove();
    }
    this.objects.get(objectMetadata.object.id)
      .addIcon(markerIcon.point, markerIcon.path);
  }

  setFillColor(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).getGroup().attr('fill', (<Color>objectMetadata.object).color);
  }

  setStrokeColor(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).getGroup().selectAll('line').nodes().forEach(node => {
      d3.select(node).attr('stroke', (<Color>objectMetadata.object).color);
    });
    this.objects.get(objectMetadata.object.id).getGroup().selectAll('circle').nodes().forEach(node => {
      d3.select(node).attr('stroke', (<Color>objectMetadata.object).color).style('fill',  (<Color>objectMetadata.object).color);
    });
  }

  setOpacity(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).getGroup().attr('fill-opacity', (<Opacity>objectMetadata.object).opacity);
  }

  setIcon(objectMetadata: MapObjectMetadata): void {
    const icon = (<IconDto>objectMetadata.object).icon;
    this.icons.set(objectMetadata.object.id, icon);
  }

}

interface MapObject {
  id: number;
}

interface CoordinatesArray extends MapObject {
  points: Point[];
}

interface Color extends MapObject {
  color: string;
}

interface Opacity extends MapObject {
  opacity: number;
}

interface MapObjectMetadata {
  type: string;
  object: MapObject
}

interface Marker {
  icon: string;
  translation: Point;
}

interface IconDto extends MapObject {
  icon: Icon;
}

interface Icon {
  path: string;
  point: Point;
}
