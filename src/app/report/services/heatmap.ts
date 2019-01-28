export const drawHeatMap = function (_p5, config, data) {

  let heatMap;

  function isConfigOk(_config) {
    if (!_config.displayToggle) {
      if (_config.displayToggle !== 'square' || _config.displayToggle !== 'ellipse' || _config.displayToggle !== 'rounded' || _config.displayToggle !== 'square') {
        return false;
      }
    }
    if (_config.canApplyHeat === 'undefined' || _config.canApplyHeat === 'null') {
      return false;
    }
    if (!_config.heatSpread || !_config.brushIntensity || !_config.brushRadius || !_config.gridWidth ||
      !_config.gridHeight || !_config.cellSize || !_config.cellSpacing) {
      return false;
    }
    if (_config.isStatic === 'undefined' || _config.isStatic === 'null') {
      return false;
    }
    return true;
  }

  const loader = function (sketch) {
    let heatSpread = config.heatSpread;
    let brushRadius = config.brushRadius;
    let brushIntensity = config.brushIntensity;
    let gridWidth = config.gridHeight;
    let gridHeight = config.gridHeight;
    let cellSize = config.cellSize;
    let cellSpacing = config.cellSpacing;
    let canApplyHeat = config.canApplyHeat;
    let isStatic = config.isStatic;
    let displayToggle = config.displayToggle;
    let img;
    let imgUrl;
    let coordinates;
    if (!!config.imgUrl) {
      imgUrl = config.imgUrl;
      sketch.preload = function () {
        img = sketch.loadImage(imgUrl);
      }
    }
    sketch.setup = function () {
      sketch.frameRate(60);
      if (!!config.imgUrl) {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
      } else {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight, sketch.WEBGL);
      }
      sketch.colorMode(sketch.HSB);
      sketch.textAlign(sketch.CENTER);
      sketch.noStroke();
      sketch.strokeWeight(0);

      heatMap = new HeatMap(gridWidth, gridHeight);
      if (isStatic) {
        sketch.noLoop();
        data.forEach(coordDataPoint => {
          coordinates = coordDataPoint;
          heatMap.update();
        });
        sketch.redraw();
      }
    }

    sketch.draw = function () {
      if (gridWidth != heatMap.width || gridHeight != heatMap.height) {
        heatMap = new HeatMap(gridWidth, gridHeight);
      }
      if (!isStatic) {
        canApplyHeat = false;
        if (data.length > 0) {
          canApplyHeat = true;
          coordinates = data.shift();
          if (data.length === 0) { // avoiding GB to destroy reference
            data = [];
          }
        }
        heatMap.update();
      }

      sketch.background('rgba(255,255,255, 0.25)');
      sketch.tint(225, 120);
      if (!!img) {
        sketch.image(img, 0, 0);
      }
      heatMap.update();
      heatMap.display();

      sketch.fill('rgba(255,255,255, 0.25)');
      sketch.noStroke();
      sketch.strokeWeight(0);
    }

    sketch.windowResized = function () {
      sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    }

    let HeatMap = function (mapWidth, mapHeight) {
      this.width = mapWidth;
      this.height = mapHeight;
      this.temps = [];
      this.newTemps = [];

      for (let x = 0; x < this.width; x++) {
        this.temps[x] = [];
        this.newTemps[x] = [];
        for (let y = 0; y < this.height; y++)
          this.temps[x][y] = this.newTemps[x][y] = 0;
      }
    }

    HeatMap.prototype.update = function () {
      for (let x = 0; x < this.width; x++)
        for (let y = 0; y < this.height; y++)
          this.newTemps[x][y] = this.temps[x][y];

      this.startX = (sketch.width - ((this.width - 1) * cellSpacing)) / 2;
      this.startY = (sketch.height - ((this.height - 1) * cellSpacing)) / 2;

      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          this.newTemps[x][y]--;

          // works out how to spread the heat in a cell to adjacent cells
          if (this.temps[x][y] > 0) {
            // keeps track of the cells that heat can be dissipated to
            let dissipation = [];

            // checks all four adjacent cells to see if they are lower in temperature
            if (this.temps[x + 1] && this.temps[x + 1][y] < this.temps[x][y])
              dissipation.push([x + 1, y]);
            if (this.temps[x - 1] && this.temps[x - 1][y] < this.temps[x][y])
              dissipation.push([x - 1, y]);
            if (this.temps[x][y + 1] < this.temps[x][y])
              dissipation.push([x, y + 1]);
            if (this.temps[x][y - 1] < this.temps[x][y])
              dissipation.push([x, y - 1]);

            // calculates the average temperature of the cells around the current cell
            let sum = 0;
            for (let i = 0; i < dissipation.length; i++)
              sum += this.temps[dissipation[i][0]][dissipation[i][1]];
            let average = sketch.round(sum / dissipation.length);

            // dissipates the heat into available cells until it either runs out of cells or the current cell has dropped below the average temp
            while (dissipation.length > 0 && this.newTemps[x][y] > average) {
              // picks a random cell (so there's no bias if not all cells end up getting heat)
              let index = Math.floor(Math.random() * dissipation.length);
              // calculates the amount of heat to dissipate to the adjacent cell depending on the temperature difference between them
              let amount = sketch.ceil((sketch.abs(this.newTemps[x][y] - this.newTemps[dissipation[index][0]][dissipation[index][1]]) / 5) * (heatSpread / 100));
              // updates cell temperatures and removes adjacent cell from the array
              this.newTemps[dissipation[index][0]][dissipation[index][1]] += amount;
              dissipation.splice(index, 1);
              this.newTemps[x][y] -= amount;
            }
          }

          if (canApplyHeat) {
            let distance = sketch.dist(coordinates.x, coordinates.y, x * cellSpacing + this.startX, y * cellSpacing + this.startY);
            if (distance < brushRadius * cellSpacing)
              this.newTemps[x][y] += Math.round(sketch.map(distance, 0, brushRadius * cellSpacing, brushIntensity, 0));
          }

          // cap the temp to between 0 and 240
          if (this.newTemps[x][y] > 240)
            this.newTemps[x][y] = 240;
          else if (this.newTemps[x][y] < 0)
            this.newTemps[x][y] = 0;
        }
      }

      // make the new temps the current ones and keep the old temps for use next frame
      const temp = this.temps;
      this.temps = this.newTemps;
      this.newTemps = temp;
    }

    HeatMap.prototype.display = function () {
      if (displayToggle) {
        sketch.noFill();
        sketch.strokeWeight(2);
      }
      else
        sketch.strokeWeight(1);
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          let _value = this.temps[x][y];
          if (_value !== 0 && displayToggle !== 'circle') {
            sketch.fill(240 - _value, 255, 255, 0.5); // HSB
          } else {
            sketch.stroke(240, 255, 255, 0.0); // HSB
            sketch.fill(240, 255, 255, 0.0); // HSB
          }
          switch (displayToggle) {
            case 'square':
              sketch.rect(x * cellSpacing + this.startX, y * cellSpacing + this.startY, cellSize, cellSize);
              break;
            case 'rounded':
              sketch.rect(x * cellSpacing + this.startX, y * cellSpacing + this.startY, cellSize, cellSize, 2);
              break;
            case 'numbers':
              _value = Math.floor(_value / 24);
              sketch.text(_value, x * cellSpacing + this.startX, y * cellSpacing + this.startY, cellSize);
              break;
            case 'ellipse':
              sketch.noStroke();
              sketch.ellipse(x * cellSpacing + this.startX, y * cellSpacing + this.startY, cellSize, cellSize);
              break;
            case 'circle':
              if (_value !== 0) {
                sketch.stroke(240 - _value, 255, 255, 0.5);
                sketch.circle(x * cellSpacing + this.startX, y * cellSpacing + this.startY, cellSize / 2);
              }
              break;
          }
        }
      }
    }
  }

  if (_p5 && isConfigOk(config)) {
    const five = new _p5(loader);
  } else {
    if (!!_p5 && !!_p5.Color && !!_p5.Image) {
      throw Error('Wrongly set configuration or configuration not available.');
    } else {
      throw Error('p5* library not available in current scope or incompatible version used, use p5.js version 0.7.3');
    }
  }
}
