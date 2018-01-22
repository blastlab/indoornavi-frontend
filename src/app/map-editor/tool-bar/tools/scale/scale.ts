import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Scale} from './scale.type';
import {Line, Point} from '../../../map.type';
import {ScaleInputService} from './input/input.service';
import {ScaleHintService} from './hint/hint.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Geometry} from '../../../../shared/utils/helper/geometry';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {Configuration} from '../../../action-bar/actionbar.type';
import {ScaleService} from './scale.service';
import {Helper} from '../../../../shared/utils/helper/helper';
import {ToolbarService} from '../../toolbar.service';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {MapSvg} from '../../../../map/map.type';
import {MapViewerService} from '../../../map.editor.service';
import {ZoomService} from '../../../zoom.service';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['../tool.css']
})
export class ScaleComponent implements Tool, OnDestroy, OnInit {
  private static SCALE_GROUP_SELECTOR_ID = 'scaleGroup';

  public active: boolean = false;
  public isScaleDisplayed: boolean = false;
  public isScaleSet: boolean = false;
  private isFirstPointDrawn: boolean = false;
  private END_SIZE: number = 5;
  private mapLoadedSubscription: Subscription;
  private saveButtonSubscription: Subscription;
  private configurationLoadedSubscription: Subscription;
  private configurationResetSubscription: Subscription;
  private scaleGroup = d3.select(`#${ScaleComponent.SCALE_GROUP_SELECTOR_ID}`);
  private scale: Scale;
  private scaleBackup: Scale;
  private hintMessage: string;
  private pointsArray: Point[] = [];
  private linesArray: Line[] = [];
  private scaleActivationButtonActive: boolean = true;

  constructor(private translate: TranslateService,
              private scaleInputService: ScaleInputService,
              private scaleHint: ScaleHintService,
              private mapLoaderInformer: MapLoaderInformerService,
              private hintBarService: HintBarService,
              private toolbarService: ToolbarService,
              private actionBarService: ActionBarService,
              private scaleService: ScaleService,
              private zoomService: ZoomService,
              private mapViewerService: MapViewerService
              ) {
    this.setTranslations();
  }

  ngOnDestroy() {
    if (this.mapLoadedSubscription) {
      this.mapLoadedSubscription.unsubscribe();
    }
    if (this.saveButtonSubscription) {
      this.saveButtonSubscription.unsubscribe();
    }
    if (this.configurationLoadedSubscription) {
      this.configurationLoadedSubscription.unsubscribe();
    }
    if (this.configurationResetSubscription) {
      this.configurationResetSubscription.unsubscribe();
    }

    this.isScaleSet = false;
    this.scaleGroup.remove();
    this.pointsArray = [];
    this.linesArray = [];
    this.isFirstPointDrawn = false;
  }

  ngOnInit(): void {
    this.createEmptyScale();

    this.configurationLoadedSubscription = this.actionBarService.configurationLoaded().subscribe((configuration: Configuration) => {
      this.drawScale(configuration.data.scale);
    });

    this.configurationResetSubscription = this.actionBarService.configurationReset().subscribe((configuration: Configuration) => {
      if (!configuration.data.scale) {
        this.isScaleSet = false;
        this.isFirstPointDrawn = false;
        this.isScaleDisplayed = false;
        this.toolbarService.emitToolChanged(null);
      }
      this.scaleGroup.remove();
      this.createSvgGroupWithScale();
      this.pointsArray = [];
      this.linesArray = [];
      this.drawScale(configuration.data.scale);
    });

    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapSvg: MapSvg) => {
      this.createSvgGroupWithScale();
    });

    this.saveButtonSubscription = this.scaleInputService.confirmClicked.subscribe((scale: Scale) => {
      if (!!scale) {
        this.isScaleSet = true;
        this.scale.realDistance = scale.realDistance;
        this.scale.measure = scale.measure;
        this.actionBarService.setScale(this.scale);
        this.scaleService.publishScaleChanged(this.scale);
      }
      this.toolbarService.emitToolChanged(null);
      this.setInactive()
    });

    this.scaleHint.mouseHoverChanged.subscribe((overOrOut: string) => {
      if (this.active || this.isScaleSet) {
        if (overOrOut === 'over') {
          this.scaleGroup.style('display', 'flex');
        } else {
          this.scaleGroup.style('display', 'none');
        }
      }
    });

    this.scaleInputService.onVisibilityChange().subscribe(() => {
      this.toolbarService.emitToolChanged(null);
    });
    this.toolbarService.onToolChanged().subscribe((tool: Tool) => {
      !!tool ? this.scaleActivationButtonActive = false : this.scaleActivationButtonActive = true;
    });
    this.scaleInputService.rejected.subscribe(() => {
      if (this.scaleBackup) {
        this.scale = Helper.deepCopy(this.scaleBackup);
        this.scaleGroup.remove();
        this.createSvgGroupWithScale();
        this.pointsArray = [];
        this.linesArray = [];
        this.drawScale(this.scale);
      }
    });
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  public getToolName(): ToolName {
    return ToolName.SCALE;
  }

  public setActive(): void {
    this.active = true;
    this.startCreatingScale();
    this.hintBarService.sendHintMessage('scale.basic.msg');
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
    this.hintBarService.sendHintMessage('hint.chooseTool');
  }

  public onClick(): void {
    this.toolbarService.emitToolChanged(this);
    this.isScaleSet ? this.scaleBackup = Helper.deepCopy(this.scale) : this.scaleBackup = null;
  }

  private updateScaleGroup() {
    this.scaleGroup = d3.select(`#${ScaleComponent.SCALE_GROUP_SELECTOR_ID}`);
  }

  private createSvgGroupWithScale(): void {
    d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`)
      .append('g')
      .attr('id', ScaleComponent.SCALE_GROUP_SELECTOR_ID)
      .style('display', 'none');
    this.updateScaleGroup();
  }

  private drawScaleFromConfiguration(): void {
    if (!!this.scale.realDistance && !!this.scale.start && !!this.scale.stop) {
      this.isScaleSet = true;
      this.pointsArray.push(this.scale.start);
      this.pointsArray.push(this.scale.stop);
      this.linesArray.push(this.createLine());
      this.redrawLine();
      this.redrawEndings();
    }
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('scale.basic.msg').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private startCreatingScale(): void {
    this.scaleGroup.style('display', 'flex');

    const mapBackground = d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`);
    mapBackground.style('cursor', 'crosshair');

    if (this.linesArray.length !== 1) {
      mapBackground.on('click', () => {
        this.addPoint();
      });
      this.scaleService.changeVisibility(false);
    }

    if (this.isScaleSet || this.isScaleDisplayed) {
      this.scaleService.changeVisibility(true);
    }

    if (!d3.select(`#${ScaleComponent.SCALE_GROUP_SELECTOR_ID}`).empty() && this.isScaleSet) {
      d3.select(`#${ScaleComponent.SCALE_GROUP_SELECTOR_ID}`).style('display', 'flex');
      this.redrawLine();
      this.redrawEndings();
      this.redrawPoints();
    } else if (d3.select(`#${ScaleComponent.SCALE_GROUP_SELECTOR_ID}`).empty()) {
      d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).append('g')
        .attr('id', ScaleComponent.SCALE_GROUP_SELECTOR_ID)
        .style('display', 'flex');
    }

    this.updateScaleGroup();
  }

  private hideScale(): void {
    this.scaleService.changeVisibility(false);
    d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).style('cursor', 'default');
    this.scaleGroup.style('display', 'none');
    d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).on('click', null);
  }

  private addPoint(): void {
    const point: Point = this.zoomService.calculateTransition({x: d3.event.offsetX, y: d3.event.offsetY});

    if (!this.isFirstPointDrawn) {
      this.isFirstPointDrawn = true;
      this.pointsArray.push(point);
      this.redrawEndings();
      this.redrawPoints();
    } else {
      this.pointsArray.push(point);
      this.linesArray.push(this.createLine());
      const mouseEvent = window.event as MouseEvent;
      if (mouseEvent.shiftKey) {
        this.blockOneDimension(point);
      }
      this.setScalePoints();
      this.redrawAllObjectsOnMap();
      this.setScaleVisible();
      this.scaleGroup.style('display', 'flex');
      d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).on('click', null);
    }
  }

  private blockOneDimension(point: Point): void {
    const slope: number = this.getLineSlope();
    if (slope < 1 && slope > -1) {
      point.y = this.pointsArray[0].y;
    } else {
      point.x = this.pointsArray[0].x;
    }
  }

  private redrawAllObjectsOnMap(): void {
    this.redrawLine();
    this.redrawEndings();
    this.redrawPoints();
  }

  private setScaleVisible(): void {
    this.isScaleDisplayed = true;
    this.scaleService.changeVisibility(this.isScaleDisplayed);
  }

  private getLineSlope(): number {
    if (this.linesArray.length === 0) {
      return 0;
    }
    return Geometry.getSlope(this.linesArray[0].p1, this.linesArray[0].p2);
  }

  private createLine(): Line {
    return <Line>{
      p1: this.pointsArray[0],
      p2: this.pointsArray[1]
    };
  }

  private redrawPoints(): void {

    const subject = () => { return { x: d3.event.x, y: d3.event.y }};

    const dragStart = (_, index: number, selections: d3.selection[]) => {
      d3.event.sourceEvent.stopPropagation();
      d3.select(selections[index]).classed('dragging', true);
    };

    const dragging = (d, index: number, selections: d3.selection[]) => {
      const event: KeyboardEvent = <KeyboardEvent>window.event;
      const secondPoint: Point = <Point>{
        x: 0,
        y: 0
      };
      const mousePosition = <Point>{
        x: d3.event.x,
        y: d3.event.y
      };
      let x: number;
      let y: number;
      if (index === 0) {
        secondPoint.x = this.pointsArray[1].x;
        secondPoint.y = this.pointsArray[1].y;
      } else {
        secondPoint.x = this.pointsArray[0].x;
        secondPoint.y = this.pointsArray[0].y;
      }

      if (event.shiftKey) {
        const deltaY = Geometry.getDeltaY(mousePosition, secondPoint);
        if (!!deltaY) {
          x = mousePosition.x;
          y = secondPoint.y - deltaY;
        } else {
          x = secondPoint.x;
          y = mousePosition.y;
        }
      } else {
        x = mousePosition.x;
        y = mousePosition.y;
      }
      // offsetFromBorder[0] gives left and upper border offset,
      // and offsetFromBorder[1] gives right and bottom border offset,
      // sign is giving a direction of the offset
      const offsetFromBorder = [{x : 5, y: 5}, {x: -5, y: -5}];
      const eventPosition: Point = this.zoomService.calculateInMapEditorRangeEvent({x: x, y: y}, offsetFromBorder);
      d3.select(selections[index]).attr('cx', d.x = eventPosition.x).attr('cy', d.y = eventPosition.y);
      this.redrawLine();
      this.redrawEndings();
    };

    const dragStop = (_, index: number, selections: d3.selection[]) => {
      d3.select(selections[index]).classed('dragging', false);
    };

    const drag = d3.drag()
      .subject(subject)
      .on('start', dragStart)
      .on('drag', dragging)
      .on('end', dragStop);

    const points = this.scaleGroup.selectAll('circle');

    points.data(this.pointsArray).enter()
      .append('svg:circle')
      .classed('point', true)
      .style('cursor', 'all-scroll')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 10)
      .attr('fill-opacity', 0)
      .call(drag);
  }

  private setScalePoints(): void {
    this.scale.start = this.pointsArray[0];
    this.scale.stop = this.pointsArray[1];
  }

  private redrawLine(): void {
    const lines = this.scaleGroup.selectAll('.connectLine');
    lines.data(this.linesArray).enter()
      .append('svg:line')
      .classed('connectLine', true)
      .style('cursor', 'crosshair')
      .attr('x1', d => d.p1.x)
      .attr('y1', d => d.p1.y)
      .attr('x2', d => d.p2.x)
      .attr('y2', d => d.p2.y)
      .attr('stroke-width', 1)
      .attr('stroke', 'black');

    lines
      .attr('x1', d => d.p1.x)
      .attr('y1', d => d.p1.y)
      .attr('x2', d => d.p2.x)
      .attr('y2', d => d.p2.y);
  }

  private redrawEndings(): void {
    const endings = this.scaleGroup.selectAll('.endings');
    endings.data(this.pointsArray).enter()
      .append('svg:line')
      .classed('endings', true)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('x1', d => {
        if (this.linesArray.length === 0) {
          return d.x + this.END_SIZE;
        }
        return d.x + Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y1', d => {
        if (this.linesArray.length === 0) {
          return d.y;
        }
        return d.y + Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('x2', d => {
        if (this.linesArray.length === 0) {
          return d.x - this.END_SIZE;
        }
        return d.x - Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y2', (d) => {
        if (this.linesArray.length === 0) {
          return d.y;
        }
        return d.y - Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('transform', d => {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });

    endings
      .attr('x1', d => {
        return d.x + Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y1', d => {
        return d.y + Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('x2', d => {
        return d.x - Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y2', d => {
        return d.y - Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('transform', d => {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });
  }

  private createEmptyScale(): void {
    this.scale = <Scale>{
      start: null,
      stop: null,
      realDistance: null,
      measure: null
    };
  }

  private drawScale(scale: Scale) {
    if (scale === null) {
      this.createEmptyScale();
    } else {
      this.scale = Helper.deepCopy(scale);
      this.drawScaleFromConfiguration();
    }
    this.scaleService.publishScaleChanged(this.scale);
    this.updateScaleGroup();
  }
}
