import {DrawBuilder, ElementType, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {IconService, NaviIcons} from '../../services/drawing/icon.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {InfoWindowGroupWrapper} from './info.window';
import {APIObject} from './api.types';
import {ApiHelper} from './api.helper';
import DefaultIcon = APIObject.DefaultIcon;
import Metadata = APIObject.Metadata;
import Marker = APIObject.Marker;
import Area = APIObject.Area;
import Polyline = APIObject.Polyline;
import Circle = APIObject.Circle;
import InfoWindow = APIObject.InfoWindow;

@Injectable()
export class ApiService {
  private objects: Map<number, SvgGroupWrapper> = new Map();
  private infoWindows: Map<number, InfoWindowGroupWrapper> = new Map();
  // TODO: standardize pointRadius for all points that will be drawn on the map
  private pointRadius: number = 5;
  private defaultIcon: DefaultIcon = {
    icon: NaviIcons.MARKER,
    translation: {x: 12, y: 22}
  };

  constructor(private iconService: IconService) {
  }

  create(): number {
    const id = Date.now() + Math.round(Math.random() * 100);
    this.objects.set(id, null);
    return id;
  }

  unsetInfoWindow(objectMetadata: Metadata): void {
    if (this.infoWindows.has(objectMetadata.object.id)) {
      this.infoWindows.get(objectMetadata.object.id).remove();
      this.infoWindows.set(objectMetadata.object.id, null);
    }
  }

  removeObject(objectMetadata: Metadata): void {
    if (this.objects.has(objectMetadata.object.id)) {
      this.objects.get(objectMetadata.object.id).remove();
      this.objects.delete(objectMetadata.object.id);
    }
  }

  removeInfoWindow(objectMetadata: Metadata): void {
    if (this.infoWindows.has(objectMetadata.object.id)) {
      this.infoWindows.get(objectMetadata.object.id).remove();
      this.infoWindows.delete(objectMetadata.object.id);
    }
  }

  draw(objectMetadata: Metadata, scale: Scale, originMessageEvent: MessageEvent, container: d3.selection): void {
    if (!!this.objects.get(objectMetadata.object.id)) {
      this.removeObject(objectMetadata);
    }
    switch (objectMetadata.type) {
      case 'POLYLINE':
        this.addToMapContainer(objectMetadata, container);
        this.drawLine(objectMetadata, this.getCalculatedPoints(objectMetadata.object['points'], scale), 'solid');
        break;
      case 'AREA':
        this.addToMapContainer(objectMetadata, container);
        this.drawArea(objectMetadata, this.getCalculatedPoints(objectMetadata.object['points'], scale));
        break;
      case 'MARKER':
        this.addToMapContainer(objectMetadata, container);
        this.placeMarkerOnMap(objectMetadata, this.getCalculatedPoints([objectMetadata.object['position']], scale)[0], originMessageEvent);
        break;
      case 'CIRCLE':
        this.addToMapContainer(objectMetadata, container);
        this.placeCircleOnMap(objectMetadata, this.getCalculatedPoints([objectMetadata.object['position']], scale)[0]);
        break;
      case 'INFO_WINDOW':
        if (!this.infoWindows.get(objectMetadata.object.id)) {
          this.addInfoWindowToMapContainer(objectMetadata, container);
          this.drawInfoWindow(objectMetadata);
        }
    }
  }

  private placeMarkerOnMap(objectMetadata: Metadata, point: Point, originMessageEvent: MessageEvent): void {
    const element: SvgGroupWrapper = this.objects.get(objectMetadata.object.id);
    const marker: Marker = <Marker>objectMetadata.object;
    if (!!marker.icon) {
      element.addCustomIcon(point, marker.icon).getGroup().attr('cursor', 'pointer');
    } else {
      element.addIcon(
        {
          x: point.x - this.defaultIcon.translation.x,
          y: point.y - this.defaultIcon.translation.y
        },
        this.iconService.getIcon(this.defaultIcon.icon)).getGroup().attr('cursor', 'pointer');
    }
    marker.events.forEach((event: string): void => {
      element.getGroup().on(event, (): void => {
        // @ts-ignore
        originMessageEvent.source.postMessage({type: `${event}-${marker.id}`, objectId: marker.id}, originMessageEvent.origin);
      });
    });
    if (!!marker.label) {
      element.addText(
        {
          x: point.x + SvgGroupWrapper.customIconSize.width / 2,
          y: point.y - SvgGroupWrapper.customIconSize.height / 2
        },
        marker.label);
    }
  }

  private addToMapContainer(objectMetadata: Metadata, container: d3.selection): void {
    this.objects.set(objectMetadata.object.id,
      new DrawBuilder(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'})
        .createGroup());
  }

  private addInfoWindowToMapContainer(objectMetadata: Metadata, container: d3.selection): void {
    this.infoWindows.set(objectMetadata.object.id,
      new InfoWindowGroupWrapper(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'}));
  }

  private drawArea(objectMetadata: Metadata, points: Point[]) {
    const area: Area = <Area>objectMetadata.object;
    const areaSelection: d3.selection = this.objects.get(area.id).getGroup();
    this.objects.get(area.id).addPolygon(points);
    if (!!area.color) {
      ApiHelper.setFillColor(areaSelection, area.color);
    }
    if (!!area.opacity) {
      ApiHelper.setStrokeOpacity(areaSelection, area.opacity);
      ApiHelper.setFillOpacity(areaSelection, area.opacity);
    }
  }

  private drawLine(objectMetadata: Metadata, points: Point[], type) {
    const polyline: Polyline = <Polyline>objectMetadata.object;
    // this.objects.get(polyline.id).addPolyline(points, this.pointRadius);
    this.objects.get(polyline.id).addTypeLine(points, type, this.pointRadius);
    const lines: d3.selection[] = this.objects.get(polyline.id).getElements(ElementType.LINE);
    const circles: d3.selection[] = this.objects.get(polyline.id).getElements(ElementType.CIRCLE);

    const typeLine = {
      'solid': () => this.setSolidPolyline(lines, circles, polyline),
      'dotted': () => this.setDottedLine(lines, circles, polyline)
    };

    if (!!polyline.color) {
      typeLine[type]();
    }
  }

  private setSolidPolyline(lines: d3.selection, circles: d3.selection, polyline) {
    lines.forEach((line: d3.selection) => {
      ApiHelper.setStrokeColor(line, polyline.color);
    });
    circles.forEach((circle: d3.selection) => {
      ApiHelper.setFillColor(circle, polyline.color);
    });
  }

  private setDottedLine(lines: d3.selection, circles: d3.selection, polyline) {
     lines.forEach((line: d3.selection) => {
      ApiHelper.setDottedLine(line, polyline.color, 5)
    });
  }

  private placeCircleOnMap(objectMetadata: Metadata, point: Point) {
    const circle: Circle = <Circle>objectMetadata.object;
    this.objects.get(circle.id).addCircle(point, circle.radius);
    const circleSelection: d3.selection = this.objects.get(circle.id).getElements(ElementType.CIRCLE)[0];
    if (!!circle.border) {
      ApiHelper.setStrokeColor(circleSelection, circle.border.color);
      ApiHelper.setStrokeWidth(circleSelection, circle.border.width);
    }
    if (!!circle.opacity) {
      ApiHelper.setStrokeOpacity(circleSelection, circle.opacity);
      ApiHelper.setFillOpacity(circleSelection, circle.opacity);
    }
    if (!!circle.color) {
      ApiHelper.setFillColor(circleSelection, circle.color);
    }
  }

  private drawInfoWindow(objectMetadata: Metadata) {
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

  private getCalculatedPoints(pointsToCalculate: Point[], scale: Scale): Point[] {
    const points: Point[] = [];
    pointsToCalculate.forEach((point: Point): void => {
      points.push(Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(scale.start, scale.stop),
        scale.getRealDistanceInCentimeters(),
        point));
    });
    return points;
  }
}


