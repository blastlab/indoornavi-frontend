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
import {Line, Point} from '../../../map.type';
import {isNumber} from 'util';

@Component({
  selector: 'app-path',
  templateUrl: './path.html',
  styleUrls: ['./path.css']
})
export class PathComponent implements Tool, OnInit, OnDestroy {
  public static NEW_PATH_ID = 'path-new';
  private static CIRCLE_R: number = 5;

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

  static isSamePoint(firstPoint: Point, lastPoint: Point): boolean {
    return Math.floor(firstPoint.x) === Math.floor(lastPoint.x) && Math.floor(firstPoint.y) === Math.floor(lastPoint.y);
  }


  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService) {
  }

  ngOnInit() {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;
    });
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
    this.active = true;

    this.container.style('cursor', 'crosshair');

    this.layer.on('click', (_, i: number, nodes: d3.selection[]): void => {
      const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
      this.handleMouseClick(coordinates);
    });

    this.currentLineGroup = this.createBuilder().createGroup();

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
  }

  setInactive(): void {
    this.active = false;
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
        pointSelection.style('fill', 'red');
      })
      .on('mouseout', (): void => {
        pointSelection.style('fill', 'black');
      });
    return pointSelection;
  }

  private drawLine(point: Point): void {
    this.currentLineGroup
      .addLine(this.lastPoint, point)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none');
    const line: Line = {
      startPoint: this.lastPoint,
      endPoint: point
    };
    this.lines.push(line);
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

  private handleMouseClick(point: Point): void {
    if (!this.firstPointSelection) {
      this.firstPointSelection = this.drawPoint(point);
      this.firstPoint = Object.assign({}, point);
    } else {
      const event: KeyboardEvent = <KeyboardEvent>window.event;
      if (event.shiftKey && this.getCurrentLinePoints().length > 0) {
        point = this.handleShiftKeyEvent(point);
      }
      if (PathComponent.isSamePoint(point, this.firstPoint)) {
        this.firstPointSelection.remove();
      }
      if (PathComponent.isSamePoint(point, this.lastPoint)) {
        this.firstPointSelection = null;
        this.lastPoint = null;
        return;
      }
      this.cleanTempLine();
      this.drawPoint(point);
      this.drawLine(point);
    }
    this.lastPoint = Object.assign({}, point);
  }

}
