import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import * as d3 from 'd3';

@Injectable()
export class MapViewerService {

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
        };
        const map = d3.select('#map-upper-layer')
            .attr('width', image.width)
            .attr('height', image.height)
          .call(d3.zoom()
            .scaleExtent([MapViewerService.maxZoomOut(image.width, image.height), 1])
            // todo: calculation of translateExtent to be set according to page layout,
            .translateExtent([[-window.innerWidth + 100 , -window.innerHeight + 100], [image.width * 2, image.height * 2]])
            .on('zoom', zoomed));

        const g = map.append('g');

        g.attr('id', 'map')
          .append('svg:image')
          .attr('id', 'map-img')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height)
          .style('pointer-events', 'all').on('click', () => {
              map.select('#map-upper-layers').style('pointer-events', 'none');
              console.log('clicked');
          });

        resolve(map);
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
