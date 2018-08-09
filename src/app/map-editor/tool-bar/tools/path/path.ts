import {Component, Input, OnDestroy, OnInit} from '@angular/core';
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
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../../../shared/utils/drawing/drawing.builder';
import {Line, PathContextCallback, PathContextMenuLabels, Point} from '../../../map.type';
import {isNumber} from 'util';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from '../../../action-bar/actionbar.type';
import {IntersectionIdentifier} from './path.type';

@Component({
  selector: 'app-path',
  templateUrl: './path.html',
  styleUrls: ['./path.css']
})
export class PathComponent implements Tool, OnInit, OnDestroy {
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

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService,
              private translateService: TranslateService
  ) {
  }

  ngOnInit() {
    this.listenOnMapLoad();
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

  toggleActivity(): void {
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
    } else {
      this.toolbarService.emitToolChanged(this);
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
      this.draw(coordinates);
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
          command: this.callbacks.remove
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
    this.sendPathDtoToConfiguration();
  }

  private listenOnMapLoad(): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;
    });
  }

  private listenOnScaleChange(): void {
    this.scaleService.scaleChanged.subscribe((scale: ScaleDto) => {
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
      .get('remove.all.lines')
      .subscribe((translatedValue) => {
        this.labels.removeAll = translatedValue;
      });
  }

  private setContextMenuCallbacks(): void {
    this.callbacks = {
      remove: () => {
        this.clearDrawnPath();
        this.lines = [];
        this.actionBarService.clearPath();
        this.sendPathDtoToConfiguration();
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

  private sendPathDtoToConfiguration(): void {
    const pathDto: Line[] = [];
    this.lines.forEach((line: Line): void => {
      pathDto.push(line);
    });
    this.actionBarService.addPath(pathDto);
  }

  private clearDrawnPath(): void {
    this.currentLineGroup.getGroup().remove();
    this.firstPointSelection = null;
    this.lastPoint = null;
    if (!!this.tempLine) {
      this.tempLine.remove();
      this.tempLine = null;
    }
    this.currentLineGroup = this.createBuilder().createGroup();
  }

  private createBuilder(index?: number): DrawBuilder {
    return new DrawBuilder(this.container, {
      id: `path-${isNumber(index) ? index : 'new'}`,
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
    if (!!deltaY) {
      coordinates.y = secondPoint.y - deltaY;
    } else {
      coordinates.x = secondPoint.x;
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
    if (!this.firstPointSelection) {
      this.hintBarService.sendHintMessage('path.hint.second');
      this.firstPointSelection = this.drawPoint(point);
      this.firstPoint = Object.assign({}, point);
    } else {
      const event: KeyboardEvent = <KeyboardEvent>window.event;
      if (event.shiftKey && this.getCurrentLinePoints().length > 0) {
        point = this.handleShiftKeyEvent(point);
      }
      if (Geometry.isSamePoint(point, this.firstPoint)) {
        this.attractionPoint = null;
        this.hintBarService.sendHintMessage('path.hint.first');
        this.firstPointSelection.remove();
      }
      if (Geometry.isSamePoint(point, this.lastPoint)) {
        this.hintBarService.sendHintMessage('path.hint.first');
        this.firstPointSelection = null;
        this.lastPoint = null;
        this.sendPathDtoToConfiguration();
        return;
      }
      this.cleanTempLine();
      const line: Line = {
        startPoint: this.lastPoint,
        endPoint: point
      };
      const intersections: IntersectionIdentifier[] = this.getIntersections(line);
      intersections.length > 0 ? this.drawPathIntersected(point, intersections) : this.drawPathNotIntersected(point, line);
    }
    this.lastPoint = Object.assign({}, point);
  }

  private getIntersections(line: Line): IntersectionIdentifier[] {
    const intersections: IntersectionIdentifier[] = [];
    this.lines.forEach((linePath: Line): void => {
      const intersectionPoint: Point = Geometry.intersection(linePath, line);
      if (!!intersectionPoint && !Geometry.isSamePoint(intersectionPoint, this.lastPoint)) {
        const index: number = this.lines.findIndex((linePathNested: Line): boolean => {
          return (linePathNested.endPoint.x === linePath.endPoint.x &&
            linePathNested.endPoint.y === linePath.endPoint.y &&
            linePathNested.startPoint.x === linePath.startPoint.x &&
            linePathNested.startPoint.y === linePath.startPoint.y)
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
    this.intersectCrossed(intersections).forEach((lineIntersected: Line) => {
      this.lines.push(lineIntersected);
    });
    this.intersectCurrent(point, intersections).forEach((lineIntersected: Line): void => {
      this.lines.push(lineIntersected);
    });
    this.lines.forEach((lineBagNested: Line): void => {
        lineBagNested = null;
    });
    this.currentLineGroup.getGroup().remove();
    this.currentLineGroup = this.createBuilder().createGroup();
    this.drawLinesFromConfiguration();
  }

  private drawPathNotIntersected(point: Point, line: Line): void {
    this.drawPoint(point);
    this.drawLine(point);
    this.lines.push(line);
  }

  private intersectCrossed(intersections: IntersectionIdentifier[]): Line[] {
    const lines: Line[] = [];
    intersections.sort((a: IntersectionIdentifier, b: IntersectionIdentifier): number => {
      return b.index - a.index;
    });
    intersections.forEach((intersection: IntersectionIdentifier): void => {
      const lineToIntersect: Line = this.lines.splice(intersection.index, 1)[0];
      const intersectedLeft: Line = {
          startPoint: lineToIntersect.startPoint,
          endPoint: intersection.point
        };
      const intersectedRight: Line = {
          startPoint: intersection.point,
          endPoint: lineToIntersect.endPoint
        };
      lines.push(intersectedLeft);
      lines.push(intersectedRight);
    });
    return lines;
  }

  private intersectCurrent(point: Point, intersections: IntersectionIdentifier[]): Line[] {
    const lines: Line[] = [];
    let first: Point = this.lastPoint;
    intersections.forEach((intersection: IntersectionIdentifier): void => {
      lines.push({
          startPoint: first,
          endPoint: intersection.point
        });
      first = intersection.point
    });
    lines.push({
        startPoint: first,
        endPoint: point
      });
    return lines;
  }

}
