export interface Point {
  x: number;
  y: number;
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

export enum TypeLine {
  Solid = 'solid',
  Dotted = 'dotted'
}
