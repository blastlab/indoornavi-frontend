import {Point} from '../map-editor/map.type';

export interface SolverCoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
  mapWidth: number;
  mapHeight: number;
  tagsIds: number[];
  deviceType: string;
}

export interface SolverHeatMapPayload {
  distribution: HeatMapGradientPoint[],
}

export interface HeatMapGradientPoint extends Point {
  heat: number;
}

