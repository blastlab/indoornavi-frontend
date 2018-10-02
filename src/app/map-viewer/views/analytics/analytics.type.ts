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
  timeHeated: number;
}

export interface HeatMapPath {
  temperatureLifeTime: number;
  temperatureWaitTime: number;
}

export interface HeatMap {
  temperatureTimeIntervalForHeating: number;
  temperatureTimeIntervalForCooling: number;
  create(id: string): void;
  erase (tagShortId?: number): void;
  feedWithCoordinates(data: CoordinatesSocketData): void;
}
