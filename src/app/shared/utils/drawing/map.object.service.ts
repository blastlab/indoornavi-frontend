import {DrawBuilder, InfoWindowGroupWrapper, SvgGroupWrapper} from './drawing.builder';
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
  private infoWindows: Map<number, InfoWindowGroupWrapper> = new Map();
  // TODO: standardize pointRadius for all points that will be drawn on the map
  private pointRadius: number = 5;
  private defaultIcon: DefaultIcon = {
    icon: NaviIcons.MARKER,
    translation: {x: 12, y: 22}
  };

  static respondToOrigin(event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }

  static calculateInfoWindowPosition(infoWindowObject: InfoWindowGroupWrapper, object: d3.selection, position: Position): Point {
    const box: Box = object.getGroup().node().getBBox();
    Object.keys(box).forEach((key: string): number => box[key] = Math.round(box[key]));
    const coordinates: Point = {
      x: 0,
      y: 0
    };
    switch (position) {
      case Position.TOP:
        coordinates.x = box.x + box.width / 2 - infoWindowObject.size.width / 2;
        coordinates.y = box.y - infoWindowObject.size.height;
        break;
      case Position.TOP_LEFT:
        coordinates.x = box.x - infoWindowObject.size.width;
        coordinates.y = box.y - infoWindowObject.size.height;
        break;
      case Position.TOP_RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.y - infoWindowObject.size.height;
        break;
      case Position.LEFT:
        coordinates.x = box.x - infoWindowObject.size.width;
        coordinates.y = box.y + box.height / 2 - infoWindowObject.size.height / 2;
        break;
      case Position.RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.y + box.height / 2 - infoWindowObject.size.height / 2;
        break;
      case Position.BOTTOM:
        coordinates.x = box.x + box.width / 2 - infoWindowObject.size.width / 2;
        coordinates.y = box.y + box.height;
        break;
      case Position.BOTTOM_LEFT:
        coordinates.x = box.x - infoWindowObject.size.width;
        coordinates.y = box.y + box.height;
        break;
      case Position.BOTTOM_RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.x + box.height;
        break;
    }
    return coordinates;
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

  addInfoWindowToMapContainer(objectMetadata: MapObjectMetadata, container: d3.selection): void {
    this.infoWindows.set(objectMetadata.object.id,
      new DrawBuilder(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'})
        .createInfoWindowGroup());
  }

  unset(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).remove();
    this.objects.set(objectMetadata.object.id, null);
  }

  unsetInfoWindow(objectMetadata: MapObjectMetadata): void {
    this.infoWindows.get(objectMetadata.object.id).remove();
    this.infoWindows.set(objectMetadata.object.id, null);
  }

  removeObject(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).remove();
    this.objects.delete(objectMetadata.object.id);
  }

  removeInfoWindow(objectMetadata: MapObjectMetadata): void {
    this.infoWindows.get(objectMetadata.object.id).remove();
    this.infoWindows.delete(objectMetadata.object.id);
  }

  draw(objectMetadata: MapObjectMetadata, scale: Scale, originMessageEvent: MessageEvent, container: d3.selection): void {
    const points: Point[] = [];
    if (!!(<CoordinatesArray>objectMetadata.object).points) {
      (<CoordinatesArray>objectMetadata.object).points.forEach((point: Point): void => {
        points.push(Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(scale.start, scale.stop),
          scale.getRealDistanceInCentimeters(),
          point));
      });
    }
    switch (objectMetadata.type) {
      case 'POLYLINE':
        this.addToMapContainer(objectMetadata, container);
        this.objects.get(objectMetadata.object.id).addPolyline(points, this.pointRadius);
        if (!!(<Stroke>objectMetadata.object).stroke) {
          this.setStrokeColor(objectMetadata);
        }
        break;
      case 'AREA':
        this.addToMapContainer(objectMetadata, container);
        this.objects.get(objectMetadata.object.id).addPolygon(points);
        if (!!(<Fill>objectMetadata.object).fill) {
          this.setFillColor(objectMetadata);
        }
        if (!!(<Opacity>objectMetadata.object).opacity) {
          this.setOpacity(objectMetadata);
        }
        break;
      case 'MARKER':
        this.addToMapContainer(objectMetadata, container);
        this.placeMarkerOnMap(this.objects.get(objectMetadata.object.id), objectMetadata, points[0], originMessageEvent);
        break;
      case 'INFO_WINDOW':
        if (!this.infoWindows.get(objectMetadata.object.id)) {
          this.addInfoWindowToMapContainer(objectMetadata, container);
          const infoWindowObject = this.infoWindows.get(objectMetadata.object.id);
          const self = this;
          if (!!(<InfoWindow>objectMetadata.object).width) {
            infoWindowObject.width = (<InfoWindow>objectMetadata.object).width;
          }
          if (!!(<InfoWindow>objectMetadata.object).height) {
            infoWindowObject.height = (<InfoWindow>objectMetadata.object).height;
          }
          const element = this.objects.get((<InfoWindow>objectMetadata.object).relatedObjectId);
          const anchorPointCoordinates: Point = MapObjectService.calculateInfoWindowPosition(infoWindowObject, element, (<InfoWindow>objectMetadata.object).position);
          const closingInfoWindowPointCoordinates: Point = {x: anchorPointCoordinates.x + infoWindowObject.size.width - 20, y: anchorPointCoordinates.y + 20};
          infoWindowObject.addInfoWindow(anchorPointCoordinates, (<InfoWindow>objectMetadata.object).content)
            .addText(closingInfoWindowPointCoordinates, 'x')
            .getGroup()
            .select('text')
            .attr('cursor', 'pointer')
            .on('click', () => {
              // TODO: post message that info window has been closed to the API source.
              self.unsetInfoWindow(objectMetadata);
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
    this.objects.get(objectMetadata.object.id).getGroup().attr('fill', (<Fill>objectMetadata.object).fill)
  }

  setStrokeColor(objectMetadata: MapObjectMetadata): void {
    this.objects.get(objectMetadata.object.id).getGroup().selectAll('line').nodes().forEach(node => {
      d3.select(node).attr('stroke', (<Stroke>objectMetadata.object).stroke);
    });
    this.objects.get(objectMetadata.object.id).getGroup().selectAll('circle').nodes().forEach(node => {
      d3.select(node).attr('stroke', (<Stroke>objectMetadata.object).stroke).style('fill', (<Stroke>objectMetadata.object).stroke);
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

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Stroke extends MapObject {
  stroke: string;
}

interface Fill extends MapObject {
  fill: string;
}

interface Opacity extends MapObject {
  opacity: number;
}

export interface MapObjectMetadata {
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
  width: number;
  height: number;
  relatedObjectId: number;
}

interface DefaultIcon {
  icon: string;
  translation: Point;
}

export enum Position {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  TOP_RIGHT,
  TOP_LEFT,
  BOTTOM_RIGHT,
  BOTTOM_LEFT
}
