import {DrawBuilder, ElementType, SvgGroupWrapper} from './drawing.builder';
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

  static respondToOrigin(event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }


  constructor(private iconService: IconService) {
  }

  create(): number {
    const id = this.objects.size + 1;
    this.objects.set(id, null);
    return id;
  }

  addToMapContainer(objectMetadata: MapObjectMetadata, container: d3.selection): void {
    this.objects.set(objectMetadata.object.id,
      new DrawBuilder(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'})
        .createGroup());
  }

  unset(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).remove();
    this.objects.set(objectMetadata.object.id, null);
  }

  remove(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).remove();
    this.objects.delete(objectMetadata.object.id);
  }

  draw(objectMetadata: MapObjectMetadata, scale: Scale, originMessageEvent: MessageEvent, container: d3.selection): void {
    const points: Point[] = [];
    (<CoordinatesArray>objectMetadata.object).points.forEach((point: Point): void => {
      points.push(Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(scale.start, scale.stop),
        scale.getRealDistanceInCentimeters(),
        point));
    });
    switch (objectMetadata.type) {
      case 'POLYLINE':
        this.addToMapContainer(objectMetadata, container);
        this.objects.get(objectMetadata.object.id).addPolyline(points, this.pointRadius);
        break;
      case 'AREA':
        this.addToMapContainer(objectMetadata, container);
        this.objects.get(objectMetadata.object.id).addPolygon(points);
        break;
      case 'MARKER':
        this.addToMapContainer(objectMetadata, container);
        this.placeMarkerOnMap(this.objects.get(objectMetadata.object.id), objectMetadata, points[0], originMessageEvent);
        break;
      case 'INFO_WINDOW':
        if (!this.objects.get(objectMetadata.object.id)) {
          this.addToMapContainer(objectMetadata, container);
          const self = this;
          const anchorPointCoordinates: Point = this.calculateInfoWindowPosition(points, (<InfoWindow>objectMetadata.object).position);
          const closingInfoWindowPointCoordinates: Point = {x: anchorPointCoordinates.x + SvgGroupWrapper.infoWindowSize.width - 20, y: anchorPointCoordinates.y + 20};
          this.objects.get(objectMetadata.object.id)
            .addInfoWindow(anchorPointCoordinates, (<InfoWindow>objectMetadata.object).content)
            .addText(closingInfoWindowPointCoordinates, 'X')
            .getGroup()
            .select('text')
            .attr('cursor', 'pointer')
            .on('click', () => {
              // TODO: post message that info window has been closed to the API source.
              self.unset(objectMetadata);
            });
        }
    }
  }

  placeMarkerOnMap(element: SvgGroupWrapper, objectMetadata: MapObjectMetadata, point: Point, originMessageEvent: MessageEvent): void {
    if (!!(<Marker>objectMetadata.object).icon) {
      element.addCustomIcon(point, (<Marker>objectMetadata.object).icon).getGroup().attr('cursor', 'pointer');
    } else {
      element.addIcon(
        {
          x: point.x - this.defaultIcon.translation.x,
          y: point.y - this.defaultIcon.translation.y
        },
        this.iconService.getIcon(this.defaultIcon.icon)).getGroup().attr('cursor', 'pointer');
    }
    if ((<Marker>objectMetadata.object).events.length > 0) {
      (<Marker>objectMetadata.object).events.forEach((event: number): void => {
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
      d3.select(node).attr('stroke', (<Color>objectMetadata.object).color).style('fill', (<Color>objectMetadata.object).color);
    });
  }

  setOpacity(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).getGroup().attr('fill-opacity', (<Opacity>objectMetadata.object).opacity);
  }

  calculateInfoWindowPosition(points: Point[], position: Position): Point {
    const coordinates: Point = {x: 0, y: 0};
    const xs = points.map((point: Point): number => {
      return point.x
    });
    const ys = points.map((point: Point): number => {
      return point.y
    });
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    switch (position) {
      case Position.TOP:
        coordinates.x = xMin + (xMax - xMin) / 2 - SvgGroupWrapper.infoWindowSize.width / 2;
        coordinates.y = yMin - SvgGroupWrapper.infoWindowSize.height - SvgGroupWrapper.customIconSize.height;
        break;
      case Position.TOP_LEFT:
        coordinates.x = xMin - SvgGroupWrapper.infoWindowSize.width;
        coordinates.y = yMin - SvgGroupWrapper.infoWindowSize.height - SvgGroupWrapper.customIconSize.height;
        break;
      case Position.TOP_RIGHT:
        coordinates.x = xMax;
        coordinates.y = xMin - SvgGroupWrapper.infoWindowSize.height - SvgGroupWrapper.customIconSize.height;
        break;
      case Position.LEFT:
        coordinates.x = xMin - SvgGroupWrapper.infoWindowSize.width - SvgGroupWrapper.customIconSize.width / 2;
        coordinates.y = yMin + (yMax - yMin) / 2 - SvgGroupWrapper.infoWindowSize.height / 2;
        break;
      case Position.RIGHT:
        coordinates.x = xMax + SvgGroupWrapper.customIconSize.width / 2;
        coordinates.y = yMin + (yMax - yMin) / 2 - SvgGroupWrapper.infoWindowSize.height / 2;
        break;
      case Position.BOTTOM:
        coordinates.x = xMin + (xMax - xMin) / 2 - SvgGroupWrapper.infoWindowSize.width / 2;
        coordinates.y = yMax;
        break;
      case Position.BOTTOM_LEFT:
        coordinates.x = xMin - SvgGroupWrapper.infoWindowSize.width;
        coordinates.y = yMax;
        break;
      case Position.BOTTOM_RIGHT:
        coordinates.x = xMax;
        coordinates.y = yMax;
        break;
    }
    return coordinates;
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

interface InfoWindow extends MapObject {
  content: string;
  position: number;
}

interface DefaultIcon {
  icon: string;
  translation: Point;
}

enum Position {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  TOP_RIGHT,
  TOP_LEFT,
  BOTTOM_RIGHT,
  BOTTOM_LEFT
}
