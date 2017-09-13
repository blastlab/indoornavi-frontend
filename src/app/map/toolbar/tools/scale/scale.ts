import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Scale} from './scale.type';
import {Line, Point} from '../../../map.type';
import {ScaleInputService} from './input/input.service';
import {ScaleHintService} from './hint/hint.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Geometry} from '../../../utils/geometry';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {ActionBarService} from '../../../actionbar/actionbar.service';
import {Configuration} from '../../../actionbar/actionbar.type';
import {ScaleService} from './scale.service';
import {Helper} from '../../../../utils/helper/helper';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['../tool.css']
})
export class ScaleComponent implements Tool, OnDestroy, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: string;
  private pointsArray: Array<Point> = [];
  private linesArray: Array<Line> = [];
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

  constructor(private translate: TranslateService,
              private scaleInput: ScaleInputService,
              private scaleHint: ScaleHintService,
              private mapLoaderInformer: MapLoaderInformerService,
              private hintBar: HintBarService,
              private configurationService: ActionBarService,
              private scaleService: ScaleService) {
    this.setTranslations();
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
    this.saveButtonSubscription.unsubscribe();
    this.configurationLoadedSubscription.unsubscribe();
    this.configurationResetSubscription.unsubscribe();
    this.isScaleSet = false;
    this.scaleGroup.remove();
    this.pointsArray = [];
    this.linesArray = [];
    this.isFirstPointDrawn = false;
  }

  ngOnInit(): void {
    this.createEmptyScale();

    this.configurationLoadedSubscription = this.configurationService.configurationLoaded().subscribe((configuration: Configuration) => {
      this.drawScale(configuration.data.scale);
    });

    this.configurationResetSubscription = this.configurationService.configurationReset().subscribe((configuration: Configuration) => {
      if (!configuration.data.scale) {
        this.isScaleSet = false;
        this.isFirstPointDrawn = false;
      }
      this.scaleGroup.remove();
      this.createSvgGroupWithScale();
      this.pointsArray = [];
      this.linesArray = [];
      this.drawScale(configuration.data.scale);
    });

    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      const mapSvg = d3.select('#map');
      this.mapWidth = mapSvg.attr('width');
      this.mapHeight = mapSvg.attr('height');
      this.createSvgGroupWithScale();
    });

    this.saveButtonSubscription = this.scaleInput.confirmClicked.subscribe((scale: Scale) => {
      this.clicked.emit(this);
      this.isScaleSet = true;
      this.scale.realDistance = scale.realDistance;
      this.scale.measure = scale.measure;
      this.configurationService.setScale(this.scale);
    });

    this.scaleHint.mouseHoverChanged.subscribe((overOrOut: string) => {
      if (overOrOut === 'over') {
        this.scaleGroup.style('display', 'flex');
      } else {
        this.scaleGroup.style('display', 'none');
      }
    });
  }

  public getToolName(): ToolName {
    return ToolName.SCALE;
  }

  public setActive(): void {
    this.active = true;
    this.startCreatingScale();
    this.translate.get('scale.basic.msg').subscribe((value: string) => {
      this.hintBar.publishHint(value);
    });
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
    this.translate.get('hint.chooseTool').subscribe((value: string) => {
      this.hintBar.publishHint(value);
    });
  }

  public toolClicked(): void {
    this.clicked.emit(this);
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
      console.log('redrawing scale from configuration');
      console.log(this.scale);
      this.isScaleSet = true;
      this.pointsArray.push(this.scale.start);
      this.pointsArray.push(this.scale.stop);
      this.linesArray.push(this.createLine());
      console.log(this.linesArray);
      console.log(this.pointsArray);
      this.redrawLine();
      this.redrawEndings();
      this.redrawInput();
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

    const mapBackground = d3.select('#mapBackground');
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
      this.redrawInput();
    } else if (d3.select('#scaleGroup').empty()) {
      d3.select('#map').append('g')
        .attr('id', 'scaleGroup')
        .style('display', 'flex');
    }

    this.updateScaleGroup();
  }

  private hideScale(): void {
    this.scaleService.changeVisibility(false);

    d3.select('#mapBackground').style('cursor', 'default');
    this.scaleGroup.style('display', 'none');
    d3.select('#mapBackground').on('click', null);
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
      d3.select('#mapBackground').on('click', null);
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
    this.redrawInput();
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
        this.configurationService.setScale(this.scale);
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

  private redrawInput(): void {
    const tempX = (this.linesArray[0].p1.x + this.linesArray[0].p2.x) / 2;
    const tempY = (this.linesArray[0].p1.y + this.linesArray[0].p2.y) / 2;

    const scaleInput = document.getElementById('scaleInput');
    const inputHeight = scaleInput.offsetHeight;
    const inputWidth = scaleInput.offsetWidth;
    const x = Math.max(0, Math.min(tempX, this.mapWidth - inputWidth - 25));
    const y = Math.max(inputHeight, Math.min(tempY, this.mapHeight - inputHeight));
    const p = <Point>{
      x: x,
      y: y
    };
    this.moveInputIfItEclipsesPoint(p, inputHeight, inputWidth);
    this.scaleService.publishCoordinates(p);
  }

  private moveInputIfItEclipsesPoint(inputCoords: Point, inputHeight: number, inputWidth: number): void {
    this.pointsArray.forEach((point: Point) => {
      if (point.x - 22 >= inputCoords.x && point.x - 25 <= inputCoords.x + inputWidth && point.y >= inputCoords.y && point.y <= inputCoords.y + inputHeight) {
        inputCoords.y -= (inputHeight + this.END_SIZE);
      }
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
    this.scaleInput.publishScale(this.scale);
    this.scaleHint.publishScale(this.scale);
    this.updateScaleGroup();
  }
}
