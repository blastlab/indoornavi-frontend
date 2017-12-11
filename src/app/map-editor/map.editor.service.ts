import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import * as d3 from 'd3';
import {Point, Transform} from './map.type';

@Injectable()
export class MapViewerService {

  public static MAP_LAYER_SELECTOR_ID: string = 'map';
  private static MAP_UPPER_LAYER_SELECTOR_ID: string = 'map-upper-layer';
  private static MAP_CONTAINER_SELECTOR_ID: string = 'map-container';

  private transformation: Transform = {x: 0, y: 0, k: 1};

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

        const mapContainer = document.getElementById(MapViewerService.MAP_CONTAINER_SELECTOR_ID);

        const zoomed = () => {
          g.attr('transform', d3.event.transform);
          this.transformation = d3.zoomTransform(document.getElementById(MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID));
        };

        const zoom = d3.zoom()
          .scaleExtent([1, 2])
          .translateExtent(MapViewerService.maxTranslate(mapContainer, image))
          .on('zoom', zoomed);

        const map = d3
          .select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`)
          .attr('width', mapContainer.offsetWidth)
          .attr('height', mapContainer.offsetHeight);

        const g = map.append('g');

        g
          .attr('id', MapViewerService.MAP_LAYER_SELECTOR_ID)
          .append('svg:image')
          .attr('id', 'map-img')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height)
          // todo: discus proper cursor for moving and zooming tasks on the map
          .on('mousedown', () => {
            d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).style('cursor', 'move')
          })
          .on('mouseup', () => {
          d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`).style('cursor', 'default')
        });

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

        resolve(map);
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }

  calculateTransition (point: Point): Point {
    return {x: (point.x - this.transformation.x) / this.transformation.k, y: (point.y - this.transformation.y) / this.transformation.k};
  }
  calculateInMapEditorRangeEvent(point: Point, offset: Point[]): Point {
    const borderNorthWest: Point = this.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('x'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('y')});
    const borderSouthEast: Point = this.calculateTransition({x: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('width'), y: d3.select(`#${MapViewerService.MAP_UPPER_LAYER_SELECTOR_ID}`).attr('height')});
    point.x = point.x > borderNorthWest.x + offset[0].x ? point.x : borderNorthWest.x + offset[0].x;
    point.x = point.x < borderSouthEast.x + offset[1].x ? point.x : borderSouthEast.x + offset[1].x;
    point.y = point.y > borderNorthWest.y + offset[0].y ? point.y : borderNorthWest.y + offset[0].y;
    point.y = point.y < borderSouthEast.y + offset[1].y ? point.y : borderSouthEast.y + offset[1].y;
    return {x: point.x, y: point.y};
  }
}
