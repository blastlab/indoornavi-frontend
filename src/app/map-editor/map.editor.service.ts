import {Injectable} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapService} from './uploader/map.uploader.service';
import * as d3 from 'd3';
import {MapSvg} from '../map/map.type';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Transform} from './map.type';

@Injectable()
export class MapEditorService {

  public static MAX_ZOOM_VALUE: number = 2;
  public static MIN_ZOOM_VALUE: number = 0.1;

  public static MAP_LAYER_SELECTOR_ID: string = 'map';
  public static MAP_UPPER_LAYER_SELECTOR_ID: string = 'map-upper-layer';
  private static MAP_CONTAINER_SELECTOR_ID: string = 'map-container';
  private transformation: Transform = {x: 0, y: 0, k: 1};
  private transformationInformer = new Subject<Transform>();

  static maxTranslate(mapContainer: HTMLElement, image: HTMLImageElement): [[number, number], [number, number]] {
    const width = Math.max(mapContainer.offsetWidth, image.width),
      height = Math.max(mapContainer.offsetHeight, image.height);
    if (image.width < mapContainer.offsetWidth && image.height < mapContainer.offsetHeight) {
      return [[-width + image.width, -height + image.height], [width, height]]
    } else {
      return [[-100, -100], [width + 100, height + 100]];
    }
  }

  mapIsTransformed(): Observable<Transform> {
    return this.transformationInformer.asObservable();
  }

  changeTransformation(transformation: Transform): void {
    this.transformationInformer.next(transformation);
  }

  constructor(private mapService: MapService) {
  }

  drawMap(floor: Floor, zoomValue: number): Promise<d3.selection> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {

        const mapContainer = document.getElementById(MapEditorService.MAP_CONTAINER_SELECTOR_ID);

        const zoomed = () => {
          g.attr('transform', d3.event.transform);
          this.transformation = d3.zoomTransform(document.getElementById(MapEditorService.MAP_UPPER_LAYER_SELECTOR_ID));
          this.changeTransformation(this.transformation);
        };

        const zoom = d3.zoom()
          .scaleExtent([MapEditorService.MIN_ZOOM_VALUE, MapEditorService.MAX_ZOOM_VALUE])
          .translateExtent(MapEditorService.maxTranslate(mapContainer, image))
          .on('zoom', zoomed);

        const map = d3.select(`#${MapEditorService.MAP_UPPER_LAYER_SELECTOR_ID}`)
          .attr('width', mapContainer.offsetWidth)
          .attr('height', mapContainer.offsetHeight);

        const g = map.append('g');

        g.attr('id', MapEditorService.MAP_LAYER_SELECTOR_ID)
          .append('svg:image')
          .attr('id', 'map-img')
          .attr('xlink:href', image.src)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', image.width)
          .attr('height', image.height);

        zoom.translateBy(map, (mapContainer.offsetWidth - image.width) / 2, (mapContainer.offsetHeight - image.height) / 2);
        zoom.scaleTo(map, zoomValue);
        map.call(zoom);
        map.on('dblclick.zoom', null);

        window.addEventListener('resize', () => {
          zoom.translateExtent(MapEditorService.maxTranslate(mapContainer, image));
          map.call(zoom);
          map
            .attr('width', mapContainer.offsetWidth)
            .attr('height', mapContainer.offsetHeight);
        });

        resolve(<MapSvg>{layer: map, container: g});
      };
      this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
        image.src = URL.createObjectURL(blob);
      });
    });
  }
}
