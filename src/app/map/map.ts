import {Component, Input, OnInit} from '@angular/core';
import {MapViewerService} from '../map-editor/map.editor.service';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {Floor} from '../floor/floor.type';
import * as d3 from 'd3';

@Component({
  selector: 'app-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  @Input() floor: Floor;
  private imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private mapViewerService: MapViewerService) {
  }

  ngOnInit(): void {
    this.mapViewerService.drawMap(this.floor).then((d3map: d3.selection) => {
      this.imageLoaded = true;
      this.mapLoaderInformer.publishIsLoaded(d3map);
    });
  }
}
