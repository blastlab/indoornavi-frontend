import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {MeasureEnum, Scale} from './scale.type';
import {Line, Point} from '../../../map.type';
import {FloorService} from '../../../../floor/floor.service';
import {Floor} from '../../../../floor/floor.type';
import {ActivatedRoute, Params} from '@angular/router';
import {ScaleInputService} from '../../../../utils/scale-input/scale-input.service';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements Tool, OnInit {
  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String = 'Click at map to set scale.';
  public scale: Scale = <Scale>{
    start: null,
    stop: null,
    realDistance: null,
    measure: null
  }; // use for scale data
  private pointsArray: Array<Point> = [];
  private linesArray: Array<Line> = [];
  public active: boolean = false;
  public isScalaDisplayed: boolean = false;
  public isScalaSet: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.SCALE; // used in hint-bar component as a toolName
  private line;
  private start;
  private stop;
  private END_SIZE: number = 5;
  @Input() floor: Floor;

  constructor(private translate: TranslateService,
              private _scaleInput: ScaleInputService) {
  }

  ngOnInit(): void {
    if (!!this.floor.scale) {
      this.drawInitialScale();
      this.isScalaSet = true;
    } else {
      this.isScalaSet = false;
    }
    console.log(this.floor.scale);
  }

  private drawInitialScale(): void {
    this.pointsArray[0] = this.floor.scale.start;
    this.pointsArray[1] = this.floor.scale.stop;
    this.linesArray[0] = this.createLine();
    this.redrawInput();
    this.redrawEndings();

    this._scaleInput.publishScale(this.floor.scale);
  }

  public toolClicked(): void {
    this.setTranslations();
    this.clickedTool.emit(this);
  }

  public setActive(): void {
    this.active = true;
    this.startDrawingScale();
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('click.at.map.to.set.scale').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private hideScale(): void {
    this._scaleInput.publishVisibility(false);

    d3.select('#map').style('cursor', 'default');
    d3.select('#pointGroup').remove();
    d3.select('#mapBg').on('click', null);
  }

  private startDrawingScale = (): void => {
    this._scaleInput.publishVisibility(true);
    const scaleComponent = this;

    const mapBg = d3.select('#mapBg');
    mapBg.style('cursor', 'crosshair');

    if (!this.isScalaSet) {
      mapBg.on('click', function () {
        scaleComponent.addPoint();
      });
    }

    const map = d3.select('#map')
      .append('g')
      .attr('id', 'pointGroup');

    this.redrawPoints();
    this.redrawLine();
    this.redrawEndings();
  };

  private addPoint = (): void => {
    const p = <Point>{
      x: d3.event.offsetX,
      y: d3.event.offsetY
    };

    if (this.start == null) {
      this.pointsArray.push(p);
      this.start = this.redrawPoints();
      this.redrawEndings();
    } else if (this.stop == null) {
      this.pointsArray.push(p);
      const l = this.createLine();
      this.linesArray.push(l);
      this.stop = this.redrawPoints();
      this.redrawLine();
      this.redrawInput();
      this.redrawEndings();
    }
  };

  private createLine = (): Line => {
    return <Line>{
      p1: this.pointsArray[0],
      p2: this.pointsArray[1]
    };
  };

  private redrawPoints = (): any => {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');

    const points = group.selectAll('circle');
    const newCircle = points.data(this.pointsArray).enter()
      .append('svg:circle')
      .attr('id', 'point')
      .style('cursor', 'all-scroll')
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      })
      .attr('r', 14)
      .style('fill', 'black')
      .attr('fill-opacity', 0.1)
      .call(d3.drag()
      // .clickDistance
        .on('drag', function () {
          scaleComponent.pointDrag(d3.select(this));
        })
        .on('end', function () {
          scaleComponent.pointDragEnd();
        }));
    return newCircle;
  };

  private redrawLine = (): void => {
    const group = d3.select('#pointGroup');

    const lines = group.selectAll('#connectLine');
    lines.data(this.linesArray).enter()
      .append('svg:line')
      .attr('id', 'connectLine')
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
  };

  private redrawEndings = (): void => {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');

    const endings = group.selectAll('#endings');
    endings.data(this.pointsArray).enter()
      .append('svg:line')
      .attr('id', 'endings')
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
        const rotation = 90;
        return 'rotate(' + rotation + ' ' + d.x + ' ' + d.y + ')';
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
        const rotation = 90;
        return 'rotate(' + rotation + ' ' + d.x + ' ' + d.y + ')';
      });


  };

  private getLineSlope = (): number => {
    const x1 = this.linesArray[0].p1.x;
    const y1 = this.linesArray[0].p1.y;
    const x2 = this.linesArray[0].p2.x;
    const y2 = this.linesArray[0].p2.y;

    return (y1 - y2) / (x1 - x2);
  };

  private getHorizontalEndingOffset = (): number =>{
    const slope = this.getLineSlope();
    return this.END_SIZE * Math.sin(Math.atan(slope));
  }

  private getVerticalEndingOffset = (): number =>{
    const slope = this.getLineSlope();
    return this.END_SIZE * Math.cos(Math.atan(slope));
  }

  private pointDrag = (circle): void => {
    circle
      .attr('cx', function (d) {
        return d.x = Math.max(0, Math.min(d3.select('#map').attr('width'), d3.event.x));
      })
      .attr('cy', function (d) {
        return d.y = Math.max(0, Math.min(d3.select('#map').attr('height'), d3.event.y));
      });
    this.redrawLine();
    this.redrawInput();
    this.redrawEndings();
  };

  private redrawInput = (): void => {
    const x = (parseInt(this.linesArray[0].p1.x.toString(), 10) + parseInt(this.linesArray[0].p2.x.toString(), 10)) / 2;
    const y = (parseInt(this.linesArray[0].p1.y.toString(), 10) + parseInt(this.linesArray[0].p2.y.toString(), 10)) / 2;

    const p = <Point>{
      x: x,
      y: y
    };

    this._scaleInput.publishCoordinates(p);
  };

  private pointDragEnd(): void {
    this.scale.start = this.pointsArray[0];
    this.scale.stop = this.pointsArray[1];
    this._scaleInput.publishScale(this.scale);
  };
}
