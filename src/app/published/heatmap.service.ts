import {Point} from '../map/map.type';
import h337 from 'heatmap.js';
import {HeatMapCoordinates, HeatMapConfig} from './published.type';

export class HeatMapBuilder {
  private configuration: HeatMapConfig;

  constructor(configuration: HeatMapConfig) {
    this.configuration = configuration;
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
        '0.4': 'yellow',
        '.5': 'orange',
        '1': 'red'
      }
    });
    return new HeatMapCreated(heatMapInstance, this.configuration.pathLength, this.configuration.heatValue);
  }
}

export class HeatMapCreated {
  private heatMapPathLength: number;
  private heatValue: number;
  private heatMapInstance: MapConfiguration;
  private heatBuffer: Array<HeatMapCoordinates> = [];

  constructor(heatMapInstance: MapConfiguration, heatMapPathLength: number, heatValue: number) {
    this.heatMapInstance = heatMapInstance;
    this.heatMapPathLength = heatMapPathLength;
    this.heatValue = heatValue;
  }

  update(coordinates: Point): HeatMapCreated {
    setTimeout( () => {
      const x = Math.round(coordinates.x / 10) * 10;
      const y = Math.round(coordinates.y / 10) * 10;
      const heatPointIndex = this.heatBuffer
        .findIndex( heatPoint => (heatPoint.x === x && heatPoint.y === y ));
      if (heatPointIndex > -1) {
        const increaseValueNumber = this.heatValue + this.heatBuffer[heatPointIndex].value <= 100 ? this.heatValue + this.heatBuffer[heatPointIndex].value : 100;
        this.heatBuffer.splice(heatPointIndex, 1);
        this.heatBuffer.push({x: x, y: y, value: increaseValueNumber});
      } else {
        this.heatBuffer.push({x: x, y: y, value: this.heatValue});
      }
      if (this.heatBuffer.length > this.heatMapPathLength) {
        for (let i = 0; i < Math.round(this.heatMapPathLength / 2); i ++) {
          if (this.heatBuffer[i].value > 5) {
            this.heatBuffer[i].value -= 1;

          }
        }
        this.heatBuffer.splice(0, 1);
      }
      const data = {
        max: this.heatValue * 5,
        min: 0,
        data: this.heatBuffer
      };
      this.heatMapInstance.setData(data);
    }, 650);
    return this;
  }
}

export interface MapConfiguration {
  addData: any;
  repaint: any;
  setData: any;
}
