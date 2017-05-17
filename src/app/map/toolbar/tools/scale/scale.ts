import {Component, EventEmitter, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Scale} from './scale.type';
import {Line, Point} from "../../../map.type";
// import {Scale} from './scale.type';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements Tool {
  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String = 'Click at map to set scale.';
  private scaleArray: Scale;  // use for scale data
  private pointsArray: Array<Point> = [];
  private linesArray: Array<Line> = [];
  public active: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.SCALE; // used in hint-bar component as a toolName
  private line;
  private start;
  private stop;


  constructor(private translate: TranslateService) {
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
    d3.select('#map').style('cursor', 'default');
    console.log(d3.select('#pointGroup'));
    d3.select('#pointGroup').remove();
    console.log(d3.select('#pointGroup'));
  }

  private startDrawingScale = (): void => {
    const scaleComponent = this;

    const mapBg = d3.select('#mapBg');
    mapBg.style('cursor', 'crosshair');
    mapBg.on('click', function () {
      scaleComponent.addPoint();
    });

    const map = d3.select('#map')
      .append('g')
      .attr('id', 'pointGroup');

    console.log(d3.select('#pointGroup'));
    this.redrawPoints();
    this.redrawLine();
  };

  private addPoint = (): void => {
    const p = <Point>{
      x: d3.event.offsetX,
      y: d3.event.offsetY
    }

    if (this.start == null) {
      this.pointsArray.push(p);
      this.start = this.redrawPoints();
    } else if (this.stop == null) {
      this.pointsArray.push(p);
      this.stop = this.redrawPoints();
      const l = this.createLine();
      this.linesArray.push(l);
      this.redrawLine()
      // this.line = this.drawLine();
      // this.createScale();

      this.createInput();
    }
  }

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
      .call(d3.drag()
        .on('drag', function () {
          scaleComponent.pointDrag(d3.select(this));
        }));
    return newCircle;
  }

  private createLine = (): Line => {
    return <Line>{
      p1: this.pointsArray[0],
      p2: this.pointsArray[1]
    }
  }


  private createScale = (): void => {
    const p1 = <Point>{
      x: this.start.attr('cx'),
      y: this.start.attr('cy')
    }
    const p2 = <Point>{
      x: this.stop.attr('cx'),
      y: this.stop.attr('cy')
    }
    const scale = <Scale>{
      start: p1,
      stop: p2,
      scale: 34,
      measure: 0
    }
  }

  private drawLine() {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');
    const l = group.append('svg:line')
      .datum(function (d) {
        d = scaleComponent.pointsArray;
        return d;
      })
      .attr('x1', function (d) {
        return d[0].x;
      })
      .attr('y1', function (d) {
        return d[0].y;
      })
      .attr('x2', function (d) {
        return d[1].x;
      })
      .attr('y2', function (d) {
        return d[1].y;
      })
      .attr('stroke-width', 5)
      .attr('stroke', 'green')
      .on('click', function (d) {
        console.log(d);
      });
    return l;
  }


  private redrawLine = (): void => {
    const scaleComponent = this;
    const group = d3.select('#pointGroup');

    const lines = group.selectAll('line');
    const newLine = lines.data(this.linesArray).enter()
      .append('svg:line')
      /*.datum(function (d) {
        d.lines = [];
        return d;
      })*/
      .attr('x1', function (d) {
        console.log(d);
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
      .attr('stroke', 'green')
      .on('click', function (d) {
        console.log(d);
      });

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
      })
  };

  private createInput = (): void => {

    const x = (parseInt(this.pointsArray[0].x.toString(), 10) + parseInt(this.pointsArray[1].x.toString(), 10)) / 2;
    const y = (parseInt(this.pointsArray[0].y.toString(), 10) + parseInt(this.pointsArray[1].y.toString(), 10)) / 2;
    const group = d3.select('#pointGroup');
    group
      .append("foreignObject")
      .attr('id', 'scaleInput')
      .attr('x', x)
      .attr('y', y)
      .append("xhtml:body")
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .html('<input type="text" id="scaleInput"/>')
      .on('mouseout', function () {
        // scaleComponent.setScale(line);
      });
  }

  private redrawInput = ():void =>{
    const x = (parseInt(this.pointsArray[0].x.toString(), 10) + parseInt(this.pointsArray[1].x.toString(), 10)) / 2;
    const y = (parseInt(this.pointsArray[0].y.toString(), 10) + parseInt(this.pointsArray[1].y.toString(), 10)) / 2;
    d3.select('#scaleInput')
      .attr('x', x)
      .attr('y', y);
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
}
