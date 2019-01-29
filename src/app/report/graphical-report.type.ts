export interface SolverCoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
  maxGradientsNum: number;
  mapXLength: number;
  mapYLength: number;
  scaleInX: number;
  scaleInY: number;
  distanceInCm: number;
}

export interface SolverHeatMapPayload {
  size: number[],
  gradient: number[][],
}

export interface EchartResizeParameter {
  width: number;
  height: number;
  silent: boolean
}
