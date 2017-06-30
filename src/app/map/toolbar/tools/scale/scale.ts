import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Scale} from './scale.type';
import {Line, Point} from '../../../map.type';
import {Floor} from '../../../../floor/floor.type';
import {ScaleInputService} from '../../../../utils/scale-input/scale-input.service';
import {ScaleHintService} from '../../../../utils/scale-hint/scale-hint.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {promise} from 'selenium-webdriver';
import fullyResolved = promise.fullyResolved;

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements Tool, OnDestroy, OnInit {

  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String;
  public scale: Scale = <Scale>{
    start: null,
    stop: null,
    realDistance: null,
    measure: null
  };
  private pointsArray: Array<Point> = [];
  private linesArray: Array<Line> = [];
  public active: boolean = false;
  public isScaleDisplayed: boolean = false;
  public isScaleSet: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.SCALE; // used in hint-bar component as a toolName
  private line;
  private start;
  private stop;
  private END_SIZE: number = 5;
  private subscription: Subscription;
  @Input() floor: Floor;

  constructor(private translate: TranslateService,
              private _scaleInput: ScaleInputService,
              private _scaleHint: ScaleHintService,
              private _mapLoaderInformer: MapLoaderInformerService) {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this._mapLoaderInformer.isLoaded$.subscribe(isSvgLoaded => {
      if (isSvgLoaded) {
        this.createSvgGroupWithScale();
      }
    });

    this._scaleInput.saveClicked$.subscribe(isSaveClicked => {
      if (isSaveClicked) {
        this.clickedTool.emit(this);
      }
    });

    this._scaleInput.removeClicked$.subscribe(nullScale => {
      this.isScaleSet = false;
      this.isScaleDisplayed = false;
      this.scale = nullScale;
      this.pointsArray = [];
      this.linesArray = [];
      this.line = null;
      this.start = null;
      this.stop = null;
      this.startCreatingScale();
    });
  }

  private createSvgGroupWithScale(): void {
    if (!!this.floor.scale) {
      this.isScaleSet = true;
      this.scale = (JSON.parse(JSON.stringify(this.floor.scale)));
      const map = d3.select('#map')
        .append('g')
        .attr('id', 'scaleGroup')
        .style('display', 'none');
      this.drawScaleFromDB();
    }
    this._scaleHint.publishScale(this.floor.scale);
  }

  private drawScaleFromDB(): void {
    this.pointsArray[0] = this.scale.start;
    this.pointsArray[1] = this.scale.stop;
    this.linesArray[0] = this.createLine();
    this.redrawLine();
    this.redrawEndings();
    this.redrawInput();
    this._scaleInput.publishScale(this.floor.scale);
  }

  public toolClicked(): void {
    this.setTranslations();
    this.clickedTool.emit(this);
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('click.at.map.to.set.scale').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  public setActive(): void {
    this.active = true;
    this.startCreatingScale();
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
  }

  private startCreatingScale(): void {
    const scaleComponent = this;
    d3.select('#scaleGroup').style('display', 'flex');
    d3.select('#scaleHint')
      .on('mouseover', null)
      .on('mouseout', null);

    const mapBg = d3.select('#mapBg');
    mapBg.style('cursor', 'crosshair');

    if (!this.isScaleSet) {
      mapBg.on('click', function () {
        scaleComponent.addPoint();
      });
    }

    (!this.isScaleSet) ? this._scaleInput.publishVisibility(false) : this._scaleInput.publishVisibility(true);

    if (this.isScaleDisplayed) {
      this._scaleInput.publishVisibility(true);
    }

    const scaleGroup = d3.select('#scaleGroup');
    if (!scaleGroup.empty()) {
      scaleGroup.style('display', 'flex');
    } else {
      d3.select('#map').append('g')
        .attr('id', 'scaleGroup')
        .style('display', 'flex');
    }

    this.redrawLine();
    this.redrawEndings();
    this.redrawPoints();
  }

  private hideScale(): void {
    this._scaleInput.publishVisibility(false);

    d3.select('#mapBg').style('cursor', 'default');
    d3.select('#scaleGroup').style('display', 'none');
    d3.select('#mapBg').on('click', null);
    d3.select('#scaleHint')
      .on('mouseover', function () {
        d3.select('#scaleGroup').style('display', 'flex');
      })
      .on('mouseout', function () {
        d3.select('#scaleGroup').style('display', 'none');
      });
  }

  private addPoint(): void {
    const point = <Point>{
      x: d3.event.offsetX,
      y: d3.event.offsetY
    };

    if (this.start == null) {
      this.pointsArray.push(point);
      this.start = this.redrawPoints();
      this.redrawEndings();
    } else if (this.stop == null) {
      this.pointsArray.push(point);
      this.linesArray.push(this.createLine());
      const mouseEvent = window.event as MouseEvent;
      if (mouseEvent.shiftKey) {
        this.blockOneDimension(point);
      }
      this.setScalePoints();
      this.stop = this.redrawPoints();
      this.redrawSvgObjects();
      this.setScaleVisible();
      d3.select('#scaleGroup').style('display', 'flex');
    }
  }

  private blockOneDimension(point): void {
    const slope: number = this.getLineSlope();
    if (slope < 1 && slope > -1) {
      point.y = this.pointsArray[0].y;
    } else {
      point.x = this.pointsArray[0].x;
    }
  }

  private redrawSvgObjects(): void {
    this.redrawLine();
    this.redrawInput();
    this.redrawEndings();
    this.redrawPoints();
  }

  private setScaleVisible(): void {
    this.isScaleDisplayed = true;
    this._scaleInput.publishVisibility(this.isScaleDisplayed);
  }


  private getLineSlope(): number {
    if (this.linesArray.length === 0) {
      return 0;
    }
    const x1 = this.linesArray[0].p1.x;
    const y1 = this.linesArray[0].p1.y;
    const x2 = this.linesArray[0].p2.x;
    const y2 = this.linesArray[0].p2.y;

    return (y1 - y2) / (x1 - x2);
  }

  private getPotentialLineSlope(x1, y1, x2, y2): number {
    return (y1 - y2) / (x1 - x2);
  }

  private createLine(): Line {
    return <Line>{
      p1: this.pointsArray[0],
      p2: this.pointsArray[1]
    };
  }

  redrawPoints(): any {
    const scaleComponent = this;
    const group = d3.select('#scaleGroup');

    const drag = d3.drag()
      .on('drag', function () {
        scaleComponent.pointDrag(d3.select(this));
      })
      .on('end', function () {
        scaleComponent.setScalePoints();
      });

    const points = group.selectAll('circle');
    const newCircle = points.data(this.pointsArray).enter()
      .append('svg:circle')
      .classed('point', true)
      .style('cursor', 'all-scroll')
      .style('z-index', 0)
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d, i) {
        return d.y;
      })
      .attr('r', 10)
      .style('fill', 'black')
      .attr('fill-opacity', 0)
      .call(drag);
    return newCircle;
  }

  private setScalePoints(): void {
    this.scale.start = this.pointsArray[0];
    this.scale.stop = this.pointsArray[1];
    this._scaleInput.publishScale(this.scale);
  }

  private redrawLine(): void {
    const group = d3.select('#scaleGroup');

    const lines = group.selectAll('.connectLine');
    lines.data(this.linesArray).enter()
      .append('svg:line')
      .classed('connectLine', true)
      .style('cursor', 'crosshair')
      .attr('x1', function (d) {
        return d.p1.x;
      })
      .attr('y1', function (d) {
        return d.p1.y;
      })
      .attr('x2', function (d) {
        return d.p2.x;
      })
      .attr('y2', function (d) {
        return d.p2.y;
      })
      .attr('stroke-width', 1)
      .attr('stroke', 'black');

    // update positions of old lines
    lines
      .attr('x1', function (d) {
        return d.p1.x;
      })
      .attr('y1', function (d) {
        return d.p1.y;
      })
      .attr('x2', function (d) {
        return d.p2.x;
      })
      .attr('y2', function (d) {
        return d.p2.y;
      });
  }

  private redrawEndings(): void {
    const scaleComponent = this;
    const group = d3.select('#scaleGroup');

    const endings = group.selectAll('.endings');
    endings.data(this.pointsArray).enter()
      .append('svg:line')
      .classed('endings', true)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('x1', function (d) {
        return d.x + scaleComponent.getVerticalEndingOffset();
      })
      .attr('y1', function (d) {
        return d.y + scaleComponent.getHorizontalEndingOffset();
      })
      .attr('x2', function (d) {
        return d.x - scaleComponent.getVerticalEndingOffset();
      })
      .attr('y2', function (d) {
        return d.y - scaleComponent.getHorizontalEndingOffset();
      })
      .attr('transform', function (d) {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });

    endings
      .attr('x1', function (d) {
        return d.x + scaleComponent.getVerticalEndingOffset();
      })
      .attr('y1', function (d) {
        return d.y + scaleComponent.getHorizontalEndingOffset();
      })
      .attr('x2', function (d) {
        return d.x - scaleComponent.getVerticalEndingOffset();
      })
      .attr('y2', function (d) {
        return d.y - scaleComponent.getHorizontalEndingOffset();
      })
      .attr('transform', function (d) {
        return 'rotate(' + 90 + ' ' + d.x + ' ' + d.y + ')';
      });
  }

  private getHorizontalEndingOffset(): number {
    const slope = this.getLineSlope();
    if (isNaN(slope)) {
      return;
    }
    return this.END_SIZE * Math.sin(Math.atan(slope));
  }

  private getVerticalEndingOffset(): number {
    const slope = this.getLineSlope();
    if (isNaN(slope)) {
      return;
    }
    return this.END_SIZE * Math.cos(Math.atan(slope));
  }

  private pointDrag(circle): void {
    if (this.pointsArray.length < 2) {
      return;
    }
    const mouseEvent = window.event as MouseEvent;
    if (mouseEvent.shiftKey) {
      this.dragPointWithShift(circle);

    } else {
      circle
        .attr('cx', function (d) {
          return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), d3.event.x));
        })
        .attr('cy', function (d) {
          return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
        });
    }
    this.redrawSvgObjects();
  }

  private dragPointWithShift(circle): void {
    const secondPoint = this.chooseNotDraggedPoint(circle);
    const potentialSlope: number = this.getPotentialLineSlope(secondPoint.x, secondPoint.y, d3.event.x, d3.event.y);
    const upperSlope = 3;
    const lowerSlope = 0.558; // arctan(22.5°)
    if (Math.abs(potentialSlope) < lowerSlope) {
      circle
        .attr('cx', function (d) {
          return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), d3.event.x));
        })
        .attr('cy', function (d) {
          return d.y = secondPoint.y;
        });
    } else if (Math.abs(potentialSlope) > upperSlope) {
      circle
        .attr('cx', function (d) {
          return d.x = secondPoint.x;
        })
        .attr('cy', function (d) {
          return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
        });
    } else if (potentialSlope < upperSlope && potentialSlope > lowerSlope) {
      circle
        .attr('cx', function (d) {
          return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), secondPoint.x + ( d3.event.y - secondPoint.y)));
        })
        .attr('cy', function (d) {
          return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
        });
    } else if (potentialSlope > -upperSlope && potentialSlope < -lowerSlope) {
      circle
        .attr('cx', function (d) {
          return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), secondPoint.x - ( d3.event.y - secondPoint.y)));
        })
        .attr('cy', function (d) {
          return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
        });
    }
  }

  private chooseNotDraggedPoint(circle): Point {
    const point: Point = <Point>{
      x: 0,
      y: 0
    };
    if (this.scale.start.x === Number(circle.attr('cx')) && this.scale.start.y === Number(circle.attr('cy'))) {
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

    const inputHeight = 50;
    const inputWidth = 370;

    const x = Math.max(0, Math.min(tempX, d3.select('#map').attr('width') - inputWidth));
    const y = Math.max(inputHeight, Math.min(tempY, d3.select('#map').attr('height') - inputHeight));
    const p = <Point>{
      x: x,
      y: y
    };
    this.checkIfInputEclipsesPoints(p, inputHeight, inputWidth);
    this._scaleInput.publishCoordinates(p);
  }

  private checkIfInputEclipsesPoints(inputCoords: Point, inputHeight: number, inputWidth: number): void {
    const scaleComponent = this;
    this.pointsArray.forEach(function (point) {
      if (point.x >= inputCoords.x && point.x <= inputCoords.x + inputWidth && point.y >= inputCoords.y && point.y <= inputCoords.y + inputHeight) {
        inputCoords.y -= (inputHeight + scaleComponent.END_SIZE);
      }
    });
  }
}
