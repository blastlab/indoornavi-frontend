import {HeatDisplay} from './heatmap';

export const heatMapCanvasConfiguration = {
  heatSpread: 35,
    brushRadius: 4,
    brushIntensity: 80,
    gridWidth: 200, // todo: dynamic set from picture size
    gridHeight: 200, // todo: dynamic set from picture size
    cellSize: 20,
    cellSpacing: 20,
    isStatic: true,
    displayToggle: HeatDisplay.ELLIPSE,
    width: 0,
    height: 0,
    imgUrl: null,
    parentId: 'heatmap-sketch'
};
