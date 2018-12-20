import {Point3d} from '../map-editor/map.type';

export interface CoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
}

export interface CoordinatesIncident {
  anchorShortId: number;
  date: number;
  floorId: number;
  point: Point3d;
  tagShortId: number;
}
