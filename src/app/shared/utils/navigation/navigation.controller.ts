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
import {CommandType} from '../../../map-viewer/publication.type';

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
  private disableStartPoint: boolean = false;
  private disableEndPoint: boolean = false;

  private startPointObject: Object = {radius: 10, border: {width: 2, color: '#007FFF '}, opacity: 1, color: '#007FFF '};
  private endPointObject: Object = {radius: 10, border: {width: 2, color: '#007FFF '}, opacity: 1, color: '#007FFF '};
  private pathColor: string = '#007FFF';

  constructor(
    private pathService: PathService,
    private mapObjectService: ApiService,
    private navigationService: NavigationService,
  ) {
  }

  handleNavigation(event: MessageEvent, floorId, container, scale) {
    const args: NavigationData = event.data.args.object;
    console.log(args);
    switch (args.action) {
      case 'stop':
        this.stopNavigation();
        break;
      case 'update':
        if (this.isNavigationReady) {
          this.updatePosition(args.position);
        } else {
          this.setLastCoordinates(args.position);
        }
        break;
      case 'start':
        this.setNavigationPath(floorId, args.location, args.destination, args.accuracy, event, container, scale);
        break;
      case 'disableStart':
        this.disableStartPoint = args.state;
        break;
      case 'disableEnd':
        this.disableEndPoint = args.state;
        break;
      case 'startPoint':
        this.startPointObject = args.navigationPoint;
        break;
      case 'endPoint':
        this.endPointObject = args.navigationPoint;
        break;
      case 'setPathColor':
        this.pathColor = args.pathColor;
        break;
    }

  }

  private generateId(): Object {
    return {
      id: Math.round(new Date().getTime() * Math.random() * 1000)
    }
  }


  private setLastCoordinates(coordinates: Point): void {
    this.lastCoordinates = coordinates;
  }

  private setNavigationPath(floorId: number, location: Point, destination: Point, accuracy: number, event: MessageEvent, container: d3.selection, scale: Scale) {
    this.container = container;
    this.destination = destination;
    this.accuracy = (accuracy && accuracy > 0) ? accuracy : Infinity;
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
      if (!this.disableStartPoint) {
        this.objectMetadataStart.object['position'] = Object.assign((<Circle>this.objectMetadataStart.object), startPointCirclePosition);
      }
      if (!this.disableEndPoint) {
        this.objectMetadataFinish.object['position'] = Object.assign((<Circle>this.objectMetadataFinish.object), finishPointCirclePosition);
      }
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
      points.push(Geometry.calculatePointPositionInCentimeters(scale.getLenInPix(), scale.getRealDistanceInCentimeters(), point.startPoint));
      points.push(Geometry.calculatePointPositionInCentimeters(scale.getLenInPix(), scale.getRealDistanceInCentimeters(), point.endPoint));
      return points;
    }, []);
  }

  private redrawPath(): void {
    if (!!this.objectMetadataPolyline) {
      this.mapObjectService.draw(this.objectMetadataPolyline, this.scale, this.event, this.container);
      if (!this.disableStartPoint && this.objectMetadataStart) {
        this.mapObjectService.draw(this.objectMetadataStart, this.scale, this.event, this.container);
      }
      if (!this.disableEndPoint && this.objectMetadataFinish) {
        this.mapObjectService.draw(this.objectMetadataFinish, this.scale, this.event, this.container);
      }
    }
  }

  private assignId(type: string): Metadata {
    return {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: type
    };
  }


  private setNavigationMetadata(path: Line[]): void {
    this.objectMetadataPolyline = this.assignId('POLYLINE');
    this.objectMetadataPolyline.object['points'] = this.createPointPathFromLinePath(this.scale, path);
    this.objectMetadataPolyline.object = Object.assign((<Path>this.objectMetadataPolyline.object), {lines: path, color: this.pathColor, lineType: 'dotted'});

    if (!this.disableStartPoint) {
      this.objectMetadataStart = this.assignId('CIRCLE');
      this.objectMetadataStart.object['position'] = Object.assign((<Circle>this.objectMetadataStart.object), this.objectMetadataPolyline.object['points'][0]);
      this.objectMetadataStart.object = Object.assign((<Circle>this.objectMetadataStart.object), this.startPointObject);
    }

    if (!this.disableEndPoint) {
      this.objectMetadataFinish = this.assignId('CIRCLE');
      this.objectMetadataFinish.object['position'] = Object.assign((<Circle>this.objectMetadataFinish.object), this.objectMetadataPolyline.object['points'][this.objectMetadataPolyline.object['points'].length - 1]);
      this.objectMetadataFinish.object = Object.assign((<Circle>this.objectMetadataFinish.object), this.endPointObject);
    }

  }
}
