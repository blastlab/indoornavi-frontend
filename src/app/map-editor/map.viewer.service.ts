import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import * as d3 from 'd3';
import {Transform} from './map.type';

@Injectable()
export class MapViewerService {
  private scaleIsInDrawingProcess: boolean = false;

  static maxZoomOut (imageWidth: number, imageHeight: number): number {
    const zoomOutWidth: number = window.innerWidth / imageWidth;
    const zoomOutHeight: number = window.innerHeight / imageHeight;
    return (zoomOutWidth < zoomOutHeight) ? zoomOutWidth : zoomOutHeight;
  }

  constructor(private mapService: MapService) {
  }


  drawMap(floor: Floor): Promise<d3.selection> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const zoomed = () => {
          g.attr('transform', d3.event.transform);
          const transformation: Transform = d3.zoomTransform(document.getElementById('map-upper-layer'));
          this.mapService.publishMapTransformation(transformation);
        };

        // this.mapService.scaleIsInDrawingProcess().subscribe(() => {
        //   zoom.on('zoom', null);
        // });

        // todo:
        // calculation of translateExtent to be set according to page layout, and image size,
        const zoom = d3.zoom()
          .scaleExtent([MapViewerService.maxZoomOut(image.width, image.height), 1])
          .translateExtent([[-window.innerWidth + 100 , -window.innerHeight + 100], [image.width * 2, image.height * 2]])
          .on('zoom', zoomed);

        const map = d3
          .select('#map-upper-layer')
          .attr('width', image.width)
          .attr('height', image.height)
          .call(zoom)
          .style('pointer-events', 'all');

        const g = map.append('g');

        g.attr('id', 'map')
          .append('svg:image')
          .attr('id', 'map-img')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height);

        resolve(map);
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
