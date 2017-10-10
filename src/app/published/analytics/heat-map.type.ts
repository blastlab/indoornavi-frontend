export interface HeatMapSettings {
  radius: number;
  opacity: number;
  blur: number;
  path: number;
  heat: number;
}

export interface MapConfiguration {
  setData: any;
  configure: any;
  repaint: any;
}

export interface HeatPoint {
  x: number;
  y: number;
  value: number;
}

export interface HeatMapCoordinates {
  x: number;
  y: number;
  value: number;
}

export interface HeatMapConfig {
  pathLength: number;
  heatValue: number;
  radius: number;
  opacity: number;
  blur: number;
}

export interface HeatMapConfiguration {
  radius: number;
  opacity: number;
  blur: number;
  heat: number;
  path: number;
}
