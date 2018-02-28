import {CoordinatesSocketData} from '../../publication.type';
import * as d3 from 'd3';

export interface TimeStepBuffer {
  data: CoordinatesSocketData;
  timeOfDataStep: number;
}

export interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface HeatPoint {
  x: number;
  y: number;
  element: d3.selection;
  tagShortId: number;
  heat: number;
  heated: number;
}

export interface HeatMapPath {
  temperatureLifeTime: number;
  temperatureWaitTime: number;
}
