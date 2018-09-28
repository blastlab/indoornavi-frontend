import {Line, Point} from '../../../map-editor/map.type';
import {Subject} from 'rxjs/Subject';
import {PathService} from '../../../map-viewer/services/path/path.service';
import {Injectable} from '@angular/core';

@Injectable()
export class PathDisplayService {

  isNavigationReady = false;
  private navigationPositionUpdate: Subject<Point> = new Subject();
  private subscriptionDestructor: Subject<Point> = new Subject();
  private destination: Point;
  private lastCoordinates: Point;
  private navigationPath: Line[];
  private event: MessageEvent;


  constructor(
    private pathService: PathService
  ) {}

  setLastCoordinates(coordinates: Point): void {
    this.lastCoordinates = coordinates;
  }

  setNavigationPath(floorId: number, location: Point, destination: Point, accuracy: number, event: MessageEvent) {
    this.destination = destination;
    if (this.isNavigationReady) {
      this.event.source.postMessage({type: 'navigation', action: 'working'}, this.event.origin);
      return;
    }
    this.event = event;
    this.pathService.getPathByFloorId(floorId).takeUntil(this.subscriptionDestructor).subscribe((lines: Line[]): void => {
      this.calculateNavigationPath(lines, location, destination, accuracy);

      // all calc and drawn
      this.onPositionChanged().takeUntil(this.subscriptionDestructor).subscribe((pointUpdate: Point): void => {
        this.handlePathUpdate(pointUpdate);
      });
      this.isNavigationReady = true;
    });
  }

  updatePosition(position: Point): void {
    this.navigationPositionUpdate.next(position);
  }

  stopNavigation() {
    // clear path display
    this.isNavigationReady = false;
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    if (!!this.event) {
      this.event.source.postMessage({type: 'navigation', action: 'finished'}, this.event.origin);
    }
    this.event = null;
  }

  private onPositionChanged(): Subject<Point> {
    return this.navigationPositionUpdate;
  }

  private handlePathUpdate(pointUpdate: Point): void {
    if (this.lastCoordinates) {
      this.updatePaht(this.lastCoordinates);
      this.lastCoordinates = null;
    }
    this.updatePaht(pointUpdate);
    console.log(this.navigationPath);
    console.log(pointUpdate);
  }

  private updatePaht(point: Point): void {
    const pointOnPath: Point = null; // actualization from pull to path
    if (this.destination.x === pointOnPath.x && this.destination.y === pointOnPath.y) {
      this.stopNavigation();
      return;
    }
    // update
  }

  private calculateNavigationPath(lines: Line[], location: Point, destination: Point, accuracy: number): void {
    this.navigationPath = [];
  }

}
