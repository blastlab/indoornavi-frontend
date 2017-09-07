import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {MapViewerService} from './map.viewer.service';

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
              private mapViewerService: MapViewerService) {
  }

  ngOnInit(): void {
    this.mapViewerService.drawMap(this.floor).then((result: boolean) => {
      this.imageLoaded = result;
      this.mapLoaderInformer.publishIsLoaded();
    });
  }
}
