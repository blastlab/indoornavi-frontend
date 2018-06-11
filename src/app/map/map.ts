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
  private timer;
  private isLongClick: boolean = false;
  private mouseMove: boolean = false;
  private mouseDown: boolean = false;

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
      this.onClickListener(mapSvg);
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

  onClickListener(mapSvg) {
      mapSvg.container
        .on('mousedown', () => {
          this.mouseDown = true;
          this.timer = setTimeout(() => {
            if(this.mouseDown && !this.mouseMove) {
              this.isLongClick = true;
            }
          }, 500);
        })
        .on('mouseup', () => {
          this.mouseDown = false;
          if(this.isLongClick && !this.mouseMove) {
            this.mapClick.mapIsClicked(mapSvg);
          }
          this.isLongClick = false;
          this.mouseMove = false;
        })
        .on('mousemove', () => {
          if(this.mouseDown) {
            this.mouseMove = true;
          }
      });
  }

}
