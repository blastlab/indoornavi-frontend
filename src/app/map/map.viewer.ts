import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Config} from '../../config';
import * as d3 from 'd3';
import {Floor} from '../floor/floor.type';

@Component({
  selector: 'app-map-viewer',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapViewerComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() floor: Floor;

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
  }
}
