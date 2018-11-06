import {DrawBuilder, ElementType, SvgGroupWrapper} from './drawing.builder';
import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {Point, LineType} from '../../../map-editor/map.type';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {InfoWindowGroupWrapper} from './info.window';
import {APIObject} from './api.types';
import {ApiHelper} from './api.helper';
import {MarkerOnMap} from '../../../map/models/marker';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
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

  private static getDefaultConfiguration(objectMetadata: Metadata): DrawConfiguration {
    return {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'};
  }

  constructor() {
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
    if (objectMetadata != null && this.objects.has(objectMetadata.object.id)) {
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
        this.drawLine(objectMetadata, this.getCalculatedPoints(objectMetadata.object['points'], scale));
        break;
      case 'AREA':
        this.drawArea(objectMetadata, container, this.getCalculatedPoints(objectMetadata.object['points'], scale), originMessageEvent);
        break;
      case 'MARKER':
        this.placeMarkerOnMap(objectMetadata, container, this.getCalculatedPoints([objectMetadata.object['position']], scale)[0], originMessageEvent);
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

  private placeMarkerOnMap(objectMetadata: Metadata, container: d3.selection, point: Point, originMessageEvent: MessageEvent): void {
    const marker: Marker = <Marker>objectMetadata.object;
    const markerOnMap: MarkerOnMap = new MarkerOnMap(point, container, ApiService.getDefaultConfiguration(objectMetadata));
    markerOnMap.setId(objectMetadata.object.id);

    if (!!marker.iconUrl) {
      markerOnMap.setIconFromUrl(marker.iconUrl);
    }
    if (!!marker.iconStringBase64) {
      markerOnMap.injectBase64Icon(marker.iconStringBase64);
    }
    if (!!marker.events) {
      markerOnMap.addEvents(marker.events, originMessageEvent);
    }
    if (!!marker.label) {
      markerOnMap.addLabel(marker.label);
    }
    this.objects.set(objectMetadata.object.id, markerOnMap.getGroup());
  }

  private addToMapContainer(objectMetadata: Metadata, container: d3.selection): void {
    this.objects.set(objectMetadata.object.id,
      new DrawBuilder(container, ApiService.getDefaultConfiguration(objectMetadata))
        .createGroup());
  }

  private addInfoWindowToMapContainer(objectMetadata: Metadata, container: d3.selection): void {
    this.infoWindows.set(objectMetadata.object.id,
      new InfoWindowGroupWrapper(container, {id: `map-object-${objectMetadata.type}-${objectMetadata.object.id}`, clazz: 'map-object'}));
  }

  private drawArea(objectMetadata: Metadata, container: d3.selection, points: Point[], originMessageEvent: MessageEvent): void {
    const area: Area = <Area>objectMetadata.object;
    const areaSelection: SvgGroupWrapper  = new DrawBuilder(container, ApiService.getDefaultConfiguration(objectMetadata)).createGroup();

    if (!!area.border) {
      ApiHelper.setStrokeColor(areaSelection.getGroup(), area.border.color);
      ApiHelper.setStrokeWidth(areaSelection.getGroup(), area.border.width);
      ApiHelper.setRoundCorners(areaSelection.getGroup());
    }
    if (!!area.color) {
      ApiHelper.setFillColor(areaSelection.getGroup(), area.color);
    }
    if (!!area.opacity) {
      ApiHelper.setFillOpacity(areaSelection.getGroup(), area.opacity);
    }

    if (!!area.events) {
      area.events.forEach((event: string): void => {
        areaSelection.getGroup().on(event, (): void => {
            originMessageEvent.source.postMessage({type: `${event}-${area.id}`, objectId: area.id}, '*');
          });
        });
    }
    areaSelection.addPolygon(points);

    this.objects.set(objectMetadata.object.id, areaSelection);
  }

  private drawLine(objectMetadata: Metadata, points: Point[]): void {
    const polyline: Polyline = <Polyline>objectMetadata.object;
    const type: LineType = !!objectMetadata.object['lineType'] ? objectMetadata.object['lineType'] : LineType.SOLID;
    this.objects.get(polyline.id).addLineType(points, type, this.pointRadius);
    const lines: d3.selection[] = this.objects.get(polyline.id).getElements(ElementType.LINE);
    const circles: d3.selection[] = this.objects.get(polyline.id).getElements(ElementType.CIRCLE);
    const lineType = {
      [LineType.SOLID]: () => this.drawSolidPolyline(lines, circles, polyline),
      [LineType.DOTTED]: () => {
        this.drawDottedPolyline(lines, circles, polyline)
      }
    };

    if (!!polyline.color) {
      lineType[type]();
    }
  }

  private drawSolidPolyline(lines: d3.selection, circles: d3.selection, polyline): void {
    lines.forEach((line: d3.selection) => {
      ApiHelper.setStrokeColor(line, polyline.color);
    });
    circles.forEach((circle: d3.selection) => {
      ApiHelper.setFillColor(circle, polyline.color);
    });
  }

  private drawDottedPolyline(lines: d3.selection, circles: d3.selection, polyline): void {
     lines.forEach((line: d3.selection) => {
      ApiHelper.setDottedPolyline(line, polyline.color, polyline.width)
    });
  }

  private placeCircleOnMap(objectMetadata: Metadata, point: Point): void {
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

  private drawInfoWindow(objectMetadata: Metadata): void {
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


