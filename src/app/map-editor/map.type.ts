import * as d3 from 'd3';

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

export interface PathContextCallback {
  remove: () => void;
}

export interface LineBag {
  lineInEditor: d3.selection;
  lineDto: Line;
}

export interface PathContextMenuLabels {
  removeAll: string;
}
