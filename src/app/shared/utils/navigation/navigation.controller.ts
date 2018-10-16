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
    this.scale = scale;
    if (!this.subscriptionDestructor) {
      this.subscriptionDestructor = new Subject<void>();
    }
    if (this.isNavigationReady) {
      this.event.source.postMessage({type: 'navigation', action: 'working'}, this.event.origin);
      return;
    }
    this.event = event;
    this.pathService.getPathByFloorId(floorId).takeUntil(this.subscriptionDestructor).subscribe((lines: Line[]): void => {
      this.calculateNavigationPath(lines, location, destination, accuracy);
      this.isNavigationReady = true;

      this.onPositionChanged().takeUntil(this.subscriptionDestructor).subscribe((pointUpdate: Point): void => {
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
      this.event.source.postMessage({type: 'navigation', action: 'finished'}, this.event.origin);
    }
    if (this.isNavigationReady) {
      this.isNavigationReady = false;
      this.mapObjectService.removeObject(this.objectMetadata);
      this.subscriptionDestructor.next();
      this.subscriptionDestructor = null;
      this.objectMetadata = null;
      this.event = null;
      this.stoppedBeforeIsNavigationReady = false;
    } else {
      this.stoppedBeforeIsNavigationReady = true;
    }
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

    this.objectMetadata.object['points'] = this.createPointPathFromLinePath(this.scale, this.lines);
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
    const path: Line[] = this.navigationService.calculateDijkstraShortestPath(lines, location, destination);
    path.reverse();
    this.objectMetadata = {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: 'POLYLINE'
    };

    this.objectMetadata.object['points'] = this.createPointPathFromLinePath(this.scale, path);

    this.objectMetadata.object = Object.assign((<Path>this.objectMetadata.object), {lines: path, color: '#906090', lineType: 'dotted'});
    this.redrawPath();
    this.isNavigationReady = true;
  }

  private createPointPathFromLinePath(scale: Scale, path: Line[]): Point[] {
    return path.reduce((points, point) => {
      points.push(Geometry.calculatePointInCentimeters(scale, point.startPoint));
      points.push(Geometry.calculatePointInCentimeters(scale, point.endPoint));
      return points;
    }, []);
  }

  private redrawPath(): void {
    if (!!this.objectMetadata) {
      this.mapObjectService.draw(this.objectMetadata, this.scale, this.event, this.container);
    }
  }

}
