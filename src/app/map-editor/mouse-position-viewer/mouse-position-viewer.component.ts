import {Component, OnInit} from '@angular/core';
import {Point} from '../map.type';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {MapSvg} from '../../map/map.type';

@Component({
  selector: 'app-mouse-position-viewer',
  templateUrl: './mouse-position-viewer.component.html',
  styleUrls: ['./mouse-position-viewer.component.css']
})
export class MousePositionViewerComponent implements OnInit {

  mousePosition: Point = <Point>{x: 0, y: 0};
  isMouseOnMap: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService) {
  }

  ngOnInit() {
    this.mapLoaderInformer.loadCompleted().subscribe((mapSvg: MapSvg) => {
      mapSvg.container
        .on('mousemove', () => {
          this.isMouseOnMap = true;
          const position = d3.mouse(mapSvg.container.node());
          this.mousePosition.x = Math.round(position[0]);
          this.mousePosition.y = Math.round(mapSvg.container.node().getBBox().height - position[1]);
        })
        .on('mouseout', () => {
          this.isMouseOnMap = false;
        });
    });
  }

}
