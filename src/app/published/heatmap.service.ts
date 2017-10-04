import {Point} from '../map/map.type';
import h337 from 'heatmap.js';

export class HeatMapBuilder {
  constructor() {
  }

  createHeatGroup(): HeatMapCreated {
    const heatMapInstance = h337.create({
      container: document.querySelector('#map-container'),
      radius: 20,
      // backgroundColor: 'rgba(0,0,255,.6)',
      maxOpacity: 0.8,
      minOpacity: 0.4,
      blur: 0.9,
      gradient: {
        '.9': 'yellow',
        '.95': 'orange',
        '1': 'red'
      }
    })
    console.log(heatMapInstance);
    return new HeatMapCreated(heatMapInstance);
  }
}

export class HeatMapCreated {
  heatMapInstance: MapConfiguration;

  constructor(heatMapInstance: MapConfiguration) {
    this.heatMapInstance = heatMapInstance;
  }

  update(coordinates: Point): HeatMapCreated {
    setTimeout( () => {
      this.heatMapInstance.addData({
        x: coordinates.x,
        y: coordinates.y,
        value: 0.002
      });
    }, 1000);
    return this;
  }
}

export interface MapConfiguration {
  addData: any;
}
