export interface SolverCoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
  maxGradientsNum: number;
  mapXLength: number;
  mapYLength: number;
  distanceInPix: number;
  distanceInCm: number;
}
