import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import * as d3 from 'd3';
import {MapSvg} from '../map/map.type';

@Injectable()
export class MapViewerService {

  static maxZoomOut(imageWidth: number, imageHeight: number): number {
    const zoomOutWidth: number = window.innerWidth / imageWidth;
    const zoomOutHeight: number = window.innerHeight / imageHeight;
    return (zoomOutWidth < zoomOutHeight) ? zoomOutWidth : zoomOutHeight;
  }

  static maxTranslate(mapContainer: HTMLElement, image: HTMLImageElement): [[number, number], [number, number]] {
    const width = Math.max(mapContainer.offsetWidth, image.width),
      height = Math.max(mapContainer.offsetHeight, image.height);
    if (image.width < mapContainer.offsetWidth && image.height < mapContainer.offsetHeight) {
      return [[-width + image.width, -height + image.height], [width, height]]
    } else {
      return [[-100, -100], [width + 100, height + 100]];
    }
  }

  constructor(private mapService: MapService) {
  }


  drawMap(floor: Floor): Promise<d3.selection> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {

        const mapContainer = document.getElementById('map-container');

        const zoomed = () => {
          g.attr('transform', d3.event.transform);
          // const transformation: Transform = d3.zoomTransform(document.getElementById('map-upper-layer'));
          // this.mapService.publishMapTransformation(transformation);
        };

        const zoom = d3.zoom()
          .scaleExtent([1, 2])
          .translateExtent(MapViewerService.maxTranslate(mapContainer, image))
          .on('zoom', zoomed);

        const map = d3
          .select('#map-upper-layer')
          .attr('width', mapContainer.offsetWidth)
          .attr('height', mapContainer.offsetHeight);

        const g = map.append('g');

        g
          .attr('id', 'map')
          .append('svg:image')
          .attr('id', 'map-img')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height);

        zoom
          .translateBy(map, (mapContainer.offsetWidth - image.width) / 2, (mapContainer.offsetHeight - image.height) / 2);
        map.call(zoom);

        window.addEventListener('resize', () => {
          zoom.translateExtent(MapViewerService.maxTranslate(mapContainer, image));
          map.call(zoom);
          map
            .attr('width', mapContainer.offsetWidth)
            .attr('height', mapContainer.offsetHeight);
        });

        resolve(<MapSvg>{ layer: map, container: g });
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
