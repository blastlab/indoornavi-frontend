import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as P5 from 'p5';
import {MapService} from '../../../map-editor/uploader/map.uploader.service';
import {TagP5} from '../../../map/models/tagP5';
import {CommandType, Coordinates, CoordinatesSocketData, MeasureSocketData} from '../../publication.type';
import {FloorService} from '../../../floor/floor.service';
import {Floor} from '../../../floor/floor.type';
import {ActivatedRoute, Params} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {Config} from '../../../../config';
import {Tag} from '../../../device/device.type';
import {PublishedService} from '../../publication.service';
import {Point} from '../../../map-editor/map.type';
import {Geometry} from '../../../shared/utils/helper/geometry';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {Background, Zoom} from './map-viewer.type';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  selector: 'app-map-viewer',
  templateUrl: 'map-viewer.html'
})
export class MapViewerComponent implements OnInit, OnDestroy {
  private static CANVAS_ID = 'map-viewer';
  private static CONTAINER_ID = 'sketch';
  private static DEFAULT_DELTA_VALUE = 125;

  private p5: P5;
  private tagsOnMap: Map<number, TagP5> = new Map();
  private coordinatesToDraw: Coordinates[] = [];
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private floor: Floor;
  private scale: Scale;
  private tags: Tag[] = [];

  private zoom: Zoom = {
    value: 1,
    sensitivity: 0.0005,
    min: 0.5,
    max: 2.0
  };

  private background: Background = {
    image: null,
    currentPosition: {x: 0, y: 0},
    startingPosition: {x: 0, y: 0}
  };

  private mousePressedPosition = null;

  @ViewChild('sketch') container: ElementRef;

  constructor(private mapService: MapService,
              private floorService: FloorService,
              private route: ActivatedRoute,
              private socketService: SocketService,
              private publishedService: PublishedService,
              private translateService: TranslateService,
              private breadcrumbService: BreadcrumbService) {
  };

  ngOnDestroy(): void {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor.unsubscribe();
    this.p5.remove();
  }

  ngOnInit(): void {
    this.loadSketch().takeUntil(this.subscriptionDestructor).subscribe(() => {
      this.connectToMeasuresWebsocket();
      this.setBreadcrumbs();
    });
    this.translateService.setDefaultLang('en');
  }

  private loadSketch(): Subject<void> {
    const loaded = new Subject<void>();
    this.route.params.takeUntil(this.subscriptionDestructor).subscribe((params: Params): void => {
      const floorId = +params['id'];
      this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor) => {
        this.floor = floor;
        this.scale = new Scale(this.floor.scale);
        this.publishedService.getTagsAvailableForUser(floor.id).takeUntil(this.subscriptionDestructor).subscribe((tags: Tag[]): void => {
          this.tags = tags;
          this.mapService.getImage(floor.imageId).takeUntil(this.subscriptionDestructor).subscribe((blob: Blob) => {
            const sketch = (p: P5) => {
              p.preload = () => {
                this.background.image = p.loadImage(window.URL.createObjectURL(blob));
              };

              p.setup = () => {
                this.onSetup();
              };

              p.draw = () => {
                this.onDraw();
              };

              p.mouseWheel = (event: WheelEvent) => {
                this.onMouseWheel(event);
                return false;
              };

              p.mouseDragged = (event: MouseEvent) => {
                this.onMouseDragged(event);
                return false;
              };

              p.mousePressed = (event: MouseEvent) => {
                this.onMousePressed(event);
                return false;
              };

              p.mouseReleased = () => {
                this.onMouseReleased();
                return false;
              }
            };

            this.p5 = new P5(sketch);
            loaded.next();
          });
        });
      });
    });

    return loaded;
  }

  private connectToMeasuresWebsocket(): void {
    const stream = this.socketService.connect(`${Config.CALCULATOR_URL}measures?${Config.WS_KEY_FRONTEND}`);
    this.setSocketConfiguration();
    stream.takeUntil(this.subscriptionDestructor).subscribe((data: MeasureSocketData) => {
      (<CoordinatesSocketData>data).coordinates.forEach((coordinate: Coordinates) => {
        const coordinateSocketData: Coordinates = (<Coordinates>coordinate);
        const point2d: Point = Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          this.scale.getRealDistanceInCentimeters(),
          {x: coordinateSocketData.x, y: coordinateSocketData.y});
        coordinateSocketData.x = point2d.x;
        coordinateSocketData.y = point2d.y;
        this.coordinatesToDraw.push(coordinateSocketData);
      });
    });
  }

  private setSocketConfiguration(): void {
    this.socketService.send({type: CommandType[CommandType.SET_FLOOR], args: `${this.floor.id}`});
    this.socketService.send({type: CommandType[CommandType.SET_TAGS], args: `[${this.extractTagsShortIds()}]`});
  }

  private extractTagsShortIds(): number[] {
    return this.tags.map((tag: Tag): number => {
      return tag.shortId;
    });
  }

  private setBackgroundImageInCenter(): void {
    const workspace = this.container.nativeElement.getClientRects()[0];
    while (this.background.image.height * this.zoom.value > workspace.height) {
      this.setZoom(MapViewerComponent.DEFAULT_DELTA_VALUE);
    }
    this.background.currentPosition = {
      x: Math.abs(workspace.width / 2 - (this.background.image.width / 2 * this.zoom.value)) / this.zoom.value,
      y: Math.abs(workspace.height / 2 - (this.background.image.height / 2 * this.zoom.value)) / this.zoom.value
    };
    this.background.startingPosition = {x: this.background.currentPosition.x * this.zoom.value, y: this.background.currentPosition.y * this.zoom.value};
  }

  private setZoom(value: number): void {
    this.zoom.value -= this.zoom.sensitivity * value;
    this.zoom.value = this.p5.constrain(this.zoom.value, this.zoom.min, this.zoom.max);
  }

  private isMouseOutsideWorkspace(event: MouseEvent): boolean {
    const workspace = this.container.nativeElement.getClientRects()[0];
    return event.clientX < workspace.left ||
      event.clientY < workspace.top ||
      event.clientX > workspace.right ||
      event.clientY > workspace.bottom;
  }

  private onMouseWheel(event: WheelEvent): void {
    if (this.mousePressedPosition) {
      return;
    }
    this.setZoom(event['delta']);
    if (this.zoom.value > this.zoom.min && this.zoom.value < 1) {
      this.background.currentPosition.x = this.background.currentPosition.x * this.zoom.value;
      this.background.currentPosition.y = this.background.currentPosition.y * this.zoom.value;
    }
    this.background.startingPosition = {x: this.background.currentPosition.x, y: this.background.currentPosition.y};
  }

  private onMouseDragged(event: MouseEvent): void {
    if (this.mousePressedPosition) {
      if (this.isMouseOutsideWorkspace(event)) {
        return;
      }

      this.background.currentPosition.x = (this.background.startingPosition.x + event.offsetX - this.mousePressedPosition.x) / this.zoom.value;
      this.background.currentPosition.y = (this.background.startingPosition.y + event.offsetY - this.mousePressedPosition.y) / this.zoom.value;
    }
  }

  private onMousePressed(event: MouseEvent): void {
    if (event.target instanceof Element && (event.target as Element).id === MapViewerComponent.CANVAS_ID) {
      this.mousePressedPosition = {x: event.offsetX, y: event.offsetY};
      this.tagsOnMap.clear();
    }
  }

  private onMouseReleased(): void {
    this.mousePressedPosition = null;
    this.background.startingPosition = {x: this.background.currentPosition.x * this.zoom.value, y: this.background.currentPosition.y * this.zoom.value};
  }

  private onDraw(): void {
    this.p5.scale(this.zoom.value);
    this.p5.background(225, 225, 225);
    this.p5.image(this.background.image, this.background.currentPosition.x, this.background.currentPosition.y);

    if (this.mousePressedPosition) {
      return;
    }

    this.tagsOnMap.forEach((tag, shortId) => {
      if (!tag.updatePosition().draw()) {
        this.tagsOnMap.delete(shortId);
      }
    });
    this.coordinatesToDraw.forEach(coordinates => {
      coordinates.x += this.background.currentPosition.x;
      coordinates.y += this.background.currentPosition.y;
      if (this.tagsOnMap.has(coordinates.tagId)) {
        this.tagsOnMap.get(coordinates.tagId).setDestination(coordinates.x, coordinates.y);
      } else {
        this.tagsOnMap.set(coordinates.tagId, new TagP5(this.p5, coordinates.x, coordinates.y, coordinates.tagId));
      }
    });
    this.coordinatesToDraw.length = 0;
  }

  private onSetup(): void {
    this.p5.createCanvas(this.background.image.width, this.background.image.height)
      .parent(MapViewerComponent.CONTAINER_ID)
      .id(MapViewerComponent.CANVAS_ID);
    this.p5.frameRate(15);
    this.setBackgroundImageInCenter();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.publishIsReady([
      {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
      {
        label: this.floor.building.complex.name,
        routerLink: `/complexes/${this.floor.building.complex.id}/buildings`,
        routerLinkActiveOptions: {exact: true}
      },
      {
        label: this.floor.building.name,
        routerLink: `/complexes/${this.floor.building.complex.id}/buildings/${this.floor.building.id}/floors`,
        routerLinkActiveOptions: {exact: true}
      },
      {label: `${(this.floor.name.length ? this.floor.name : this.floor.level)}`, disabled: true}
    ]);
  }
}
