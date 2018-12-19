export const echartHeatmapConfig = {
  animation: false,
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'category',
    data: []
  },
  visualMap: {
    show: false,
    min: 0,
    max: 1,
    seriesIndex: 0,
    calculable: true,
    realtime: false,
    inRange: {
      color: [
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 153, 0.1)',
        'rgba(255, 204, 102, 0.2)',
        'rgba(255, 153, 51, 0.3)',
        'rgba(255, 102, 0, 0.3)',
        'rgba(255, 51, 0, 0.4)',
        'rgba(255, 0, 0,0.5)'
      ]
    }
  },
  series: [{
    name: '',
    type: 'heatmap',
    data: [],
    pointSize: 1,
    blurSize: 6,
    animation: false
  }]
};
