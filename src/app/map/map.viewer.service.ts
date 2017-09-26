import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import * as d3 from 'd3';

@Injectable()
export class MapViewerService {

  constructor(private mapService: MapService) {
  }

  drawMap(floor: Floor): Promise<d3.selection> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const map = d3.select('#map');

        // define pattern to use as fill attribute in rect
        map
          .attr('width', image.width)
          .attr('height', image.height)
          .append('defs')
          .append('pattern')
          .attr('id', 'mapBackground')
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', image.width)
          .attr('height', image.height)
          .append('image')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height);

        // use background image as fill attribute
        map
          .append('rect')
          .attr('width', image.width)
          .attr('height', image.height)
          .attr('fill', 'url(#mapBackground)');

        resolve(map);
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
