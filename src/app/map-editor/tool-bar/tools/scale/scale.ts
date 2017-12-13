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

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['../tool.css']
})
export class ScaleComponent implements Tool, OnDestroy, OnInit {
  public active: boolean = false;
  public isScaleDisplayed: boolean = false;
  public isScaleSet: boolean = false;
  private isFirstPointDrawn: boolean = false;
  private END_SIZE: number = 5;
  private mapLoadedSubscription: Subscription;
  private saveButtonSubscription: Subscription;
  private configurationLoadedSubscription: Subscription;
  private configurationResetSubscription: Subscription;
  private scaleGroup = d3.select('#scaleGroup');
  private mapWidth: number;
  private mapHeight: number;
  private scale: Scale;
  private hintMessage: string;
  private pointsArray: Point[] = [];
  private linesArray: Line[] = [];

  constructor(private translate: TranslateService,
              private scaleInputService: ScaleInputService,
              private scaleHint: ScaleHintService,
              private mapLoaderInformer: MapLoaderInformerService,
              private hintBarService: HintBarService,
              private toolbarService: ToolbarService,
              private actionBarService: ActionBarService,
              private scaleService: ScaleService) {
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
      this.mapWidth = mapSvg.container.attr('width');
      this.mapHeight = mapSvg.container.attr('height');
      this.createSvgGroupWithScale();
    });

    this.saveButtonSubscription = this.scaleInputService.confirmClicked.subscribe((scale: Scale) => {
      this.toolbarService.emitToolChanged(null);
      this.isScaleSet = true;
      this.scale.realDistance = scale.realDistance;
      this.scale.measure = scale.measure;
      this.actionBarService.setScale(this.scale);
      this.scaleService.publishScaleChanged(this.scale);
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
    this.translate.get('scale.basic.msg').subscribe((value: string) => {
      this.hintBarService.emitHintMessage(value);
    });
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
    this.translate.get('hint.chooseTool').subscribe((value: string) => {
      this.hintBarService.emitHintMessage(value);
    });
  }

  public onClick(): void {
    this.toolbarService.emitToolChanged(this);
  }

  private updateScaleGroup() {
    this.scaleGroup = d3.select('#scaleGroup');
  }

  private createSvgGroupWithScale(): void {
    d3.select('#map')
      .append('g')
      .attr('id', 'scaleGroup')
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

    const mapBackground = d3.select('#map');
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

    if (!d3.select('#scaleGroup').empty() && this.isScaleSet) {
      d3.select('#scaleGroup').style('display', 'flex');
      this.redrawLine();
      this.redrawEndings();
      this.redrawPoints();
    } else if (d3.select('#scaleGroup').empty()) {
      d3.select('#map').append('g')
        .attr('id', 'scaleGroup')
        .style('display', 'flex');
    }

    this.updateScaleGroup();
  }

  private hideScale(): void {
    this.scaleService.changeVisibility(false);

    d3.select('#map').style('cursor', 'default');
    this.scaleGroup.style('display', 'none');
    d3.select('#map').on('click', null);
  }

  private addPoint(): void {
    const point = <Point>{
      x: d3.event.offsetX,
      y: d3.event.offsetY
    };

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
      d3.select('#map').on('click', null);
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

  redrawPoints(): void {
    const drag = d3.drag()
      .on('drag', (_, i, circleSelections) => {
        this.pointDrag(d3.select(circleSelections[i]));
      })
      .on('end', () => {
        this.setScalePoints();
        this.actionBarService.setScale(this.scale);
      });

    const points = this.scaleGroup.selectAll('circle');
    points.data(this.pointsArray).enter()
      .append('svg:circle')
      .classed('point', true)
      .style('cursor', 'all-scroll')
      .attr('cx', (d) => {
        return d.x;
      })
      .attr('cy', (d) => {
        return d.y;
      })
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
      .attr('x1', (d) => {
        return d.p1.x;
      })
      .attr('y1', (d) => {
        return d.p1.y;
      })
      .attr('x2', (d) => {
        return d.p2.x;
      })
      .attr('y2', (d) => {
        return d.p2.y;
      })
      .attr('stroke-width', 1)
      .attr('stroke', 'black');

    // update positions of old lines
    lines
      .attr('x1', (d) => {
        return d.p1.x;
      })
      .attr('y1', (d) => {
        return d.p1.y;
      })
      .attr('x2', (d) => {
        return d.p2.x;
      })
      .attr('y2', (d) => {
        return d.p2.y;
      });
  }

  private redrawEndings(): void {
    const endings = this.scaleGroup.selectAll('.endings');
    endings.data(this.pointsArray).enter()
      .append('svg:line')
      .classed('endings', true)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('x1', (d) => {
        if (this.linesArray.length === 0) {
          return d.x + this.END_SIZE;
        }
        return d.x + Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y1', (d) => {
        if (this.linesArray.length === 0) {
          return d.y;
        }
        return d.y + Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('x2', (d) => {
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
      .attr('transform', (d) => {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });

    endings
      .attr('x1', (d) => {
        return d.x + Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y1', (d) => {
        return d.y + Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('x2', (d) => {
        return d.x - Geometry.getVerticalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('y2', (d) => {
        return d.y - Geometry.getHorizontalEndingOffset(this.linesArray[0], this.END_SIZE);
      })
      .attr('transform', (d) => {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });
  }

  private pointDrag(circleSelection: d3.selection): void {
    if (this.pointsArray.length < 2) {
      return;
    }
    const event: KeyboardEvent = <KeyboardEvent>window.event;
    if (event.shiftKey) {
      this.dragPointWithShift(circleSelection);
    } else {
      circleSelection
        .attr('cx', (d) => {
          return d.x = Math.max(0, Math.min(this.mapWidth, d3.event.x));
        })
        .attr('cy', (d) => {
          return d.y = Math.max(0, Math.min(this.mapHeight, d3.event.y));
        });
    }
    this.redrawAllObjectsOnMap();
  }

  private dragPointWithShift(circle: d3.selection): void {
    const secondPoint = this.chooseNotDraggedPoint(circle);
    const mousePosition = <Point>{
      x: d3.event.x,
      y: d3.event.y
    };
    const potentialSlope: number = Geometry.getSlope(secondPoint, mousePosition);
    const upperSlope = 3;
    const lowerSlope = 0.558; // arctan(22.5°)
    if (Math.abs(potentialSlope) < lowerSlope) {
      circle
        .attr('cx', (d) => {
          return d.x = Math.max(0, Math.min(this.mapWidth, d3.event.x));
        })
        .attr('cy', (d) => {
          return d.y = secondPoint.y;
        });
    } else if (Math.abs(potentialSlope) > upperSlope) {
      circle
        .attr('cx', (d) => {
          return d.x = secondPoint.x;
        })
        .attr('cy', (d) => {
          return d.y = Math.max(0, Math.min(this.mapHeight, d3.event.y));
        });
    } else if (potentialSlope < upperSlope && potentialSlope > lowerSlope) {
      circle
        .attr('cx', (d) => {
          return d.x = Math.max(0, Math.min(this.mapWidth, secondPoint.x + ( d3.event.y - secondPoint.y)));
        })
        .attr('cy', (d) => {
          return d.y = Math.max(0, Math.min(this.mapHeight, d3.event.y));
        });
    } else if (potentialSlope > -upperSlope && potentialSlope < -lowerSlope) {
      circle
        .attr('cx', (d) => {
          return d.x = Math.max(0, Math.min(this.mapWidth, secondPoint.x - ( d3.event.y - secondPoint.y)));
        })
        .attr('cy', (d) => {
          return d.y = Math.max(0, Math.min(this.mapHeight, d3.event.y));
        });
    }
  }

  private chooseNotDraggedPoint(circle: d3.selection): Point {
    const point: Point = <Point>{
      x: 0,
      y: 0
    };
    if (this.scale.start.x === parseInt(circle.attr('cx'), 10) && this.scale.start.y === parseInt(circle.attr('cy'), 10)) {
      point.x = this.scale.stop.x;
      point.y = this.scale.stop.y;
    } else {
      point.x = this.scale.start.x;
      point.y = this.scale.start.y;
    }
    return point;
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
