export interface SolverCoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
  maxGradientsNum: number;
  mapXLength: number;
  mapYLength: number;
  scaleInX: number;
  scaleInY: number;
  distanceInCm: number;
}

export interface SolverHeatMapPayload {
  size: number[],
  gradient: number[][],
}

export interface EchartInstance {
  group: () => any;
  setOption: () => any;
  getWidth: () => any;
  getHeight: () => any;
  getDom: () => any;
  getOption: () => any;
  resize: (f: EchartResizeParameter) => void;
  dispatchAction: () => any;
  on: () => any;
  off: () => any;
  convertToPixels: () => any;
  convertFromPixels: () => any;
  showLoading: () => any;
  hideLoading: () => any;
  getDataUrl: () => any;
  getConnectedDataURL: () => string;
  appendData: () => any;
  clear: () => any;
  isDisposed: () => boolean;
  dispose: () => any;
}

export interface EchartResizeParameter {
  width: number;
  height: number;
  silent: boolean
}
