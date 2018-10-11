export interface Point {
  x: number;
  y: number;
}

export interface Point3d extends Point {
  z: number;
}

export interface Line {
  startPoint: Point;
  endPoint: Point;
}

export interface Transform {
  k: number;
  x: number;
  y: number;
}

export enum LineType {
  Solid = 'solid',
  Dotted = 'dotted'
}
