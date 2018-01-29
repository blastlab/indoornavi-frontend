import {ScaleDto} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Building} from '../building/building.type';

export class Floor {
  id?: number;
  level: number;
  name: string;
  displayName?: string;
  building: Building;
  imageId?: number;
  scale?: ScaleDto;


  constructor(name: string, level: number, building: Building, displayName?: string, imageId?: number, scale?: ScaleDto, id?: number) {
    this.id = id;
    this.level = level;
    this.name = name;
    this.displayName = displayName;
    this.building = building;
    this.imageId = imageId;
    this.scale = scale;
  }
}
