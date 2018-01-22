import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import * as d3 from 'd3';
import {Point} from '../../../map.type';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../../../shared/utils/drawing/drawing.builder';
import {MapSvg} from '../../../../map/map.type';
import {ZoomService} from '../../../zoom.service';
import {AreaDetailsService} from './details/area-details.service';
import {Area, AreaBag} from './area.type';
import {Editable} from '../../../../shared/wrappers/editable/editable';
import {ContextMenuService} from '../../../../shared/wrappers/editable/editable.service';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {Floor} from '../../../../floor/floor.type';
import {Configuration} from '../../../action-bar/actionbar.type';
import {isNumber} from 'util';
import {Subscription} from 'rxjs/Subscription';
import {HintBarService} from '../../../hint-bar/hintbar.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.html'
})
export class AreaComponent implements Tool, OnInit, OnDestroy {
  public static NEW_AREA_ID = 'area-new';
  private static CIRCLE_R: number = 5;

  @Input() floor: Floor;

  active: boolean;
  private firstPointSelection: d3.selection;
  private lastPointSelection: d3.selection;
  private lastPoint: Point;
  private tempLine: d3.selection;
  private currentAreaGroup: SvgGroupWrapper;

  private container: d3.selection;
  private layer: d3.selection;
  private areas: AreaBag[] = [];

  private draggingElement: d3.selection;
  private selectedEditable: Editable;
  private onDecisionMadeSubscription: Subscription;

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private areaDetailsService: AreaDetailsService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService) {
  }

  ngOnInit(): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;

      this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration) => {
        if (!!configuration.data.areas) {
          configuration.data.areas.forEach((area: Area) => {
            this.areas.push({
              dto: area,
              editable: null
            });
          });
        }
      });
    });

    this.onDecisionMadeSubscription = this.areaDetailsService.onDecisionMade().subscribe((area: AreaBag) => {
      if (!area) { // rejected
        this.currentAreaGroup.remove();
        this.currentAreaGroup = null;
      } else {
        const index = this.findSelectedAreaBagIndex();
        if (index === -1) { // accepted new
          this.areas.push({
            dto: area.dto,
            editable: new Editable(this.currentAreaGroup, this.contextMenuService)
          });
          this.currentAreaGroup.getGroup().attr('id', 'area-' + this.areas.length);
        } else { // accepted edit
          this.areas[index] = area;
        }

        this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag) => {
          return areaBag.dto;
        }));
      }
      this.toggleActivity();
    });
  }

  ngOnDestroy() {
    if (!!this.onDecisionMadeSubscription) {
      this.onDecisionMadeSubscription.unsubscribe();
    }
  }

  getHintMessage(): string {
    return 'area.hint.first';
  }

  getToolName(): ToolName {
    return ToolName.AREA;
  }

  setActive(): void {
    this.active = true;

    this.container.style('cursor', 'crosshair');
    this.currentAreaGroup = this.createBuilder().createGroup();

    this.layer.on('click', (_, i: number, nodes: d3.selection[]) => {
      const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
      this.handleMouseClick(coordinates);
    });

    this.layer.on('mousemove', (_, i: number, nodes: d3.selection[]) => {
      if (!!this.firstPointSelection) {
        const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
        if (!!this.tempLine) {
          this.moveTempLine(coordinates);
        } else {
          this.drawTempLine();
        }
      }
    });

    let index = 0;
    this.areas.forEach((areaBag: AreaBag) => {
      areaBag.editable = new Editable(this.createBuilder(index).createGroup(), this.contextMenuService);
      this.applyRightMouseButtonClick(areaBag.editable);
      areaBag.editable.onSelected().subscribe((selected: Editable) => {
        this.selectedEditable = selected;
      });
      this.drawPolygon(areaBag.dto.points, areaBag.editable.groupWrapper);
      index++;
    });

    this.container.on('contextmenu', () => {
      d3.event.preventDefault();
      this.cleanGroup();
      this.firstPointSelection = null;
      this.lastPoint = null;
      this.tempLine = null;

      this.areas.forEach((areaBag: AreaBag) => {
        this.applyRightMouseButtonClick(areaBag.editable);
      });
    });
  }

  setInactive(): void {
    this.active = false;

    this.container.style('cursor', 'move');

    this.layer.on('click', null);
    this.layer.on('mousemove', null);
    this.firstPointSelection = null;
    this.lastPoint = null;
    this.tempLine = null;
    this.draggingElement = null;
    this.selectedEditable = null;

    this.areas.forEach((areaBag: AreaBag) => {
      areaBag.editable.off();
      this.cleanGroup(areaBag.editable.groupWrapper);
      areaBag.editable.groupWrapper.remove();
    });

    if (this.isCurrentAreaGroupNew()) {
      this.currentAreaGroup.remove();
    }
  }

  toggleActivity(): void {
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  private handleMouseClick(point: Point): void {
    if (!this.firstPointSelection) {
      this.firstPointSelection = this.drawPoint(point);
      this.areas.forEach((areaBag: AreaBag) => {
        areaBag.editable.off();
      });
    } else {
      const currentAreaPoints: Point[] = this.getCurrentAreaPoints();
      if (currentAreaPoints.length === 2) {
        this.hintBarService.sendHintMessage('area.hint.second');
      }
      this.cleanTempLine();
      this.drawLine(point);
      if (this.isFirstPoint() || (this.isLastPoint() && currentAreaPoints.length > 2)) {
        this.createArea();
        return;
      }
      this.lastPointSelection = this.drawPoint(point);
    }
    this.lastPoint = point;
  }

  private drawPoint(point: Point): d3.selection {
    const pointSelection: d3.selection = this.currentAreaGroup
      .addCircle(point, AreaComponent.CIRCLE_R)
      .getLastElement(ElementType.CIRCLE);

    pointSelection
      .on('mouseover', () => {
        pointSelection.style('fill', 'red');
      })
      .on('mouseout', () => {
        pointSelection.style('fill', 'black');
      });

    return pointSelection;
  }

  private drawLine(point: Point) {
    this.currentAreaGroup
      .addLine(this.lastPoint, point)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none');
  }

  private drawTempLine() {
    this.tempLine = this.currentAreaGroup
      .addLine(this.lastPoint, this.lastPoint)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none')
      .attr('stroke-dasharray', '5,5')
      .classed('tempLine', true);
  }

  private moveTempLine(coordinates: Point) {
    this.tempLine.attr('x2', coordinates.x).attr('y2', coordinates.y);
  }

  private drawPolygon(points: Point[], group: SvgGroupWrapper = this.currentAreaGroup) {
    const polygon: d3.selection = group.addPolygon(points)
      .getLastElement(ElementType.POLYGON);
    polygon
      .style('fill', Area.getCustomSettings().fill)
      .style('opacity', Area.getCustomSettings().opacity)
      .on('mouseover', () => {
        polygon.style('fill', 'red');
      })
      .on('mouseout', () => {
        polygon.style('fill', 'grey');
      });
    return points;
  }

  private getCurrentAreaPoints(areaBag?: AreaBag): Point[] {
    let points: Point[];
    const circles: d3.selection[] = this.currentAreaGroup.getElements(ElementType.CIRCLE);
    if (!areaBag || !!circles) {
      points = circles.map((point: d3.selection) => {
        return (<Point>{
          x: Math.round(parseFloat(point.attr('cx'))),
          y: Math.round(parseFloat(point.attr('cy')))
        });
      });
    } else {
      points = areaBag.dto.points;
    }
    return points;
  }

  private removePoints() {
    this.currentAreaGroup.removeElements(ElementType.CIRCLE);
  }

  private removePolygon() {
    this.currentAreaGroup.removeElements(ElementType.POLYGON);
  }

  private cleanTempLine() {
    this.tempLine = null;
    this.currentAreaGroup.removeLastElement(ElementType.LINE);
  }

  private removeLines() {
    this.currentAreaGroup.removeElements(ElementType.LINE);
  }

  private createArea() {
    this.areaDetailsService.show();
    this.hintBarService.sendHintMessage('area.hint.third');

    this.container.style('cursor', 'move');
    this.container.on('contextmenu', null);
    this.layer.on('click', null);
    this.layer.on('mousemove', null);

    const points: Point[] = this.getCurrentAreaPoints();
    this.drawPolygon(points);
    this.removeLines();
    this.removePoints();
    this.applyHover(points);
    this.applyDrag();
  }

  private createBuilder(index?: number): DrawBuilder {
    return new DrawBuilder(this.container, {
      id: `area-${isNumber(index) ? index : 'new'}`,
      clazz: `area`
    }, this.zoomService);
  }

  private isFirstPoint(): boolean {
    return d3.event.target.nodeName === 'circle' &&
      this.firstPointSelection.attr('cx') === d3.event.target.cx.baseVal.valueAsString &&
      this.firstPointSelection.attr('cy') === d3.event.target.cy.baseVal.valueAsString;
  }

  private isLastPoint(): boolean {
    return d3.event.target.nodeName === 'circle' &&
      this.lastPointSelection.attr('cx') === d3.event.target.cx.baseVal.valueAsString &&
      this.lastPointSelection.attr('cy') === d3.event.target.cy.baseVal.valueAsString;
  }

  private handleCircleDrag() {
    this.removePolygon();
    this.draggingElement
      .attr('cx', d3.event.dx + parseInt(this.draggingElement.attr('cx'), 10))
      .attr('cy', d3.event.dy + parseInt(this.draggingElement.attr('cy'), 10));
    this.drawPolygon(this.getCurrentAreaPoints());
  }

  private handlePolygonDrag() {
    const group: d3.selection = this.currentAreaGroup.getGroup();
    group
      .attr('x', d3.event.dx + parseInt(group.attr('x'), 10))
      .attr('y', d3.event.dy + parseInt(group.attr('y'), 10));
  }

  private applyDrag() {
    this.currentAreaGroup.getGroup().call(
      d3.drag()
        .on('drag', () => {
          if (this.draggingElement.node().nodeName === 'circle') {
            this.handleCircleDrag();
          } else {
            this.handlePolygonDrag();
          }
        })
        .on('start', () => {
          this.draggingElement = d3.select(d3.event.sourceEvent.target);
          d3.event.sourceEvent.stopPropagation();
        })
        .on('end', () => {
          this.draggingElement = null;
        })
    );
  }

  private applyHover(points: Point[]) {
    points.forEach((point: Point) => {
      const drawnPoint: d3.selection = this.drawPoint(point);
      drawnPoint
        .on('mouseover', () => {
          drawnPoint.style('fill', 'red');
          this.container.style('cursor', 'n-resize');
        })
        .on('mouseout', () => {
          drawnPoint.style('fill', 'black');
          this.container.style('cursor', 'move');
        });
    });
  }

  private applyRightMouseButtonClick(editable: Editable) {
    editable.on({
      edit: () => {
        this.areaDetailsService.show();
        const index = this.findSelectedAreaBagIndex();
        const areaBag: AreaBag = this.areas[index];
        this.areaDetailsService.set(areaBag);
        this.container.style('cursor', 'move');
        this.container.on('contextmenu', null);
        this.layer.on('click', null);
        this.layer.on('mousemove', null);
        if (this.isCurrentAreaGroupNew()) {
          this.currentAreaGroup.remove();
        }
        if (this.isSelectedDifferentThanCurrent()) {
          this.currentAreaGroup.getGroup().selectAll('circle').remove();
          this.currentAreaGroup.getGroup().on('.drag', null);
          this.currentAreaGroup = areaBag.editable.groupWrapper;

          const points: Point[] = this.getCurrentAreaPoints(areaBag);
          this.applyHover(points);
          this.applyDrag();
        }
      },
      remove: () => {
        this.cleanGroup(this.selectedEditable.groupWrapper);
        const index = this.findSelectedAreaBagIndex();
        this.areas.splice(index, 1);
        this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag) => {
          return areaBag.dto;
        }));
      }
    });
  }

  private findSelectedAreaBagIndex(): number {
    if (!this.selectedEditable) {
      return -1;
    }
    return this.areas.findIndex((areaBag: AreaBag) => {
      return areaBag.editable.groupWrapper.getGroup().attr('id') === this.selectedEditable.groupWrapper.getGroup().attr('id')
    });
  }

  private cleanGroup(svgGroupWrapper: SvgGroupWrapper = this.currentAreaGroup) {
    svgGroupWrapper.getGroup().selectAll('polygon')
      .on('mouseover', null)
      .on('mouseout', null);
    svgGroupWrapper.getGroup().on('.drag', null);
    svgGroupWrapper.removeElements(ElementType.CIRCLE);
    svgGroupWrapper.removeElements(ElementType.LINE);
    svgGroupWrapper.removeElements(ElementType.POLYGON);
  }

  private isCurrentAreaGroupNew(): boolean {
    return !!this.currentAreaGroup && this.currentAreaGroup.getGroup().attr('id') === AreaComponent.NEW_AREA_ID;
  }

  private isSelectedDifferentThanCurrent(): boolean {
    return this.currentAreaGroup.getGroup().attr('id') !== this.selectedEditable.groupWrapper.getGroup().attr('id');
  }
}
