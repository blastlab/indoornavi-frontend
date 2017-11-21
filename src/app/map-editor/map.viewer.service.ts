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

        const map = d3.select('#map-layout'),
              g = map.append('g'),
              zoomed = () => {
                g.attr('transform', d3.event.transform);
              };

        map
          .attr('width', image.width)
          .attr('height', image.height)
          .append('defs')
          .append('pattern')
          .attr('id', 'map')
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', image.width)
          .attr('height', image.height)
          .append('image')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height);

        g.append('rect')
          .attr('width', image.width)
          .attr('height', image.height)
          .style('fill', 'url(#map)');

        map
          .append('rect')
          .attr('width', image.width)
          .attr('height', image.height)
          .style('fill', 'none')
          .style('pointer-events', 'all')
          .call(d3.zoom()
            .scaleExtent([MapViewerService.maxZoomOut(image.width, image.height), 1])
            // todo: calculation of translateExtent to be set according to page layout
            .translateExtent([[-window.innerWidth + 1000, -window.innerHeight + 400], [image.width * 2, image.height * 2]])
            .on('zoom', zoomed));

        resolve(map);
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
