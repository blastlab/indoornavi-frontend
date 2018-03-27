import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {IconService, NaviIcons} from '../../services/drawing/icon.service';

@Injectable()
export class MapObjectService {
  private objects: Map<number, SvgGroupWrapper> = new Map();
  private icons: Map<number, string> = new Map();
  private labels: Map<number, string> = new Map();
  private markersPlacement: Map<number, Point[]> = new Map();
  private infoWindows: Map<number, InfoWindow> = new Map();
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
    this.labels.delete(objectMetadata.object.id);
    this.icons.delete(objectMetadata.object.id);
    this.markersPlacement.delete(objectMetadata.object.id);
    this.infoWindows.delete(objectMetadata.object.id);
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
        this.setMarker(objectMetadata, points);
        break;
    }
  }

  setMarker(objectMetadata: MapObjectMetadata, points: Point[]): void {
    if (!!this.markersPlacement.get(objectMetadata.object.id)) {
      this.objects.get(objectMetadata.object.id).getGroup().select('svg').remove();
    }
    if (!!this.icons.get(objectMetadata.object.id)) {
      this.objects.get(objectMetadata.object.id).addCustomIcon(points[0], this.icons.get(objectMetadata.object.id));
    } else {
      const point: Point = {
        x: points[0].x - this.marker.translation.x,
        y: points[0].y - this.marker.translation.y
      } ;
      this.objects.get(objectMetadata.object.id)
        .addIcon(point, this.iconService.getIcon(this.marker.icon));
    }
    this.markersPlacement.set(objectMetadata.object.id, points);
    if (!!this.labels.get(objectMetadata.object.id)) {
      // this.setLabel(objectMetadata);
    }
  }

  reloadIcon (objectMetadata: MapObjectMetadata, icon: string): void {
    const coordinates: Point = this.markersPlacement.get(objectMetadata.object.id)[0];
    const element = this.objects.get(objectMetadata.object.id);
    element.getGroup().select('svg').remove();
    element.addCustomIcon(coordinates, icon);
    if (!!this.labels.get(objectMetadata.object.id)) {
      // this.setLabel(objectMetadata);
    }
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
    this.icons.set(objectMetadata.object.id, (<Icon>objectMetadata.object).icon);
    if (!!this.markersPlacement.get(objectMetadata.object.id)) {
      this.reloadIcon(objectMetadata, (<Icon>objectMetadata.object).icon);
    }
  }

  setLabel(objectMetadata: MapObjectMetadata): void {
    if (!!(<Label>objectMetadata.object).label) {
      this.labels.set(objectMetadata.object.id, (<Label>objectMetadata.object).label);
    }
    if (!!this.markersPlacement.get(objectMetadata.object.id) && this.labels.get(objectMetadata.object.id)) {
      const coordinates: Point = this.markersPlacement.get(objectMetadata.object.id)[0];
      const coordinatesTranslated: Point = {x: coordinates.x + SvgGroupWrapper.customIconSize.width / 2, y: coordinates.y - SvgGroupWrapper.customIconSize.height / 2};
      this.objects.get(objectMetadata.object.id).addText(coordinatesTranslated, (<Label>objectMetadata.object).label);
    }
  }

  setInfoWindow(objectMetadata: MapObjectMetadata): void {
    this.infoWindows.set(objectMetadata.object.id, (<InfoWindowDto>objectMetadata.object).infoWindow);
    if (!!this.markersPlacement.get(objectMetadata.object.id)) {
      // reload InfoWindow
    }
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

interface Icon extends MapObject {
  icon: string;
}

interface Label extends MapObject {
  label: string;
}

interface InfoWindowDto extends MapObject {
  infoWindow: InfoWindow;
}

interface InfoWindow {
  content: string;
  position: Positions;
}

enum Positions {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  TOP_RIGHT,
  TOP_LEFT,
  BOTTOM_RIGHT,
  BOTTOM_LEFT
}
