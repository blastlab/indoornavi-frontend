import {Line, Point} from '../../../map-editor/map.type';
import {PathService} from '../../../map-viewer/services/path/path.service';
import {Injectable} from '@angular/core';
import {ApiService} from '../drawing/api.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {APIObject} from '../drawing/api.types';
import * as d3 from 'd3';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import Metadata = APIObject.Metadata;
import Path = APIObject.Path;
import NavigationData = APIObject.NavigationData;
import {NavigationService} from './navigation.service';
import {Geometry} from '../helper/geometry';

@Injectable()
export class NavigationController {

  isNavigationReady = false;
  private container: d3.container;
  private scale: Scale;
  private destination: Point;
  private lastCoordinates: Point;
  private event: MessageEvent;
  private objectMetadata: Metadata;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private positionChanged: Subject<Point> = new Subject<Point>();
  private lines: Line[];

  constructor(
    private pathService: PathService,
    private mapObjectService: ApiService
  ) {}

  handleNavigation(event: MessageEvent, floorId, container, scale) {
    const args: NavigationData = event.data.args.object;
    if (this.isNavigationReady) {
      if (args.action === 'update') {
        this.updatePosition(args.position);
      }
      if (args.action === 'stop') {
        this.stopNavigation();
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
    this.scale = scale;

    if (this.isNavigationReady) {
      this.event.source.postMessage({type: 'navigation', action: 'working'}, this.event.origin);
      return;
    }
    this.event = event;
    this.pathService.getPathByFloorId(floorId).takeUntil(this.subscriptionDestructor).subscribe((lines: Line[]): void => {
      this.calculateNavigationPath(lines, location, destination, accuracy);

      this.onPositionChanged().takeUntil(this.subscriptionDestructor).subscribe((pointUpdate: Point): void => {
        this.handlePathUpdate(pointUpdate);
      });
      this.isNavigationReady = true;

      if (this.lastCoordinates) {
        this.updatePosition(this.lastCoordinates);
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
      this.event.source.postMessage({type: 'navigation', action: 'finished'}, this.event.origin);
    }
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    this.mapObjectService.removeObject(this.objectMetadata);
    this.objectMetadata = null;
    this.event = null;
  }

  private handlePathUpdate(pointUpdate: Point): void {
    const currentPointOnPath = Geometry.findPointOnPathInGivenRange(this.objectMetadata.object['lines'], pointUpdate);
    if (this.isDestinationAchieved(currentPointOnPath)) {
      this.stopNavigation();
      return;
    }

    this.lines = this.objectMetadata.object['lines'];

    const findLineIndex = this.objectMetadata.object['lines'].findIndex(line => Geometry.isPointOnLineBetweenTwoPoints(line, currentPointOnPath));
    if (findLineIndex === -1) {
      return;
    }

    this.lines = this.lines.slice(findLineIndex);
    this.lines[0].startPoint = currentPointOnPath;

    const points = this.createPointPathFromLinePath(this.scale, this.lines);
    this.objectMetadata.object['points'] = points;
    this.redrawPath();
  }

  private isDestinationAchieved(pointOnPath: Point): boolean {
    const range = 0;
    const pulledDestination: Point = Geometry.findPointOnPathInGivenRange(this.objectMetadata.object['lines'], this.destination);
    return (pointOnPath.x >= (pulledDestination.x - range) &&
      pointOnPath.x <= (pulledDestination.x + range) &&
      pointOnPath.y >= (pulledDestination.y - range) &&
      pointOnPath.y <= (pulledDestination.y + range));
  }

  private calculateNavigationPath(lines: Line[], location: Point, destination: Point, accuracy: number): void {
    const path: Line[] = NavigationService.calculateDijkstraShortestPath(lines, location, destination);
    path.reverse();
    this.objectMetadata = {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: 'POLYLINE'
    };

    const points = this.createPointPathFromLinePath(this.scale, path);

    this.objectMetadata.object['points'] = points;

    this.objectMetadata.object = Object.assign((<Path>this.objectMetadata.object), {lines: path, color: '#906090', typeLine: 'dotted'});
    this.redrawPath();
  }

  private calculatePointInCentimeters(scale: Scale, point: Point): Point {
    return Geometry.calculatePointPositionInCentimeters(scale.getLenInPix(), scale.getRealDistanceInCentimeters(), point);
  }

  private createPointPathFromLinePath(scale: Scale, path: Line[]): Point[] {
    return path.reduce((points, point) => {
      points.push(this.calculatePointInCentimeters(scale, point.startPoint));
      points.push(this.calculatePointInCentimeters(scale, point.endPoint));
      return points;
    }, []);
  }

  private redrawPath(): void {
    if (!!this.objectMetadata) {
      this.mapObjectService.draw(this.objectMetadata, this.scale, this.event, this.container);
    }
  }

}
