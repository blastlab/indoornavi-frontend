import {HeatMapGradientPoint} from '../graphical-report.type';

export class HeatMapCanvas {

  private width: number;
  private height: number;
  private temps: number[][];
  private newTemps: number[][];
  private pFive: Function;
  private startX: number;
  private startY: number;
  private coordinates: HeatMapGradientPoint;
  private canApplyHeat = false;
  private heatSpread = 0;
  private brushIntensity = 0;
  private brushRadius = 0;


  private static isConfigOk(configuration: HeatMapCanvasConfig) {
    if (configuration['displayToggle'] === null) {
        return false;
    }
    if (!configuration.heatSpread || !configuration.brushIntensity || !configuration.brushRadius || !configuration.gridWidth ||
      !configuration.gridHeight || !configuration.cellSize || !configuration.cellSpacing) {
      return false;
    }
    return !(!configuration.isStatic && !configuration.width && !configuration.height);
  }

  constructor(private P_5: any /* todo: create dedicated advance P5 type*/, private config: HeatMapCanvasConfig, private data: HeatMapGradientPoint[]) {
    if (HeatMapCanvas.isConfigOk(config) && !!P_5) {
      this.pFive = new P_5(this.loader.bind(this));
    } else {
      if (!!P_5.Color && !!P_5.Image) {
        throw Error('Wrongly set configuration or configuration not available.');
      } else {
        throw Error('p5* library not available in current context or incompatible version used, use p5.js version 0.7.3');
      }
    }
  }


  private createGrid(): void {
    this.width = this.config.gridWidth;
    this.height = this.config.gridHeight;
    this.temps = [];
    this.newTemps = [];

    for (let x = 0; x < this.width; x++) {
      this.temps[x] = [];
      this.newTemps[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.temps[x][y] = this.newTemps[x][y] = 0;
      }
    }
  }

  private loader(sketch: any) {
    let imgUrl: string;
    let img: any;
    if (!!this.config.imgUrl) {
      imgUrl = this.config.imgUrl;
      sketch.preload = function () {
        img = sketch.loadImage(imgUrl);
      }
    }
    sketch.setup = () => {
      sketch.frameRate(60);
      let canvasHeat;
      if (!!this.config.imgUrl) {
        canvasHeat = sketch.createCanvas(this.config.width, this.config.height);
      } else {
        canvasHeat = sketch.createCanvas(this.config.width, this.config.height, sketch.WEBGL);
      }
      canvasHeat.parent(this.config.parentId);
      sketch.colorMode(sketch.HSB);
      sketch.textAlign(sketch.CENTER);
      sketch.noStroke();
      sketch.strokeWeight(0);
      this.createGrid();
      if (this.config.isStatic) {
        sketch.noLoop();
        this.canApplyHeat = true;
        if (this.data.length > 0) {
          this.data.forEach(coordDataPoint => {
            this.coordinates = coordDataPoint;
            this.update(sketch);
          });
        }
        sketch.redraw();
      }
    };

    sketch.draw = () => {
      if (this.config.gridWidth !== this.width || this.config.gridHeight !== this.height) {
        this.createGrid();
      }
      if (!this.config.isStatic) {
        if (this.data.length > 0) {
          this.canApplyHeat = true;
          this.coordinates = this.data.shift();
          if (this.data.length === 0) { // avoiding GB to destroy reference
            this.data = [];
          }
          this.brushIntensity = this.config.brushIntensity;
          this.brushRadius = this.config.brushRadius;
          this.heatSpread = this.config.heatSpread;
            this.update(sketch);
        }
      }

      sketch.background('rgba(255,255,255, 0.25)');
      sketch.tint(225, 120);
      if (!!img) {
        sketch.image(img, 0, 0);
      }
      this.canApplyHeat = false;
      this.update(sketch);
      this.display(sketch);

      sketch.fill('rgba(255,255,255, 0.25)');
      sketch.noStroke();
      sketch.strokeWeight(0);
    };

    sketch.windowResized = function () {
      sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    }
  }

  private update(sketch: any) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.newTemps[x][y] = this.temps[x][y];
      }
    }
    if (!!this.coordinates) {
      this.brushIntensity = Math.floor(this.config.brushIntensity * this.coordinates.heat);
      this.brushRadius = Math.floor(this.config.brushRadius * this.coordinates.heat);
      this.heatSpread = Math.floor(this.config.heatSpread * this.coordinates.heat);
    }
    this.startX = (sketch.width - ((this.width - 1) * this.config.cellSpacing)) / 2;
    this.startY = (sketch.height - ((this.height - 1) * this.config.cellSpacing)) / 2;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.newTemps[x][y]--;
        if (this.temps[x][y] > 0) {
          const dissipation = [];
          if (this.temps[x + 1] && this.temps[x + 1][y] < this.temps[x][y]) {
            dissipation.push([x + 1, y]);
          }
          if (this.temps[x - 1] && this.temps[x - 1][y] < this.temps[x][y]) {
            dissipation.push([x - 1, y]);
          }
          if (this.temps[x][y + 1] < this.temps[x][y]) {
            dissipation.push([x, y + 1]);
          }
          if (this.temps[x][y - 1] < this.temps[x][y]) {
            dissipation.push([x, y - 1]);
          }
          let sum = 0;
          for (let i = 0; i < dissipation.length; i++) {
            sum += this.temps[dissipation[i][0]][dissipation[i][1]];
          }
          const average = sketch.round(sum / dissipation.length);
          while (dissipation.length > 0 && this.newTemps[x][y] > average) {
            const index = Math.floor(Math.random() * dissipation.length);
            const amount = sketch.ceil((sketch.abs(this.newTemps[x][y] - this.newTemps[dissipation[index][0]][dissipation[index][1]]) / 5) *
              (this.heatSpread / 100));
            this.newTemps[dissipation[index][0]][dissipation[index][1]] += amount;
            dissipation.splice(index, 1);
            if (this.config.isStatic) {
              this.newTemps[x][y] -= amount;
            }
          }
        }
        if (this.canApplyHeat) {
          const distance = sketch.dist(this.coordinates.x, this.coordinates.y, x * this.config.cellSpacing + this.startX,
            y * this.config.cellSpacing + this.startY);
          if (distance < this.brushRadius * this.config.cellSpacing) {
            this.newTemps[x][y] += Math.round(sketch.map(distance, 0, this.brushRadius * this.config.cellSpacing,
              this.brushIntensity, 0));
          }
        }
        if (this.newTemps[x][y] > 240) {
          this.newTemps[x][y] = 240;
        } else if (this.newTemps[x][y] < 0) {
          this.newTemps[x][y] = 0;
        }
      }
    }
    const temp = this.temps;
    this.temps = this.newTemps;
    this.newTemps = temp;
  }

  private display(sketch: any) {
    if (this.config.displayToggle) {
      sketch.noFill();
      sketch.strokeWeight(2);
    } else {
      sketch.strokeWeight(1);
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let _value = this.temps[x][y];
        if (_value !== 0 && this.config.displayToggle !== HeatDisplay.CIRCLE) {
          sketch.fill(240 - _value, 255, 255, 0.5); // HSB
        } else {
          sketch.stroke(240, 255, 255, 0.0); // HSB
          sketch.fill(240, 255, 255, 0.0); // HSB
        }
        switch (this.config.displayToggle) {
          case HeatDisplay.SQUARE:
            sketch.rect(x * this.config.cellSpacing + this.startX, y * this.config.cellSpacing + this.startY, this.config.cellSize, this.config.cellSize);
            break;
          case HeatDisplay.ROUNDED:
            sketch.rect(x * this.config.cellSpacing + this.startX, y * this.config.cellSpacing + this.startY, this.config.cellSize, this.config.cellSize, 2);
            break;
          case HeatDisplay.TEXT:
            _value = Math.floor(_value / 24);
            sketch.text(_value, x * this.config.cellSpacing + this.startX, y * this.config.cellSpacing + this.startY, this.config.cellSize);
            break;
          case HeatDisplay.ELLIPSE:
            sketch.noStroke();
            sketch.ellipse(x * this.config.cellSpacing + this.startX, y * this.config.cellSpacing + this.startY, this.config.cellSize, this.config.cellSize);
            break;
          case HeatDisplay.CIRCLE:
            if (_value !== 0) {
              sketch.stroke(240 - _value, 255, 255, 0.5);
              sketch.circle(x * this.config.cellSpacing + this.startX, y * this.config.cellSpacing + this.startY, this.config.cellSize / 2);
            }
            break;
        }
      }
    }
  }
}

export const enum HeatDisplay {
  ELLIPSE,
  ROUNDED,
  SQUARE,
  TEXT,
  CIRCLE
}

export interface HeatMapCanvasConfig {
  heatSpread: number;
  brushRadius: number;
  brushIntensity: number;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  cellSpacing: number;
  isStatic: boolean;
  displayToggle: HeatDisplay;
  width: number;
  height: number;
  imgUrl: string;
  parentId: string;
}

