import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Floor} from '../floor/floor.type';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {MapService} from './map.service';
import {AnchorPlacerController} from './toolbar/tools/anchor/anchor.controller';
import {Anchor} from '../anchor/anchor.type';
import {Sink} from '../sink/sink.type';

@Component({
  selector: 'app-map-viewer',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapViewerComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() floor: Floor;
  imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private mapService: MapService,
              private anchorTool: AnchorPlacerController) {
  }

  ngOnInit(): void {
    this.drawImageOnCanvas();
  }

  drawImageOnCanvas(): void {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      this.setupSVG(image.width, image.height);
      this.imageLoaded = true;
    };
    this.mapService.getImage(this.floor.imageId).subscribe((blob: Blob) => {
      image.src = URL.createObjectURL(blob);
    });
  }

  private setupSVG(width: number, height: number): void {
    d3.select('#map-container').append('svg')
      .attr('id', 'map')
      .attr('width', width)
      .attr('height', height);
    d3.select('#map').append('rect')
      .attr('id', 'mapBackground')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0);
    this.mapLoaderInformer.publishIsLoaded();
    this.prepareScaleHint();
  }

  private prepareScaleHint(): void {
    const scaleHint = d3.select('#scaleHint');
    scaleHint
      .on('mouseover', function () {
        d3.select('#scaleGroup').style('display', 'flex');
      })
      .on('mouseout', function () {
        d3.select('#scaleGroup').style('display', 'none');
      });
  }

  droppedObject(event) {
    if (isAnchorType(event.dragData)) {
      this.anchorTool.setChosenAnchor(event.dragData);
      this.anchorTool.setCoordinates({x: event.mouseEvent.offsetX, y: event.mouseEvent.offsetY});
    }
    function isAnchorType(checkType: any): boolean {
      return (<Anchor>checkType.verified) !== undefined;
    }
  }

}
