import {Line, Point} from '../../../map-editor/map.type';
import {PathService} from '../../../map-viewer/services/path/path.service';
import {Injectable} from '@angular/core';
import {ApiService} from '../drawing/api.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {APIObject} from '../drawing/api.types';
import * as d3 from 'd3';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {NavigationService} from './navigation.service';
import {Geometry} from '../helper/geometry';
import Metadata = APIObject.Metadata;
import Path = APIObject.Path;
import NavigationData = APIObject.NavigationData;
import Circle = APIObject.Circle;

@Injectable()
export class NavigationController {

  isNavigationReady = false;
  private container: d3.container;
  private scale: Scale;
  private destination: Point;
  private lastCoordinates: Point;
  private accuracy: number;
  private event: MessageEvent;
  private objectMetadataPolyline: Metadata;
  private objectMetadataStart: Metadata;
  private objectMetadataFinish: Metadata;
  private positionChanged: Subject<Point> = new Subject<Point>();
  private lines: Line[];
  private stoppedBeforeIsNavigationReady: boolean = false;

  constructor(
    private pathService: PathService,
    private mapObjectService: ApiService,
    private navigationService: NavigationService,
  ) {}

  handleNavigation(event: MessageEvent, floorId, container, scale) {
    const args: NavigationData = event.data.args.object;
    if (args.action === 'stop') {
      this.stopNavigation();
    }
    if (this.isNavigationReady) {
      if (args.action === 'update') {
        this.updatePosition(args.position);
      }
    } else if (args.action === 'start') {
      this.setNavigationPath(floorId, args.location, args.destination, args.accuracy, event, container, scale);
    } else if (args.action === 'update') {
      this.setLastCoordinates(args.position);
    }
  }

  private setLastCoordinates(coordinates: Point): void {
    this.lastCoordinates = coordinates;
  }

  private setNavigationPath(floorId: number, location: Point, destination: Point, accuracy: number, event: MessageEvent, container: d3.selection, scale: Scale) {
    this.container = container;
    this.destination = destination;
    this.accuracy =  (accuracy && accuracy > 0) ? accuracy : Infinity;
    this.scale = scale;
    if (this.isNavigationReady) {
      this.event.source.postMessage({type: 'navigation', action: 'working'}, '*');
      return;
    }
    this.event = event;
    this.pathService.getPathByFloorId(floorId).subscribe((lines: Line[]): void => {
      this.calculateNavigationPath(lines, location, destination);
      this.onPositionChanged().subscribe((pointUpdate: Point): void => {
        this.handlePathUpdate(pointUpdate);
      });
      if (this.lastCoordinates) {
        this.updatePosition(this.lastCoordinates);
      }
      if (this.stoppedBeforeIsNavigationReady) {
        this.stopNavigation();
      }
    });
  }

  private updatePosition(position: Point): void {
    this.positionChanged.next(position);
  }

  private onPositionChanged(): Observable<Point> {
    return this.positionChanged.asObservable();
  }

  private stopNavigation() {
    if (!!this.event) {
      this.event.source.postMessage({type: 'navigation', action: 'finished'}, '*');
    }
    if (this.isNavigationReady) {
      this.isNavigationReady = false;
      this.mapObjectService.removeObject(this.objectMetadataPolyline);
      this.objectMetadataPolyline = null;
      this.mapObjectService.removeObject(this.objectMetadataStart);
      this.objectMetadataStart = null;
      this.mapObjectService.removeObject(this.objectMetadataFinish);
      this.objectMetadataFinish = null;
      this.event = null;
      this.accuracy = null;
      this.stoppedBeforeIsNavigationReady = false;
    } else {
      this.stoppedBeforeIsNavigationReady = true;
    }
  }

  private handlePathUpdate(pointUpdate: Point): void {
    const currentPointOnPath = Geometry.findPointOnPathInGivenRange(this.objectMetadataPolyline.object['lines'], pointUpdate, this.accuracy);
    if (!!currentPointOnPath) {
      if (this.isDestinationAchieved(currentPointOnPath)) {
        this.stopNavigation();
        return;
      }

      this.lines = this.objectMetadataPolyline.object['lines'];
      const findLineIndex = this.objectMetadataPolyline.object['lines'].findIndex(line => Geometry.isPointOnLineBetweenTwoPoints(line, currentPointOnPath));
      if (findLineIndex === -1) {
        return;
      }

      this.lines = this.lines.slice(findLineIndex);
      this.lines[0].startPoint = currentPointOnPath;

      this.objectMetadataPolyline.object['points'] = this.createPointPathFromLinePath(this.scale, this.lines);
      this.objectMetadataPolyline.object['lines'] = this.lines;
      const startPointCirclePosition: Point = this.objectMetadataPolyline.object['points'][0];
      const finishPointCirclePosition: Point = this.objectMetadataPolyline.object['points'][this.objectMetadataPolyline.object['points'].length - 1];
      this.objectMetadataStart.object['position'] = Object.assign((<Circle>this.objectMetadataStart.object), startPointCirclePosition);
      this.objectMetadataFinish.object['position'] = Object.assign((<Circle>this.objectMetadataFinish.object), finishPointCirclePosition);
      this.redrawPath();
    }
  }

  private isDestinationAchieved(pointOnPath: Point): boolean {
    const range = 0;
    const pulledDestination: Point = Geometry.findPointOnPathInGivenRange(this.objectMetadataPolyline.object['lines'], this.destination);
    return (pointOnPath.x >= (pulledDestination.x - range) &&
      pointOnPath.x <= (pulledDestination.x + range) &&
      pointOnPath.y >= (pulledDestination.y - range) &&
      pointOnPath.y <= (pulledDestination.y + range));
  }

  private calculateNavigationPath(lines: Line[], location: Point, destination: Point): void {
    const path: Line[] = this.navigationService.calculateDijkstraShortestPath(lines, location, destination);
    if (path.length === 0) {
      this.isNavigationReady = false;
      this.event.source.postMessage({type: 'navigation', action: 'error'},  '*');
      this.stopNavigation();
    } else {
      this.event.source.postMessage({type: 'navigation', action: 'created'},  '*');
      path.reverse();
      this.setNavigationMetadata(path);
      this.redrawPath();
      this.isNavigationReady = true;
    }
  }

  private createPointPathFromLinePath(scale: Scale, path: Line[]): Point[] {
    return path.reduce((points, point) => {
      points.push(Geometry.calculatePointPositionInCentimeters(scale.getDistanceInPixels(), scale.getRealDistanceInCentimeters(), point.startPoint));
      points.push(Geometry.calculatePointPositionInCentimeters(scale.getDistanceInPixels(), scale.getRealDistanceInCentimeters(), point.endPoint));
      return points;
    }, []);
  }

  private redrawPath(): void {
    if (!!this.objectMetadataPolyline && this.objectMetadataStart && this.objectMetadataFinish) {
      this.mapObjectService.draw(this.objectMetadataPolyline, this.scale, this.event, this.container);
      this.mapObjectService.draw(this.objectMetadataStart, this.scale, this.event, this.container);
      this.mapObjectService.draw(this.objectMetadataFinish, this.scale, this.event, this.container);
    }
  }

  private setNavigationMetadata(path: Line[]): void {
    this.objectMetadataPolyline = {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: 'POLYLINE'
    };
    this.objectMetadataStart = {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: 'CIRCLE'
    };
    this.objectMetadataFinish = {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: 'CIRCLE'
    };
    this.objectMetadataPolyline.object['points'] = this.createPointPathFromLinePath(this.scale, path);
    this.objectMetadataPolyline.object = Object.assign((<Path>this.objectMetadataPolyline.object), {lines: path, color: '#0000ff', lineType: 'dotted'});
    const startPointCirclePosition: Point = this.objectMetadataPolyline.object['points'][0];
    const finishPointCirclePosition: Point = this.objectMetadataPolyline.object['points'][this.objectMetadataPolyline.object['points'].length - 1];
    const startPointCircleFeatures: Object = {radius: 10, border: {width: 2, color: '#00ff00'}, opacity: 1, color: '#00ff00'};
    const finishPointCircleFeatures: Object = {radius: 15, border: {width: 2, color: '#ff0000'}, opacity: 1, color: '#ff0000'};
    this.objectMetadataStart.object['position'] = Object.assign((<Circle>this.objectMetadataStart.object), startPointCirclePosition);
    this.objectMetadataStart.object = Object.assign((<Circle>this.objectMetadataStart.object), startPointCircleFeatures);
    this.objectMetadataFinish.object['position'] = Object.assign((<Circle>this.objectMetadataFinish.object), finishPointCircleFeatures);
    this.objectMetadataFinish.object = Object.assign((<Circle>this.objectMetadataFinish.object), finishPointCirclePosition);
  }

}
