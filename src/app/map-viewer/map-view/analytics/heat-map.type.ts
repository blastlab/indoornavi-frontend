export interface HeatMapSettings {
  radius: number;
  opacity: number;
  blur: number;
}

export interface HeatMapSettingsExtended extends HeatMapSettings {
  path: number;
  heat: number;
}

export interface MapConfiguration {
  setData: (data: HeatMapData) => void;
  configure: (config: HeatMapSettings) => void;
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

export interface HeatMapConfig extends HeatMapSettings {
  pathLength: number;
  heatValue: number;
}

export interface HeatMapData {
  max: number;
  min: number;
  data: HeatMapCoordinates[];
}
