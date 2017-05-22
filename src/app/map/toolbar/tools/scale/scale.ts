import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {MeasureEnum, Scale} from './scale.type';
import {Line, Point} from '../../../map.type';
import {FloorService} from '../../../../floor/floor.service';
import {Floor} from '../../../../floor/floor.type';
import {ActivatedRoute, Params} from '@angular/router';
import {logger} from "codelyzer/util/logger";
// import {Scale} from './scale.type';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements Tool, OnInit {
  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String = 'Click at map to set scale.';
  private scale: Scale;  // use for scale data
  private pointsArray: Array<Point> = [];
  private linesArray: Array<Line> = [];
  public active: boolean = false;
  public isScalaDisplayed: boolean = false;
  public isScalaSet: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.SCALE; // used in hint-bar component as a toolName
  private line;
  private start;
  private stop;
  /*private buildingId;
   private complexId;*/
  private floorId;
  private floor: Floor;


  constructor(private translate: TranslateService,
              private floorService: FloorService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        this.floorId = +params['floorId'];
        console.log(this.floorId);
        this.floorService.getFloor(this.floorId).subscribe((result: any) => {
          // console.log(result);
          this.scale = result.scale;
          if (this.scale != null) {
            this.drawInitialScale();
          }
        });
      });
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
    this.isScalaDisplayed = false;

    d3.select('#map').style('cursor', 'default');
    d3.select('#pointGroup').remove();
    d3.select('#mapBg').on('click', null);
  }

  private startDrawingScale = (): void => {
    const scaleComponent = this;
    document.getElementById('map-container').addEventListener("scroll", this.onScroll);

    // console.log((<HTMLInputElement>document.getElementById('scaleInput')));
    d3.select('#scaleInput').attr('top', '0px');

    const mapBg = d3.select('#mapBg');
    mapBg.style('cursor', 'crosshair');
    mapBg.on('click', function () {
      scaleComponent.addPoint();
    });

    const map = d3.select('#map')
      .append('g')
      .attr('id', 'pointGroup');

    this.redrawPoints();
    this.redrawLine();
  };

  private onScroll = (): void => {
    this.setInputPosition();
  }

  private drawInitialScale() {
    console.log(this.scale);
    this.pointsArray.push(this.scale.start);
    this.start = this.redrawPoints();
    console.log(this.start);
    this.pointsArray.push(this.scale.stop);
    this.stop = this.redrawPoints();
    // this.isScalaDisplayed = true;
    this.linesArray.push(this.createLine());
    this.createInput();
  }

  private addPoint = (): void => {
    const p = <Point>{
      x: d3.event.offsetX,
      y: d3.event.offsetY
    };

    if (this.start == null) {
      this.pointsArray.push(p);
      this.start = this.redrawPoints();
    } else if (this.stop == null) {
      this.pointsArray.push(p);
      this.stop = this.redrawPoints();
      const l = this.createLine();
      this.linesArray.push(l);
      this.redrawLine();

      this.createInput();
    }
  };

  private redrawPoints = (): any => {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');

    const points = group.selectAll('circle');
    const newCircle = points.data(this.pointsArray).enter()
      .append('svg:circle')
      .attr('id', 'point')
      .datum(function (d) {
        d.lines = [];
        return d;
      })
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      })
      .attr('r', 14)
      .style('fill', 'black')
      .style('stroke', 'yellow')
      .on('mouseover', function () {
        d3.select(this).attr('fill-opacity', 0.3);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill-opacity', 1);
      })
      .on('click', function (d) {
        console.log(d3.select(this).datum());
      })
      .call(d3.drag()
        .on('drag', function () {
          scaleComponent.pointDrag(d3.select(this));
        }));
    return newCircle;
  };

  private createLine = (): Line => {
    return <Line>{
      p1: this.pointsArray[0],
      p2: this.pointsArray[1]
    };
  };


  private redrawLine = (): void => {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');

    const lines = group.selectAll('line');
    const newLine = lines.data(this.linesArray).enter()
      .append('svg:line')
      .attr('x1', function (d) {
        scaleComponent.isScalaDisplayed = true;
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
      .attr('stroke-width', 5)
      .attr('stroke', 'green');

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
  };

  private createInput = (): void => {
    const scaleComponent = this;
    const inputElement = (<HTMLInputElement>document.getElementById('scaleInput'));
    const scaleInput = d3.select(inputElement);
    scaleInput.on('keypress', function () {
      if (d3.event.keyCode === 13) {
        scaleComponent.submitScale();
      }
    });
    this.setInputPosition();
  };

  private submitScale = (): void => {
    const unit = (<HTMLInputElement>document.getElementById('unit')).value;
    let measure;
    if (unit === 'cm') {
      measure = MeasureEnum.CENTIMETERS;
    } else if (unit === 'm') {
      measure = MeasureEnum.METERS;
    }
    const length: string = (<HTMLInputElement>document.getElementById('scaleInput')).value;
    const p1 = <Point>{
      x: this.start.attr('cx'),
      y: this.start.attr('cy')
    };
    const p2 = <Point>{
      x: this.stop.attr('cx'),
      y: this.stop.attr('cy')
    };
    this.scale = this.createScale(p1, p2, length, measure);
    this.isScalaSet = true;
    // I'm sending Scale but receiving whole Floor
    this.floorService.setScale(this.floorId, this.scale).subscribe((floor: Floor) => {
      alert('Scala saved');
    });
    this.redrawInput();
  };

  private createScale = (p1: Point, p2: Point, num: string, unit: number): Scale => {
    return <Scale>{
      start: p1,
      stop: p2,
      realDistance: parseFloat(num),
      measure: unit
    };
  };

  private redrawInput = (): void => {
    this.setInputPosition();
  };

  private setInputPosition = (): void => {
    let scale;
    scale = (<HTMLInputElement>document.getElementById('scaleInput'));
    const unitSelect = (<HTMLInputElement>document.getElementById('unit'));
    const mapToolbar = document.getElementsByClassName('map-toolbar');
    const canvas = document.getElementById('map-container');//fin by id map toolbar

    const x = (parseInt(this.linesArray[0].p1.x.toString(), 10) + parseInt(this.linesArray[0].p2.x.toString(), 10)) / 2 + 110 - 30 - canvas.scrollLeft;
    const y = (parseInt(this.linesArray[0].p1.y.toString(), 10) + parseInt(this.linesArray[0].p2.y.toString(), 10)) / 2 - 30 - canvas.scrollTop;


    scale.style.top = y.toString(10) + 'px';
    scale.style.left = x.toString(10) + 'px';
    scale.style.width = '70px';
    unitSelect.style.top = y.toString(10) + 'px';
    unitSelect.style.left = (x + 75).toString(10) + 'px';
  };


}
