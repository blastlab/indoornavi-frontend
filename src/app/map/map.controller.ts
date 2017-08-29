import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FloorService} from '../floor/floor.service';
import {Floor} from '../floor/floor.type';
import {Tool} from './toolbar/tools/tool';

@Component({
  templateUrl: 'map.controller.html',
  styleUrls: ['./map.css']
})
export class MapControllerComponent implements OnInit {
  @Input() activeTool: Tool;
  imageUploaded: boolean;
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

  setTool(eventData: Tool): void {
    this.activeTool = eventData;
  }
}
