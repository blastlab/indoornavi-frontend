import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import * as d3 from 'd3';
import {Point} from '../../../map.type';
import {Box, DrawBuilder, ElementType, SvgGroupWrapper} from '../../../../shared/utils/drawing/drawing.builder';
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
import {TranslateService} from '@ngx-translate/core';
import {MenuItem} from 'primeng/primeng';

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
  private onDecisionAcceptedSubscription: Subscription;
  private onDecisionRejectedSubscription: Subscription;

  private scaleChangedSubscription: Subscription;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private containerBox: Box;
  private currentAreaInContainerBox: boolean;
  private edited: boolean;
  private backupPolygonPoints: Point[] = [];

  private editLabel: string;
  private removeLabel: string;

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private zoomService: ZoomService,
              private areaDetailsService: AreaDetailsService,
              private contextMenuService: ContextMenuService,
              private actionBarService: ActionBarService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService,
              private translateService: TranslateService) {
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
            this.areas.push({
              dto: area,
              editable: null
            });
          });
        }
        this.setView();
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

    this.onDecisionAcceptedSubscription = this.areaDetailsService.onDecisionAccepted().subscribe((areaBagPayload: AreaBag): void => {
        if (!!this.currentAreaGroup && !!areaBagPayload) {
          areaBagPayload.editable.off();
            const index = this.findSelectedAreaBagIndex();
            if (index === -1) { // accepted new
              this.areas.push({
                dto: areaBagPayload.dto,
                editable: new Editable(this.currentAreaGroup, this.contextMenuService, this.translateService)
              });
              this.currentAreaGroup.getGroup().attr('id', 'area-' + this.areas.length);
            } else { // accepted edit
              this.areas[index] = areaBagPayload;
            }
            this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag): Area => {
              return this.setPointsRealDimensionsInCentimeters(areaBag.dto);
            }));
            this.toggleActivity();
        }
    });
    this.onDecisionRejectedSubscription = this.areaDetailsService.onDecisionRejected().subscribe(() => {
      if (!this.edited) {
        this.currentAreaGroup.remove();
        this.currentAreaGroup = null;
      } else {
        this.redrawPolygonFromBackup();
      }
    });
    this.setTranslations();
  }

  ngOnDestroy(): void {
    if (!!this.onDecisionAcceptedSubscription) {
      this.onDecisionAcceptedSubscription.unsubscribe();
    }
    if (!!this.onDecisionRejectedSubscription) {
      this.onDecisionRejectedSubscription.unsubscribe();
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
      this.edited = false;

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
      if (!this.currentAreaGroup) {
        this.currentAreaGroup = this.createBuilder().createGroup();
        this.applyContextMenu();
      }
      if (this.areas.length > 0) {
        this.areas.forEach((areaBag: AreaBag) => {
          this.applyContextMenuToSingleArea(areaBag);
        });
      }
    }
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
    this.setView();
    this.areaDetailsService.reject();
    this.container.on('contextmenu', null);
    if (this.areas.length > 0) {
      this.areas.forEach((areaBag: AreaBag) => {
        this.disableContextMenuToSingleArea(areaBag);
      });
    }
    if (this.isCurrentAreaGroupNew()) {
      this.currentAreaGroup.remove();
    }
  }

  private applyContextMenu() {
    this.container.on('contextmenu', (): void => {
      d3.event.preventDefault();
      this.firstPointSelection = null;
      this.lastPoint = null;
      this.tempLine = null;

      if (!this.selectedEditable) {
        this.cleanGroup();
      }

      const clickedAreas: AreaBag[] = this.getClickedAreas(this.areas);

      if (clickedAreas.length === 0) {
        this.contextMenuService.hide();
        return;
      }

      if (clickedAreas.length > 1) {
        this.applyContextMenuToAreas(clickedAreas);
      } else {
        this.applyContextMenuToSingleArea(clickedAreas[0]);
      }
    });
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

  private setPointsRealDimensionsInCentimeters(area: Area): Area {
    const points: Point[] = area.pointsInPixels.map((point: Point) => {
      return Geometry.calculatePointPositionInCentimeters(this.scale.getDistanceInPixels(), this.scale.getRealDistanceInCentimeters(), point)
    });
    area.points = Object.assign([], points);
    return area;
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
      this.selectedEditable = null;
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

  private drawPolygon(points: Point[], group: SvgGroupWrapper): Point[] {
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
      points = areaBag.dto.pointsInPixels;
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
    this.drawPolygon(points, this.currentAreaGroup);
    this.removeLines();
    this.removePoints();
    this.applyHover(points);
    this.applyDrag();
  }

  private createBuilder(index?: number, name?: string): DrawBuilder {
    return new DrawBuilder(this.container, {
      id: `area-${isNumber(index) ? index : 'new'}`,
      clazz: `area`,
      name: `${!!name ? name : 'area'}`
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
    this.drawPolygon(this.getCurrentAreaPoints(), this.currentAreaGroup);
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
            this.redrawPolygonFromBackup();
          }
        })
    );
  }

  private redrawPolygonFromBackup(): void {
    this.currentAreaGroup.remove();
    this.currentAreaGroup = this.createBuilder().createGroup();
    if (!!this.selectedEditable) {
      const idBackUp = this.selectedEditable.groupWrapper.getGroup().attr('id');
      this.currentAreaGroup.getGroup().attr('id', idBackUp);
      const index = this.findSelectedAreaBagIndex();
      if (index >= 0) {
        this.areas[index].editable.groupWrapper = this.currentAreaGroup;
      }
    }
    this.drawPolygon(this.backupPolygonPoints, this.currentAreaGroup);
    this.applyHover(this.backupPolygonPoints);
    this.applyDrag();
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
    this.currentAreaGroup.getGroup().raise();
  }

  private setRemoveToItemContextMenu(): void {
    const index = this.findSelectedAreaBagIndex();
    this.cleanGroup(this.selectedEditable.groupWrapper);
    this.createBuilder().removeLayer(this.selectedEditable.getId());
    this.areas.splice(index, 1);
    this.actionBarService.setAreas(this.areas.map((areaBag: AreaBag): Area => {
      return this.setPointsRealDimensionsInCentimeters(areaBag.dto);
    }));
    this.areaDetailsService.remove();
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
      const svgGroupWrapper: SvgGroupWrapper = this.createBuilder(index).createGroup();
      if (!areaBag.editable) {
        areaBag.editable = new Editable(svgGroupWrapper, this.contextMenuService, this.translateService);
      } else {
        areaBag.editable.groupWrapper = svgGroupWrapper;
      }
      console.log(areaBag.editable.getId());
      if (areaBag.editable.hasId()) {
        this.createBuilder().updateLayer(areaBag.editable.getId(), svgGroupWrapper.getGroup());
      } else {
        const layersId = this.createBuilder().createLayer(svgGroupWrapper.getGroup());
        console.log(layersId);
        areaBag.editable.setId(layersId);
      }
      areaBag.editable.onSelected().subscribe((selected: Editable) => {
        this.selectedEditable = selected;
      });
      this.drawPolygon(areaBag.dto.pointsInPixels, areaBag.editable.groupWrapper);
      index++;
    });
  }

  private getClickedAreas(areas: AreaBag[]): AreaBag[] {
    const mouseClickPosition: Array<number> = d3.mouse(this.container.node());
    const mouseClickPoint: Point = {x: mouseClickPosition[0], y: mouseClickPosition[1]};
    return areas.filter((area: AreaBag) => {
      return Geometry.isPointWithinArea(mouseClickPoint, area.dto);
    });
  }

  private applyContextMenuToAreas(clickedAreas: AreaBag[]): void {
    const labels: MenuItem[] = clickedAreas.map((area: AreaBag, index: number) => {
      return {
        label: !!area.dto.name ? area.dto.name : `#${index + 1}`,
        items: [
          {
            label: this.editLabel,
            command: () => {
              this.selectedEditable = area.editable;
              this.setEditableToItemContextMenu();
            }
          },
          {
            label: this.removeLabel,
            command: () => {
              this.selectedEditable = area.editable;
              this.setRemoveToItemContextMenu();
            }
          }
        ]
      }
    });
    this.contextMenuService.setItems(labels);
  }

  private applyContextMenuToSingleArea(areaBag?: AreaBag): void {
    areaBag.editable.on({
      edit: () => {
        this.edited = true;
        this.setEditableToItemContextMenu();
      },
      remove: (): void => {
        this.setRemoveToItemContextMenu();
        if (this.edited) {
          this.toggleActivity();
        }
        this.edited = false;
      }
    });
  }

  private disableContextMenuToSingleArea(areaBag: AreaBag): void {
    areaBag.editable.off();
  }

  private setTranslations(): void {
    this.translateService.get('edit').subscribe((value: string) => {
      this.editLabel = value;
    });

    this.translateService.get('remove').subscribe((value: string) => {
      this.removeLabel = value;
    });
  }
}
