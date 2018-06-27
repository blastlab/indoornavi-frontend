import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {IconService, NaviIcons} from '../../services/drawing/icon.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {InfoWindowGroupWrapper} from './info.window';
import {CoordinatesArray, DefaultIcon, Fill, InfoWindow, MapObject, MapObjectMetadata, Marker, Opacity, Stroke} from './drawing.types';

@Injectable()
export class MapObjectService {
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

  constructor(private iconService: IconService) {
  }

  create(): number {
    const id = Date.now() + Math.round(Math.random() * 100);
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
      new InfoWindowGroupWrapper(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'}));
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
    if (!!this.objects.get(objectMetadata.object.id)) {
      this.removeObject(objectMetadata);
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
          const infoWindow: InfoWindow = (<InfoWindow>objectMetadata.object);
          if (!!infoWindow.width) {
            infoWindowObject.width = infoWindow.width;
          }
          if (!!infoWindow.height) {
            infoWindowObject.height = infoWindow.height;
          }
          const element = this.objects.get(infoWindow.relatedObjectId);
          const topLeftCornerOfInfoWindow: Point = infoWindowObject.calculateInfoWindowPosition(element, infoWindow.position);
          infoWindowObject.draw(topLeftCornerOfInfoWindow, infoWindow.content, this.unsetInfoWindow.bind(this), objectMetadata);
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
        element.getGroup().on(event, (): void => {
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


