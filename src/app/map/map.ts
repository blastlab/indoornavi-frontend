import {Component, Input, OnInit} from '@angular/core';
import {MapEditorService} from '../map-editor/map.editor.service';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {Floor} from '../floor/floor.type';
import {MapSvg} from './map.type';
import {ActivatedRoute, Data} from '@angular/router';
import {DevicePlacerController} from '../map-editor/tool-bar/tools/devices/device-placer.controller';
import {MapClickService} from '../shared/services/map-click/map-click.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  @Input() floor: Floor;
  public isPublic: boolean = false;
  private imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private mapEditorService: MapEditorService,
              private devicePlacerController: DevicePlacerController,
              private mapClick: MapClickService,
              protected route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: Data) => {
      this.isPublic = !!(data.isPublic);
    });
    this.mapEditorService.drawMap(this.floor).then((mapSvg: MapSvg) => {
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
      this.devicePlacerController.sendCoordinatesChanged({x: event.offsetX, y: event.offsetY});
    }
  }

  applyOnClickListener(mapSvg: MapSvg) {
    let mouseMove = false;
    let mouseDown = false;
    let timer = 0;

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
    let timer = 0;

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
