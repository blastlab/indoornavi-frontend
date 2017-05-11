import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
// import {Scale} from './scale.type';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements OnInit, Tool {
  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  // private scale: Scale;
  public active: boolean = false;
  public toolEnum: ToolsEnum;
  constructor() { }

  ngOnInit() {

  }
  public toolClicked(): void {
    this.clickedTool.emit(this);
  }
  public setActive(): void {
    this.active = true;
    this.startDrawingScale();
  }
  public setInactive(): void {
    this.hiDelScale();
    this.active = false;
  }
  private startDrawingScale(): void {
    d3.select('#map').style('cursor', 'crosshair');
    d3.select('#map')
      .append('svg:circle')
      .attr('cx', 400)
      .attr('cy', 400)
      .attr('r', 10)
      .style('fill', 'black')
      .style('stroke', 'yellow')
      .style('opacity', 0.6);
  }
  private hiDelScale(): void {
    d3.select('#map').selectAll('circle').remove();
  }
}
