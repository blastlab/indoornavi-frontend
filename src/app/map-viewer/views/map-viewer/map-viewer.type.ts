import * as P5 from 'p5';

export interface Zoom {
  value: number;
  sensitivity: number;
  max: number;
  min: number;
}

export interface Background {
  image: P5.Image;
  startingPosition: Point2D;
  currentPosition: Point2D;
}

export interface Point2D {
  x: number;
  y: number;
}
