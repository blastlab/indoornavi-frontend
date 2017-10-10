import {Point} from '../../map/map.type';
import h337 from 'heatmap.js';
import {HeatMapConfig, HeatMapConfiguration, HeatMapCoordinates, HeatPoint, MapConfiguration} from './heat-map.type';

export class HeatMapBuilder {
  private configuration: HeatMapConfig;

  constructor(configuration: HeatMapConfig) {
    this.configuration = configuration;
  }

  createHeatGroup(): HeatMapCreated {

    const heatMapInstance = h337.create({
      container: document.querySelector('#map-canvas'),
      radius: this.configuration.radius,
      // backgroundColor: 'rgba(0,0,255,.6)',
      opacity: this.configuration.opacity,
      blur: this.configuration.blur,
      gradient: {
        '0.7': 'yellow',
        '.9': 'orange',
        '1': 'red'
      }
    });
    return new HeatMapCreated(
      heatMapInstance,
      this.configuration.pathLength,
      this.configuration.heatValue
      );
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

  // Update method waits for tag icon to be translated to new coordinates -> setTimeout time is hardcoded.
  // Then algorithm rounds coordinate to collect all occurrences to one square 10x10 pixels.
  // This lets us to avoid separation between coordinates to be to small, and points are not mapped to different heat points if close enough to each other.
  // This allows algorithm to increase 'temperature' of given square area if coordinates are approximate the same,
  // in addition algorithm collects less heat points allowing to optimize number of stored locations,
  // without loosing accuracy and need to store all given coordinates.
  // Next algorithm searches for heatPoint in heatBuffer for given coordinates point, then:
  // If heatPoint is in heatBuffer and his heat value allows to be increased, do so by preconfigured heat value step.
  // If found but heat value is to high, than it sets heat value to maximum possible value, if not found in heatBuffer, then:
  // Add this point on the end of heatBuffer with value equal to preconfigured heat value step, then:
  // Check the length of the heatBuffer and first take all items of heatBuffer from beginning to given preconfigured length and
  // decrease heat down by preconfigured value and second remove first heat point in heatBuffer which is the oldest heatPoint in heatBuffer.
  public update(coordinates: Point): HeatMapCreated {
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

  public configure(heatMapConfiguration: HeatMapConfiguration) {
    this.heatMapInstance.configure({
      radius: heatMapConfiguration.radius,
      opacity: heatMapConfiguration.opacity,
      blur: heatMapConfiguration.blur
    });
    this.heatValue = heatMapConfiguration.heat;
    this.heatMapPathLength = heatMapConfiguration.path;
  }

  public repaint() {
    this.heatBuffer = [];
    const data = {
      max: this.heatValue * 5,
      min: 0,
      data: this.heatBuffer
    };
    this.heatMapInstance.setData(data);
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
