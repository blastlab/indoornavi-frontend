import {Point} from '../../map/map.type';
import h337 from 'heatmap.js';
import {HeatMapCoordinates, HeatMapConfig} from '../publication/published.type';

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
      opacity: 0.8,
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

  // update method waits for tag icon to be translated to new coordinate - setTimeout time is hardcoded
  // then algorithm rounds coordinate to collect all occurrences to one square 10x10
  // this lets us to avoid separation of coordinates to be to close to each others and mapped to different heat points
  // and lets us to increase 'temperature' of given square area if coordinates are approximate the same
  // in addition algorithm collects less heat points, so it is optimizing it's running needs
  // next algorithm searches for heatPoint in heatBuffer for given coordinates point, then:
  // if heatPoint is in heatBuffer and his heat value allows to be increased, do so by preconfigured heat value step,
  // if found but heat value is to high, than it sets heat value to maximum possible, if not found in heatBuffer, then:
  // add this point on the end of heatBuffer with value equal to preconfigured heat value step, then:
  // check the length of the heatBuffer and first take all items of heatBuffer from beginning to given preconfigured length and
  // first decrease heat value down by preconfigured value and second remove first heat point in heatBuffer,
  update(coordinates: Point): HeatMapCreated {
    setTimeout( () => {
      const x = Math.round(coordinates.x / 10) * 10;
      const y = Math.round(coordinates.y / 10) * 10;
      const heatPointIndex = this.heatBuffer
        .findIndex( heatPoint => (heatPoint.x === x && heatPoint.y === y ));
      if (heatPointIndex > -1) {
        const increaseValueNumber = this.heatValue + this.heatBuffer[heatPointIndex].value <= this.heatValue * 5 ?
          this.heatValue + this.heatBuffer[heatPointIndex].value : this.heatValue * 5;
        this.heatBuffer.splice(heatPointIndex, 1);
        const heatPoint = new HeatPointSetter(x, y, increaseValueNumber);
        this.heatBuffer.push(heatPoint.configuration);
      } else {
        const heatPoint = new HeatPointSetter(x, y, this.heatValue);
        this.heatBuffer.push(heatPoint.configuration);
      }
      if (this.heatBuffer.length > this.heatMapPathLength) {
        for (let i = 0; i < Math.round(this.heatMapPathLength / 2); i ++) {
          if (this.heatBuffer[i].value > Math.round(this.heatValue / 20)) {
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

export class HeatPointSetter {
  private x: number;
  private y: number;
  private value: number;

  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
  }

  get configuration(): HeatPoint {
    return {
      x: this.x,
      y: this.y,
      value: this.value
    };
  }
}

export interface MapConfiguration {
  setData: any;
}

export interface HeatPoint {
  x: number;
  y: number;
  value: number;
}
