import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {Floor} from '../../../../floor/floor.type';
import {MapSvg} from '../../../../map/map.type';
import {Scale, ScaleCalculations, ScaleDto} from '../scale/scale.type';
import {Geometry} from '../../../../shared/utils/helper/geometry';
import {ZoomService} from '../../../../shared/services/zoom/zoom.service';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {ToolbarService} from '../../toolbar.service';
import {ContextMenuService} from '../../../../shared/wrappers/editable/editable.service';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {ScaleService} from '../../../../shared/services/scale/scale.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {Subject} from 'rxjs/Subject';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import * as d3 from 'd3';
import {Box, DrawBuilder, ElementType, SvgGroupWrapper} from '../../../../shared/utils/drawing/drawing.builder';
import {Line, Point} from '../../../map.type';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from '../../../action-bar/actionbar.type';
import {IntersectionIdentifier, PathContextCallback, PathContextMenuLabels} from './path.type';
import {MapEditorInput} from '../../shared/tool-input/map-editor-input';

@Component({
  selector: 'app-path',
  templateUrl: './path.html'
})
export class PathComponent extends MapEditorInput implements Tool, OnInit, OnDestroy {
  private static CIRCLE_R: number = 5;
  private static HOVER_COLOR: string = '#FF0000';
  private static STANDARD_COLOR: string = '#000000';

  @Input() floor: Floor;

  active: boolean = false;
  disabled: boolean = true;

  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private lines: Line[] = [];
  private scale: Scale;
  private container: d3.selection;
  private layer: d3.selection;
  private scaleCalculations: ScaleCalculations;
  private currentLineGroup: SvgGroupWrapper;
  private firstPointSelection: d3.selection;
  private tempLine: d3.selection;
  private firstPoint: Point;
  private lastPoint: Point;
  private attractionPoint: Point;
  private callbacks: PathContextCallback;
  private labels: PathContextMenuLabels = {
    removeAll: '',
  };
  private containerBox: Box;

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService,
              private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.listenOnMapLoaded();
    this.listenOnScaleChange();
    this.fetchPathFromConfiguration();
    this.setTranslationsDependencies();
    this.setContextMenuCallbacks();
    this.listenOnConfigurationReset();
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  confirm() {
    this.toggleActivity();
  }

  reject() {
    this.toggleActivity();
  }

  toggleActivity(): void {
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      this.toggleActivity();
    }
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  getHintMessage(): string {
    return 'path.hint.first';
  }

  getToolName(): ToolName {
    return ToolName.PATH;
  }

  setActive(): void {
    this.currentLineGroup = this.createBuilder().createGroup();
    this.drawLinesFromConfiguration();

    this.active = true;

    this.container.style('cursor', 'crosshair');

    this.layer.on('click', (_, i: number, nodes: d3.selection[]): void => {
      const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
      const coordinatesInRange: boolean = Geometry.areCoordinatesInGivenRange(coordinates, this.containerBox);
      if (coordinatesInRange) {
        this.draw(coordinates);
      }
    });

    this.layer.on('mousemove', (_, i: number, nodes: d3.selection[]): void => {
      if (!!this.firstPointSelection) {
        const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
        if (!!this.tempLine) {
          this.moveTempLine(coordinates);
        } else {
          this.drawTempLine();
        }
      }
    });

    this.container.on('contextmenu', (): void => {
      d3.event.preventDefault();
      this.contextMenuService.setItems([
        {
          label: 'Remove all lines',
          command: this.callbacks.removeAll
        }
      ]);
      this.contextMenuService.openContextMenu();
    });
  }

  setInactive(): void {
    this.active = false;
    this.container.style('cursor', 'move');
    this.layer.on('click', null);
    this.layer.on('mousemove', null);
    this.container.on('contextmenu', null);
    this.firstPointSelection = null;
    this.lastPoint = null;
    if (!!this.tempLine) {
      this.cleanTempLine();
    }
    this.clearDrawnPath();
    this.currentLineGroup.removeElements(ElementType.CIRCLE);
  }

  private listenOnMapLoaded(): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;
      this.containerBox = mapSvg.container.node().getBBox();
    });
  }

  private listenOnScaleChange(): void {
    this.scaleService.scaleChanged.takeUntil(this.subscriptionDestroyer).subscribe((scale: ScaleDto) => {
      this.scale = new Scale(scale);
      if (this.scale.isReady()) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    });
  }

  private listenOnConfigurationReset(): void {
    this.actionBarService.configurationReset().takeUntil(this.subscriptionDestroyer).subscribe((configuration: Configuration) => {
      this.toolbarService.emitToolChanged(null);
      this.lines = [];
      configuration.data.paths.forEach((line: Line) => {
        this.lines.push(line);
      });
    });
  }

  private fetchPathFromConfiguration(): void {
    this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration): void => {
      if (!!configuration.data.paths) {
        configuration.data.paths.forEach((line: Line) => {
          this.lines.push(line);
        });
      }
    });
  }

  private setTranslationsDependencies(): void {
    this.translateService.setDefaultLang('en');
    this.translateService
      .get('path.contextMenu.removeAllLines')
      .subscribe((translatedValue: string): void => {
        this.labels.removeAll = translatedValue;
      });
  }

  private setContextMenuCallbacks(): void {
    this.callbacks = {
      removeAll: () => {
        this.clearDrawnPath(true);
        this.lines = [];
        this.actionBarService.clearPath();
        this.hintBarService.sendHintMessage('path.hint.first');
      }
    }
  }

  private drawLinesFromConfiguration(): void {
    this.lines.forEach((line: Line): void => {
      this.lastPoint = line.startPoint;
      this.drawPoint(this.lastPoint);
      this.drawPoint(line.endPoint);
      this.drawLine(line.endPoint);
    });
  }

  private sendPathToConfiguration(): void {
    this.actionBarService.addPath(this.lines);
  }

  private clearDrawnPath(createNew: boolean = false): void {
    this.currentLineGroup.getGroup().remove();
    this.firstPointSelection = null;
    this.lastPoint = null;
    if (!!this.tempLine) {
      this.tempLine.remove();
      this.tempLine = null;
    }
    if (createNew) {
      this.currentLineGroup = this.createBuilder().createGroup();
    }
  }

  private createBuilder(index?: number): DrawBuilder {
    return new DrawBuilder(this.container, {
      id: `path`,
      clazz: `path`
    });
  }

  private drawPoint(point: Point): d3.selection {
    const pointSelection: d3.selection = this.currentLineGroup
      .addCircle(point, PathComponent.CIRCLE_R)
      .getLastElement(ElementType.CIRCLE);

    pointSelection
      .on('mouseover', (): void => {
        this.attractionPoint = {
          x: Math.floor(pointSelection.attr('cx')),
          y: Math.floor(pointSelection.attr('cy'))
        };
        pointSelection.style('fill', PathComponent.HOVER_COLOR);
      })
      .on('mouseout', (): void => {
        this.attractionPoint = null;
        pointSelection.style('fill', PathComponent.STANDARD_COLOR);
      });
    return pointSelection;
  }

  private drawLine(point: Point): void {
    this.currentLineGroup
      .addLine(this.lastPoint, point)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none');
  }

  private drawTempLine(): void {
    this.tempLine = this.currentLineGroup
      .addLine(this.lastPoint, this.lastPoint)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none')
      .attr('stroke-dasharray', '5,5')
      .classed('tempLine', true);
  }

  private moveTempLine(coordinates: Point): void {
    const event: KeyboardEvent = <KeyboardEvent>window.event;
    if (event.shiftKey && this.getCurrentLinePoints().length > 0) {
      const endPoint: Point = this.handleShiftKeyEvent(coordinates);
      this.tempLine.attr('x2', endPoint.x).attr('y2', endPoint.y);
    }
    this.tempLine.attr('x2', coordinates.x).attr('y2', coordinates.y);
  }

  private getCurrentLinePoints(line?: Line): Point[] {
    let points: Point[];
    const circles: d3.selection[] = this.currentLineGroup.getElements(ElementType.CIRCLE);
    if (!line && !!circles) {
      points = circles.map((point: d3.selection) => {
        return (<Point>{
          x: Math.round(parseFloat(point.attr('cx'))),
          y: Math.round(parseFloat(point.attr('cy')))
        });
      });
    } else {
      points = [line.startPoint, line.endPoint];
    }
    return points;
  }

  private handleShiftKeyEvent(coordinates: Point): Point {
    const secondPoint: Point = this.getCurrentLinePoints()[this.getCurrentLinePoints().length - 1];
    const deltaY = Geometry.getDeltaY(coordinates, secondPoint);
    const coordinatesBackup = Object.assign({}, coordinates);
    if (!!deltaY) {
      coordinates.y = secondPoint.y - deltaY;
    } else {
      coordinates.x = secondPoint.x;
    }
    coordinates.x = Math.floor(coordinates.x);
    coordinates.y = Math.floor(coordinates.y);
    const coordinatesInRange: boolean = Geometry.areCoordinatesInGivenRange(coordinates, this.containerBox);
    if (!coordinatesInRange) {
      coordinates = coordinatesBackup;
    }
    return coordinates;
  }

  private cleanTempLine(): void {
    this.tempLine = null;
    this.currentLineGroup.removeLastElement(ElementType.LINE);
  }

  private draw(point: Point): void {
    if (!!this.attractionPoint) {
      point = this.attractionPoint;
    }
    point = {
      x: Math.round(point.x),
      y: Math.round(point.y)
    };
    if (!this.firstPointSelection) {
      this.hintBarService.sendHintMessage('path.hint.second');
      this.firstPointSelection = this.drawPoint(point);
      this.firstPoint = Object.assign({}, point);
    } else {
      const event: KeyboardEvent = <KeyboardEvent>window.event;
      let shouldSaveConfiguration = true;
      if (event.shiftKey && this.getCurrentLinePoints().length > 0) {
        point = this.handleShiftKeyEvent(point);
      }
      if (Geometry.isSamePoint(point, this.firstPoint)) {
        this.attractionPoint = null;
        this.hintBarService.sendHintMessage('path.hint.first');
        this.firstPointSelection.remove();
        shouldSaveConfiguration = false;
      }
      if (Geometry.isSamePoint(point, this.lastPoint)) {
        this.hintBarService.sendHintMessage('path.hint.first');
        this.firstPointSelection = null;
        this.lastPoint = null;
        this.tempLine = null;
        if (shouldSaveConfiguration) {
          this.sendPathToConfiguration();
        }
        return;
      }
      if (!!this.tempLine) { // do not clean if last line wasn't tempLine
        this.sendPathToConfiguration();
        this.cleanTempLine();
      }
      const line: Line = {
        startPoint: this.lastPoint,
        endPoint: point
      };
      const intersections: IntersectionIdentifier[] = this.getIntersections(line);
      intersections.length > 0 ? this.drawPathIntersected(point, intersections) : this.drawPathNotIntersected(point, line);
    }
    this.lastPoint = Object.assign({}, point);
  }

  private lineAlreadyExists(newLine: Line): boolean {
    return !!this.lines.find((line: Line): boolean => {
      const sameLineInSameDirection: boolean = line.startPoint.x === newLine.startPoint.x && line.startPoint.y === newLine.startPoint.y &&
        line.endPoint.x === newLine.endPoint.x && line.endPoint.y === newLine.endPoint.y;
      const sameLineInOppositeDirection: boolean = line.startPoint.x === newLine.endPoint.x && line.startPoint.y === newLine.endPoint.y &&
        line.endPoint.x === newLine.startPoint.x && line.endPoint.y === newLine.startPoint.y;
      return sameLineInSameDirection  || sameLineInOppositeDirection;
    });
  }

  private getIntersections(givenLine: Line): IntersectionIdentifier[] {
    const intersections: IntersectionIdentifier[] = [];
    this.lines.forEach((pathLine: Line): void => {
        let intersectionPoint: Point = Geometry.findLineToLineIntersection(pathLine, givenLine);
        if (
          !!intersectionPoint &&
          !Geometry.isSamePoint(pathLine.startPoint, intersectionPoint) &&
          !Geometry.isSamePoint(pathLine.endPoint, intersectionPoint)) {
          if (Math.abs(intersectionPoint.x - pathLine.startPoint.x) <= 10 && Math.abs(intersectionPoint.y - pathLine.startPoint.y) <= 10) {
            intersectionPoint = pathLine.startPoint;
          }
          if (Math.abs(intersectionPoint.x - pathLine.endPoint.x) <= 10 && Math.abs(intersectionPoint.y - pathLine.endPoint.y) <= 10) {
            intersectionPoint = pathLine.endPoint;
          }
          const index: number = this.lines.findIndex((pathLineNested: Line): boolean => {
            return (pathLineNested.endPoint.x === pathLine.endPoint.x &&
              pathLineNested.endPoint.y === pathLine.endPoint.y &&
              pathLineNested.startPoint.x === pathLine.startPoint.x &&
              pathLineNested.startPoint.y === pathLine.startPoint.y)
          });
          intersections.push({
            index: index,
            point: intersectionPoint
          });
        }
    });
    return intersections;
  }

  private drawPathIntersected(point: Point, intersections: IntersectionIdentifier[]): void {
    this.lines = this.lines.concat(this.intersectCrossed(intersections));
    this.lines = this.lines.concat(this.intersectCurrent(point, intersections));
    this.currentLineGroup.getGroup().remove();
    this.currentLineGroup = this.createBuilder().createGroup();
    this.drawLinesFromConfiguration();
  }

  private drawPathNotIntersected(point: Point, line: Line): void {
    if (!this.lineAlreadyExists(line)) {
      this.drawLine(point);
      this.lines.push(line);
    }
    this.drawPoint(point);
  }

  private intersectCrossed(intersections: IntersectionIdentifier[]): Line[] {
    const lines: Line[] = [];
    intersections.sort((a: IntersectionIdentifier, b: IntersectionIdentifier): number => {
      return b.index - a.index;
    });
    intersections.forEach((intersection: IntersectionIdentifier): void => {
      if (this.isIntersectionOnLineVertex(intersection)) {
        return;
      }
      const lineToIntersect: Line = this.lines.splice(intersection.index, 1)[0];
      const intersectedLeft: Line = {
          startPoint: lineToIntersect.startPoint,
          endPoint: intersection.point
        };
      const intersectedRight: Line = {
          startPoint: intersection.point,
          endPoint: lineToIntersect.endPoint
        };
      if (!this.lineAlreadyExists(intersectedLeft) || !this.lineAlreadyExists(intersectedRight)) {
        lines.push(intersectedLeft);
        lines.push(intersectedRight);
      } else {
        this.lines.push(lineToIntersect);
      }
    });
    return lines;
  }

  private intersectCurrent(point: Point, intersections: IntersectionIdentifier[]): Line[] {
    const lines: Line[] = [];
    let first: Point = this.lastPoint;
    intersections.forEach((intersection: IntersectionIdentifier): void => {
      const lineToLastIntersection: Line = {
        startPoint: first,
        endPoint: intersection.point
      };
      if (!this.lineAlreadyExists(lineToLastIntersection)) {
        lines.push(lineToLastIntersection);
      }
      first = intersection.point
    });
    const lineFromLastIntersectionToLastPoint: Line = {
      startPoint: first,
      endPoint: point
    };
    if (!this.lineAlreadyExists(lineFromLastIntersectionToLastPoint)) {
      lines.push(lineFromLastIntersectionToLastPoint);
    }
    return lines;
  }

  private isIntersectionOnLineVertex(intersection: IntersectionIdentifier): boolean {
    const isOnStartVertex: boolean =  this.lines[intersection.index].startPoint.x === intersection.point.x &&
      this.lines[intersection.index].startPoint.y === intersection.point.y;
    const isOnEndVertex: boolean =  this.lines[intersection.index].endPoint.x === intersection.point.x &&
      this.lines[intersection.index].endPoint.y === intersection.point.y;
    return isOnEndVertex || isOnStartVertex;
  }

}
