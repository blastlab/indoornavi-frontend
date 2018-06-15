import {Component, Input, OnInit} from '@angular/core';
import {MapEditorService} from '../map-editor/map.editor.service';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {Floor} from '../floor/floor.type';
import {MapSvg} from './map.type';
import {ActivatedRoute, Data} from '@angular/router';
import {DevicePlacerController} from '../map-editor/tool-bar/tools/devices/device-placer.controller';
import {MapClickService} from "../shared/services/map-click/map-click.service";

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
      this.applyOnClickListener(mapSvg);
      this.applyOnTouchesListener(mapSvg);
    });
  }

  droppedObject(event) {
    const pDragType = event.dataTransfer.getData('text');
    if (pDragType === 'devices') {
      this.devicePlacerController.devicePlacement();
      this.devicePlacerController.setCoordinates(
        {x: event.offsetX, y: event.offsetY});
    }
  }

  applyOnClickListener(mapSvg: MapSvg) {
   let isLongClick: boolean = false;
   let mouseMove: boolean = false;
   let mouseDown: boolean = false;

    mapSvg.container
      .on('mousedown', () => {
        mouseDown = true;
         setTimeout(() => {
          if(mouseDown && !mouseMove) {
            isLongClick = true;
          }
        }, 500);
      })
      .on('mouseup', () => {
        mouseDown = false;
        if(isLongClick && !mouseMove) {
          this.mapClick.mapIsClicked(mapSvg);
        }
        isLongClick = false;
        mouseMove = false;
      })
      .on('mousemove', () => {
        if(mouseDown) {
          mouseMove = true;
        }
    });
  }

  applyOnTouchesListener(mapSvg: MapSvg) {
    let isLongTouch: boolean = false;
    let touchMove: boolean = false;
    let touchStart: boolean = false;

    mapSvg.container
      .on('touchstart', () => {
        touchStart = true;
        setTimeout(() => {
          if(touchStart && !touchMove) {
            isLongTouch = true;
          }
        }, 500);
      })
      .on('touchend', () => {
        touchStart = false;
        if(isLongTouch && !touchMove) {
          this.mapClick.mapIsClicked(mapSvg);
        }
        isLongTouch = false;
        touchMove = false;
      })
      .on('touchmove', () => {
        if(touchStart) {
          touchMove = true;
        }
      });
  }

}
