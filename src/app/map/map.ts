import {Component, Input, OnInit} from '@angular/core';
import {MapEditorService} from '../map-editor/map.editor.service';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {Floor} from '../floor/floor.type';
import {MapSvg} from './map.type';
import {ActivatedRoute, Data, Params} from '@angular/router';
import {MapClickService} from '../shared/services/map-click/map-click.service';
import * as d3 from 'd3';
import {DevicePlacerService} from '../map-editor/tool-bar/tools/device-placer/device-placer.service';
import {zip} from 'rxjs/observable/zip';
import {MapService} from '../map-editor/uploader/map.uploader.service';

@Component({
  selector: 'app-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  @Input() floor: Floor;
  @Input() zoom: number = 1;
  public isPublic: boolean = false;
  private imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private mapEditorService: MapEditorService,
              private devicePlacerService: DevicePlacerService,
              private mapClick: MapClickService,
              protected route: ActivatedRoute,
              private mapService: MapService) {
  }

  ngOnInit(): void {
    zip(this.route.data, this.route.queryParams).subscribe((zipped: [Data, Params]) => {
      const data = zipped[0], queryParams = zipped[1];
      this.isPublic = !!(data.isPublic);
      const zoom: number = !!queryParams.zoom ? queryParams.zoom : this.zoom;

      this.mapService.getImage(this.floor.imageId).subscribe((blob: Blob) => {
        this.mapEditorService.drawMap(blob, zoom).first().subscribe((mapSvg: MapSvg) => {
          this.imageLoaded = true;
          this.mapLoaderInformer.publishIsLoaded(mapSvg);

          if (this.isPublic) {
            this.applyOnClickListener(mapSvg);
            this.applyOnTouchesListener(mapSvg);
          }
        });
      });
    });
  }

  redrawImage(blobImage: Blob, zoom: number = this.zoom): void {
    d3.select(`#${MapEditorService.MAP_LAYER_SELECTOR_ID}`).remove();
    this.mapEditorService.drawMap(blobImage, zoom).first().subscribe((mapSvg: MapSvg) => {
      this.imageLoaded = true;
      this.mapLoaderInformer.publishIsLoaded(mapSvg);

      if (this.isPublic) {
        this.applyOnClickListener(mapSvg);
        this.applyOnTouchesListener(mapSvg);
      }
    });
  }

  droppedObject(event) {
    const pDragType = event.dataTransfer.getData('text');
    if (pDragType === 'devices') {
      this.devicePlacerService.emitDroppedInside({x: event.offsetX, y: event.offsetY});
    }
  }

  applyOnClickListener(mapSvg: MapSvg) {
    let mouseMove = false;
    let mouseDown = false;
    let timer;

    mapSvg.container
      .on('mousedown', () => {
        mouseDown = true;
        const position: Array<number> = d3.mouse(mapSvg.container.node());
        timer = setTimeout(() => {
          if (mouseDown && !mouseMove) {
            this.mapClick.mapIsClicked({x: Math.round(position[0]), y: Math.round(position[1])});
          }
        }, 800);
      })
      .on('mouseup', () => {
        clearTimeout(timer);
        mouseDown = false;
        mouseMove = false;
      })
      .on('mousemove', () => {
        if (mouseDown) {
          mouseMove = true;
        }
      });
  }

  applyOnTouchesListener(mapSvg: MapSvg) {
    let touchMove = false;
    let touchStart = false;
    let timer;

    mapSvg.container
      .on('touchstart', () => {
        touchStart = true;
        const position: Array<number> = d3.mouse(mapSvg.container.node());
        timer = setTimeout(() => {
          if (touchStart && !touchMove) {
            this.mapClick.mapIsClicked({x: Math.round(position[0]), y: Math.round(position[1])});
          }
        }, 800);
      })
      .on('touchend', () => {
        clearTimeout(timer);
        touchStart = false;
        touchMove = false;
      })
      .on('touchmove', () => {
        if (touchStart) {
          touchMove = true;
        }
      });
  }

}
