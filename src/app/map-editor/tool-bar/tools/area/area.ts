import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import * as d3 from 'd3';
import {Point} from '../../../map.type';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../../../shared/utils/drawing/drawing.builder';
import {MapSvg} from '../../../../map/map.type';
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
import {ZoomService} from '../../../../shared/services/zoom/zoom.service';
import {Geometry} from '../../../../shared/utils/helper/geometry';
import {Scale, ScaleCalculations, ScaleDto} from '../scale/scale.type';
import {ScaleService} from '../../../../shared/services/scale/scale.service';
import {Helper} from '../../../../shared/utils/helper/helper';
import {Box} from '../../../../shared/utils/drawing/drawing.types';

@Component({
  selector: 'app-area',
  templateUrl: './area.html'
})
export class AreaComponent implements Tool, OnInit, OnDestroy {
  public static NEW_AREA_ID = 'area-new';
  private static CIRCLE_R: number = 5;

  @Input() floor: Floor;

  active: boolean = false;
  disabled: boolean = true;
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

  private scaleChangedSubscription: Subscription;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private containerBox: Box;
  private currentAreaInContainerBox: boolean;
  private backupPolygonPoints: Point[] = [];

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private areaDetailsService: AreaDetailsService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService) {
  }

  ngOnInit(): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;
      this.containerBox = mapSvg.container.node().getBBox();

      this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration): void => {
        if (!!configuration.data.areas) {
          const configurationCopy = Helper.deepCopy(configuration);
          configurationCopy.data.areas.forEach((area: Area): void => {
            const pointsInPixels: Point[] = [];
            area.points.forEach((point: Point): void => {
              pointsInPixels.push(point);
            });
            area.points = pointsInPixels;
            this.areas.push({
              dto: area,
              editable: null
            });
          });
        }
      });
    });

    this.scaleChangedSubscription = this.scaleService.scaleChanged.subscribe((scale: ScaleDto) => {
      this.scale = new Scale(scale);
      if (this.scale.isReady()) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    });

    this.onDecisionMadeSubscription = this.areaDetailsService.onDecisionMade().subscribe((area: AreaBag): void => {
      if (!!this.currentAreaGroup) {
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

          this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag): Area => {
            return areaBag.dto;
          }));
        }

        this.toggleActivity();
      }
    });
  }

  ngOnDestroy(): void {
    if (!!this.onDecisionMadeSubscription) {
      this.onDecisionMadeSubscription.unsubscribe();
    }
    if (!!this.scaleChangedSubscription) {
      this.scaleChangedSubscription.unsubscribe();
    }
  }

  getHintMessage(): string {
    return 'area.hint.first';
  }

  getToolName(): ToolName {
    return ToolName.AREAS;
  }

  setActive(): void {
    if (!this.active) {
      this.active = true;

      this.container.style('cursor', 'crosshair');

      this.layer.on('click', (_, i: number, nodes: d3.selection[]): void => {
        const coordinates: Point = this.zoomService.calculateTransition({x: d3.mouse(nodes[i])[0], y: d3.mouse(nodes[i])[1]});
        const coordinatesInRange: boolean = Geometry.areCoordinatesInGivenRange(coordinates, this.containerBox);
        if (coordinatesInRange) {
          this.handleMouseClick(coordinates);
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
      this.setView();

      this.currentAreaGroup = this.createBuilder().createGroup();

      this.container.on('contextmenu', (): void => {
        d3.event.preventDefault();
        this.cleanGroup();
        this.firstPointSelection = null;
        this.lastPoint = null;
        this.tempLine = null;


        if (this.onClickGetAreas(this.areas).length === 0) {
          this.contextMenuService.closeContextMenu();
          return;
        }

        if (this.onClickGetAreas(this.areas).length > 1) {
          this.applyContextMenuAreas();
        } else {
          this.areas.forEach((areaBag: AreaBag): void => {
            this.applyRightMouseButtonClick(areaBag.editable);
          });
        }
      });
    }
  }

  private onClickGetAreas(areas: AreaBag[]): AreaBag[] {
    const mouseClickPosition: Array<number> = d3.mouse(this.container.node());
    return areas.filter((area) => {
      return Geometry.isPointWithinArea(mouseClickPosition, area);
    });
  }

  private applyContextMenuAreas() {
    const areas = this.onClickGetAreas(this.areas);
    const labels = areas.map((area: AreaBag) => {
      return {
          label: area.dto.name,
          items: [
            {
              label: 'Edit',
              command: () => {
                this.selectedEditable = area.editable;
                this.setEditableToItemContextMenu();
              }
            },
            {
              label: 'Remove',
              command: () => {
                this.selectedEditable = area.editable;
                this.setRemoveToItemContextMenu();
              }
            }
          ]
        }
    });

    this.contextMenuService.setItems(labels);
    this.selectedEditable.groupWrapper.getGroup().on('contextmenu', (): void => {
      d3.event.preventDefault();
      this.contextMenuService.openContextMenu();
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

    this.cleanMapViewFromDrawnAreas();
    this.areaDetailsService.reject();

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

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  private handleShiftKeyEvent(coordinates: Point): Point {
    const secondPoint: Point = this.getCurrentAreaPoints()[this.getCurrentAreaPoints().length - 1];
    const coordinatesBackup = Object.assign({}, coordinates);
    const deltaY = Geometry.getDeltaY(coordinates, secondPoint);
    if (!!deltaY) {
      coordinates.y = secondPoint.y - deltaY;
    } else {
      coordinates.x = secondPoint.x;
    }
    const coordinatesInRange: boolean = Geometry.areCoordinatesInGivenRange(coordinates, this.containerBox);
    if (!coordinatesInRange) {
      coordinates = coordinatesBackup;
    }
    return coordinates;
  }

  private handleMouseClick(point: Point): void {
    if (!this.firstPointSelection) {
      this.firstPointSelection = this.drawPoint(point);
      this.areas.forEach((areaBag: AreaBag): void => {
        areaBag.editable.off();
      });
    } else {
      if (this.getCurrentAreaPoints().length < 2 && this.isFirstPoint()) {
        return;
      }
      const event: KeyboardEvent = <KeyboardEvent>window.event;
      if (event.shiftKey && this.getCurrentAreaPoints().length > 0) {
        point = this.handleShiftKeyEvent(point);
      }
      if (this.getCurrentAreaPoints().length === 2) {
        this.hintBarService.sendHintMessage('area.hint.second');
      }
      if (!!this.tempLine) {
        this.cleanTempLine();
      }
      this.drawLine(point);
      if (this.isFirstPoint() || (this.isLastPoint() && this.getCurrentAreaPoints().length > 2)) {
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
      .on('mouseover', (): void => {
        pointSelection.style('fill', 'red');
      })
      .on('mouseout', (): void => {
        pointSelection.style('fill', 'black');
      });

    return pointSelection;
  }

  private drawLine(point: Point): void {
    this.currentAreaGroup
      .addLine(this.lastPoint, point)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none');
  }

  private drawTempLine(): void {
    this.tempLine = this.currentAreaGroup
      .addLine(this.lastPoint, this.lastPoint)
      .getLastElement(ElementType.LINE)
      .style('pointer-events', 'none')
      .attr('stroke-dasharray', '5,5')
      .classed('tempLine', true);
  }

  private moveTempLine(coordinates: Point): void {
    const event: KeyboardEvent = <KeyboardEvent>window.event;
    if (event.shiftKey && this.getCurrentAreaPoints().length > 0) {
      const endPoint: Point = this.handleShiftKeyEvent(coordinates);
      this.tempLine.attr('x2', endPoint.x).attr('y2', endPoint.y);
    }
    this.tempLine.attr('x2', coordinates.x).attr('y2', coordinates.y);
  }

  private drawPolygon(points: Point[], group: SvgGroupWrapper = this.currentAreaGroup): Point[] {
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
    if (!areaBag && !!circles) {
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

  private removePoints(): void {
    this.currentAreaGroup.removeElements(ElementType.CIRCLE);
  }

  private removePolygon(): void {
    this.currentAreaGroup.removeElements(ElementType.POLYGON);
  }

  private cleanTempLine(): void {
    this.tempLine = null;
    this.currentAreaGroup.removeLastElement(ElementType.LINE);
  }

  private removeLines(): void {
    this.currentAreaGroup.removeElements(ElementType.LINE);
  }

  private createArea(): void {
    this.currentAreaInContainerBox = true;
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
    });
  }

  private isFirstPoint(): boolean {
    return d3.event.target.nodeName === 'circle' &&
      parseInt(this.firstPointSelection.attr('cx'), 10) === parseInt(d3.event.target.cx.baseVal.valueAsString, 10) &&
      parseInt(this.firstPointSelection.attr('cy'), 10) === parseInt(d3.event.target.cy.baseVal.valueAsString, 10);
  }

  private isLastPoint(): boolean {
    return d3.event.target.nodeName === 'circle' &&
      parseInt(this.lastPointSelection.attr('cx'), 10) === parseInt(d3.event.target.cx.baseVal.valueAsString, 10) &&
      parseInt(this.lastPointSelection.attr('cy'), 10) === parseInt(d3.event.target.cy.baseVal.valueAsString, 10);
  }

  private handleCircleDrag(): void {
    this.removePolygon();
    this.draggingElement
      .attr('cx', d3.event.dx + parseInt(this.draggingElement.attr('cx'), 10))
      .attr('cy', d3.event.dy + parseInt(this.draggingElement.attr('cy'), 10));
    this.drawPolygon(this.getCurrentAreaPoints());
  }

  private handlePolygonDrag(): void {
    const group: d3.selection = this.currentAreaGroup.getGroup();
    group
      .attr('x', d3.event.dx + parseInt(group.attr('x'), 10))
      .attr('y', d3.event.dy + parseInt(group.attr('y'), 10));
  }

  private applyDrag(): void {
    this.currentAreaGroup.getGroup().call(
      d3.drag()
        .on('drag', (): void => {
          if (this.draggingElement.node().nodeName === 'circle') {
            this.handleCircleDrag();
          } else {
            this.handlePolygonDrag();
          }
        })
        .on('start', (): void => {
          this.draggingElement = d3.select(d3.event.sourceEvent.target);
          d3.event.sourceEvent.stopPropagation();
          this.backupPolygonPoints = this.applyShiftToPolygon();
        })
        .on('end', (): void => {
          let isInRange = true;
          const currentPolygonPoints: Point[] = this.applyShiftToPolygon();
          currentPolygonPoints.forEach((point: Point): void => {
            if (!Geometry.areCoordinatesInGivenRange(point, this.containerBox)) {
              isInRange = false;
            }
          });
          if (!isInRange) {
            this.currentAreaGroup.remove();
            this.currentAreaGroup = this.createBuilder().createGroup();
            if (!!this.selectedEditable) {
              const idBackUp = this.selectedEditable.groupWrapper.getGroup().attr('id');
              this.currentAreaGroup.getGroup().attr('id', idBackUp);
            }
            this.drawPolygon(this.backupPolygonPoints);
            this.applyHover(this.backupPolygonPoints);
            this.applyDrag();
          }
        })
    );
  }

  private applyShiftToPolygon(): Point[] {
    const shift: Point = this.calculateShift();
    let points: Point[];
    if (this.draggingElement.node().nodeName === 'circle') {
      const currentPolygon: d3.selection = d3.select(this.draggingElement.node().parentNode).select('polygon');
      points = Geometry.calculatePolygonPointsRealPosition(currentPolygon, shift);
    } else {
      points = Geometry.calculatePolygonPointsRealPosition(this.draggingElement, shift);
    }
    return points;
  }

  private calculateShift(): Point {
    const selector = `${!!this.selectedEditable ? '#' + this.selectedEditable.groupWrapper.getGroup().attr('id') : '#' + AreaComponent.NEW_AREA_ID}`;
    const svgGroup = d3.select(selector);
    return (<Point>{x: +svgGroup.attr('x'), y: +svgGroup.attr('y')});
}

  private applyHover(points: Point[]): void {
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


  private setEditableToItemContextMenu(): void {
    const index = this.findSelectedAreaBagIndex();
    this.cleanMapViewFromDrawnAreas();
    this.setView();
    this.areaDetailsService.hide();
    const areaBag: AreaBag = this.areas[index];
    this.areaDetailsService.set(areaBag);
    this.areaDetailsService.show();
    this.container.style('cursor', 'move');
    this.container.on('contextmenu', null);
    this.layer.on('click', null);
    this.layer.on('mousemove', null);
    if (this.isCurrentAreaGroupNew()) {
      this.currentAreaGroup.remove();
    }
    this.currentAreaGroup.getGroup().selectAll('circle').remove();
    this.currentAreaGroup.getGroup().on('.drag', null);
    this.currentAreaGroup = areaBag.editable.groupWrapper;
    const points: Point[] = this.getCurrentAreaPoints(areaBag);
    this.applyHover(points);
    this.applyDrag();
  }

  private setRemoveToItemContextMenu(): void {
    const index = this.findSelectedAreaBagIndex();
    this.cleanGroup(this.selectedEditable.groupWrapper);
    this.areas.splice(index, 1);
    this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag): Area => {
      return areaBag.dto;
    }));
  }


  private applyRightMouseButtonClick(editable: Editable): void {
    editable.on({
      edit: () => {
        this.setEditableToItemContextMenu();
      },
      remove: (): void => {
        this.setRemoveToItemContextMenu();
      }
    });
  }

  private findSelectedAreaBagIndex(): number {
    if (!this.selectedEditable) {
      return -1;
    }
    return this.areas.findIndex((areaBag: AreaBag): boolean => {
      return areaBag.editable.groupWrapper.getGroup().attr('id') === this.selectedEditable.groupWrapper.getGroup().attr('id')
    });
  }

  private cleanGroup(svgGroupWrapper: SvgGroupWrapper = this.currentAreaGroup): void {
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

  private cleanMapViewFromDrawnAreas(): void {
    this.areas.forEach((areaBag: AreaBag): void => {
      areaBag.editable.off();
      this.cleanGroup(areaBag.editable.groupWrapper);
      areaBag.editable.groupWrapper.remove();
    });
  }

  private setView() {
    let index = 0;
    this.areas.forEach((areaBag: AreaBag): void => {
      areaBag.editable = new Editable(this.createBuilder(index).createGroup(), this.contextMenuService);
      this.applyRightMouseButtonClick(areaBag.editable);
      areaBag.editable.onSelected().subscribe((selected: Editable) => {
        this.selectedEditable = selected;
      });
      this.drawPolygon(areaBag.dto.points, areaBag.editable.groupWrapper);
      index++;
    });
  }
}
