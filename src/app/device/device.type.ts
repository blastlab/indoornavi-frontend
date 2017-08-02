export interface Device {
  id?: number;
  name?: string;
  shortId: number;
  longId: number;
  verified: boolean;
  x?: number;
  y?: number;
  floorId?: number;
}
