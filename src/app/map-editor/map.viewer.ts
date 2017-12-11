import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Floor} from '../floor/floor.type';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {MapViewerService} from './map.viewer.service';
import {DevicePlacerController} from './tool-bar/tools/device-placer/device-placer.controller';

@Component({
  selector: 'app-map-viewer',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapViewerComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() floor: Floor;
  private imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private devicePlacerController: DevicePlacerController,
              private mapViewerService: MapViewerService) {
  }

  ngOnInit(): void {
    this.mapViewerService.drawMap(this.floor).then((result: boolean) => {
      this.imageLoaded = result;
      this.mapLoaderInformer.publishIsLoaded();
    });
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
    const pDragType = event.dataTransfer.getData('text');
    if (pDragType === 'devices') {
      this.devicePlacerController.deviceDropped();
      this.devicePlacerController.setCoordinates(
        {x: event.offsetX, y: event.offsetY});
    }
  }

}