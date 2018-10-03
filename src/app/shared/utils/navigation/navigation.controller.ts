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
    console.log(event);
    const args: NavigationData = event.data.args.object;
    if (this.isNavigationReady) {
      if (args.action === 'update') {
        console.log('update');
        this.updatePosition(args.position);
      }
      if (args.action === 'stop') {
        console.log('removing navigation');
        this.stopNavigation();
      }
    } else if (args.action === 'start') {
      this.setNavigationPath(floorId, args.location, args.destination, args.accuracy, event, container, scale);
      console.log('creating navigation');
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
    this.objectMetadata = null;
    this.event = null;
  }

  private handlePathUpdate(pointUpdate: Point): void {
    if (this.lastCoordinates) {
      this.updatePath(this.lastCoordinates);
      this.lastCoordinates = null;
    }
    this.updatePath(pointUpdate);

    if (this.objectMetadata === null) {
      return;
    }

    const currentPointOnPath = Geometry.findPointOnPathInGivenRange(this.objectMetadata.object['lines'], pointUpdate);
    this.lines = this.objectMetadata.object['lines'];

    const findLineIndex = this.objectMetadata.object['lines'].findIndex(line => Geometry.isPointOnLineBetweenTwoPoints(line, currentPointOnPath));
    if (findLineIndex === -1) {
      return;
    }

    this.lines = this.lines.slice(findLineIndex);
    this.lines[0].startPoint = currentPointOnPath;

    const points = this.lines.reduce((prev, next) => {
      prev.push(next.startPoint);
      prev.push(next.endPoint);
      return prev;
    }, []);

    this.objectMetadata.object['points'] = points;
    this.redrawPath();
  }

  private updatePath(point: Point): void {
    const pointOnPath: Point = point;
    if (this.destination.x === pointOnPath.x && this.destination.y === pointOnPath.y) {
      this.stopNavigation();
      return;
    }
  }

  private calculateNavigationPath(lines: Line[], location: Point, destination: Point, accuracy: number): void {
    // this.pathCalculated = NavigationService.calculateDijkstraShortestPath(lines, location, destination);
    this.objectMetadata = {
      object: {
        id: 123123123123,
      },
      type: 'POLYLINE'
    };
    this.objectMetadata.object = Object.assign((<Path>this.objectMetadata.object), {lines: lines, color: '#906090'});
    // console.log(this.objectMetadata.object);
  }

  private redrawPath(): void {
    if (!!this.objectMetadata) {
      this.mapObjectService.draw(this.objectMetadata, this.scale, this.event, this.container, 'dotted');
    }
  }

}
