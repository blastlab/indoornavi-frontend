export const echartHeatmapConfig = {
  animation: false,
  xAxis: {
    type: 'category',
    data: [],
    show: false
  },
  yAxis: {
    type: 'category',
    data: [],
    show: false
  },
  visualMap: {
    type: 'piecewise',
    itemHeight: 10,
    itemWidth: 20,
    show: true,
    min: 0,
    max: 10,
    top: 60,
    left: 0,
    seriesIndex: 0,
    splitNumber: 20,
    calculable: true,
    realtime: true,
    inRange: {
      color: [
        'rgba(0, 0, 204, .2)',
        'rgba(0, 51, 204, .2)',
        'rgba(0, 204, 255, .2)',
        'rgba(0, 255, 204, .2)',
        'rgba(0, 255, 153, .2)',
        'rgba(102, 255, 102, .2)',
        'rgba(153, 255, 51, .2)',
        'rgba(255, 255, 0, .3)',
        'rgba(255, 153, 0, .3)',
        'rgba(255, 51, 0, .4)',
        'rgba(255, 0, 0, .5)'
      ]
    }
  },
  series: [{
    coordinateSystem: 'cartesian2d' ,
    name: 'Distribution of time spent in given location',
    type: 'heatmap',
    data: [],
    pointSize: 1,
    animation: true,
    progressive: 10000,
  }]
};
