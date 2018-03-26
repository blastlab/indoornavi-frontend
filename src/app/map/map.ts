import {Component, Input, OnInit} from '@angular/core';
import {MapEditorService} from '../map-editor/map.editor.service';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {Floor} from '../floor/floor.type';
import {MapSvg} from './map.type';
import {DevicePlacerController} from '../map-editor/tool-bar/tools/devices/device-placer.controller';

@Component({
  selector: 'app-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  @Input() floor: Floor;
  private imageLoaded: boolean = false;

  constructor(private mapLoaderInformer: MapLoaderInformerService,
              private mapEditorService: MapEditorService,
              private devicePlacerController: DevicePlacerController) {
  }

  ngOnInit(): void {
    this.mapEditorService.drawMap(this.floor).then((mapSvg: MapSvg) => {
      this.imageLoaded = true;
      this.mapLoaderInformer.publishIsLoaded(mapSvg);
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

}
