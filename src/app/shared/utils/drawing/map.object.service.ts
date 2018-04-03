import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {IconService, NaviIcons} from '../../services/drawing/icon.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';

@Injectable()
export class MapObjectService {
  private events: string[] = ['click', 'mouseover'];
  private objects: Map<number, SvgGroupWrapper> = new Map();
  // TODO: standardize pointRadius for all points that will be drawn on the map
  private pointRadius: number = 5;
  private defaultIcon: DefaultIcon = {
    icon: NaviIcons.MARKER,
    translation: {x: 12, y: 22}
  };

  static respondToOrigin (event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }


  constructor(
    private iconService: IconService
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

  draw (objectMetadata: MapObjectMetadata, scale: Scale, originMessageEvent: MessageEvent): void {
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
        this.placeMarkerOnMap(this.objects.get(objectMetadata.object.id), objectMetadata, points[0], originMessageEvent);
        break;
      case 'INFO_WINDOW':
        this.objects.get(objectMetadata.object.id).addInfoWindow(points[0], (<InfoWindow>objectMetadata.object).content)
    }
  }

  placeMarkerOnMap(element: SvgGroupWrapper, objectMetadata: MapObjectMetadata, point: Point, originMessageEvent: MessageEvent): void {
    if (!!(<Marker>objectMetadata.object).icon) {
      element.addCustomIcon(point, (<Marker>objectMetadata.object).icon);
    } else {
      element.addIcon(
        {
          x: point.x - this.defaultIcon.translation.x,
          y: point.y - this.defaultIcon.translation.y
        },
        this.iconService.getIcon(this.defaultIcon.icon));
    }
    if ((<Marker>objectMetadata.object).events.length > 0) {
      (<Marker>objectMetadata.object).events.forEach( (event: number): void => {
        element.getGroup().on(this.events[event], (): void => {
          MapObjectService.respondToOrigin(event, (<MapObject>objectMetadata.object).id, originMessageEvent);
        });
      });
    }
    if (!!(<Marker>objectMetadata.object).label) {
      element.addText(
        {
          x: point.x + SvgGroupWrapper.customIconSize.width / 2,
          y: point.y - SvgGroupWrapper.customIconSize.height / 2
        },
        (<Marker>objectMetadata.object).label)
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

interface Marker extends MapObject {
  events: number[];
  icon: string;
  label: string;
  points: Point[];
}

interface InfoWindow extends MapObject{
  content: string;
  position: number;
}

interface DefaultIcon {
  icon: string;
  translation: Point;
}

// enum Positions {
//   TOP,
//   RIGHT,
//   BOTTOM,
//   LEFT,
//   TOP_RIGHT,
//   TOP_LEFT,
//   BOTTOM_RIGHT,
//   BOTTOM_LEFT
// }
