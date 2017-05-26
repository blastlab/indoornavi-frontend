import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Config} from '../../config';
import * as d3 from 'd3';
import {Floor} from '../floor/floor.type';
import {Point, Line} from './map.type';

@Component({
  selector: 'app-map-viewer',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapViewerComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() floor: Floor;
  protected pointsTable: Array<Point> = [];

  ngOnInit(): void {
    this.drawImageOnCanvas();
  }

  drawImageOnCanvas(): void {
    const imageUrl = Config.API_URL + 'images/' + this.floor.imageId;
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      this.setupSVG(image.width, image.height);
    };
    image.src = imageUrl;
  }

  private setupSVG = (width: number, height: number): void => {
    d3.select('#map-container').append('svg')
      .attr('id', 'map')
      .attr('width', width)
      .attr('height', height);

    d3.select('#map').append('rect')
      .attr('id', 'mapBg')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0);
    this.redrawMap();
  };
  private redrawMap = (): void => {
    this.drawPoints();
  };
  private drawPoints = (): void => {
    const points = d3.select('#map').selectAll('circle');
    points.data(this.pointsTable).enter()
      .append('svg:circle')
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      })
      .attr('r', 10)
      .style('fill', 'black')
      .style('stroke', 'yellow')
      .style('opacity', 0.6);
    points.exit()
      .remove();
  }
}
