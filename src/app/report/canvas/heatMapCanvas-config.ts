import {HeatDisplay} from './heatmap';

export const heatMapCanvasConfiguration = {
  heatSpread: 1,
  brushRadius: 1,
  brushIntensity: 10,
  gridWidth: null, // calculated from cellSpacing but can be set permanent
  gridHeight: null, // calculated from cellSpacing but can be set permanent
  cellSize: 6,
  cellSpacing: 6,
  isStatic: true,
  displayToggle: HeatDisplay.ELLIPSE,
  width: 0,
  height: 0,
  imgUrl: null, // set if img is present
  parentId: 'heatmap-sketch' //
};
