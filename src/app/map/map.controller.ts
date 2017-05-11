import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FloorService} from '../floor/floor.service';
import {Floor} from '../floor/floor.type';
import {ToolsEnum} from './toolbar/tools/tools.enum';

@Component({
  templateUrl: 'map.controller.html',
  styleUrls: ['./map.css']
})
export class MapControllerComponent implements OnInit {
  @Input() activeTool: ToolsEnum = ToolsEnum.NONE;
  imageUploaded: boolean;
  editing: boolean;
  floor: Floor;

  constructor(private route: ActivatedRoute,
              private floorService: FloorService) {
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        const floorId = parseInt(params['floorId'], 10);
        this.floorService.getFloor(floorId).subscribe((floor: Floor) => {
          this.imageUploaded = !!floor.imageId;
          this.floor = floor;
        });
      });
  }

  onImageUploaded(floor: Floor): void {
    this.imageUploaded = true;
    this.floor = floor;
  }

  /*toggleEdit(): void {
    this.editing = !this.editing;
  }*/
  setTool(eventData: ToolsEnum): void {
    this.activeTool = eventData;
  }
}
