import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';
import {HexHeatElement, Margin} from './analytics.type';


export class HexagonHeatMap {
  private strokeWidth: number = 1;
  private maxOpacity: number  = 0.6;
  private heatingUpTime: number;
  private temperatureTimeStep: number;
  private transitionTime: number = 1000;
  private points: Array<[number, number]> = [];
  private hexGridTable: Array<HexHeatElement> = [];
  private svg: d3.selection;
  private hexMap: d3.selection;
  private margin: Margin;

  constructor(private width: number,
              private height: number,
              private hexSize: number,
              private heatColors: string[]) {
    this.width = width;
    this.height = height;
    this.hexSize = hexSize;
    this.heatColors = heatColors;
    this.margin = {left: hexSize, top: hexSize, right: hexSize, bottom: hexSize};
    this.calculatePoints();
  }

  create(id: string): void {

    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'hexagon-heatmap')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  }

  eraseHeatMap (): void {
    this.svg.selectAll('g').remove();
  }

  feedWithCoordinates(data: Point): void {
    this.fireHeatAtLocation(this.findHex(data), data);
  }

  set heatingUp(value) {
    this.heatingUpTime = value;
  }

  set temperatureTimeInterval(value) {
    this.temperatureTimeStep = value;
  }

  private coolDownActiveHexes(timeNow: number): void {
    const hexagons = this.svg.selectAll('.hexagon').nodes();
    hexagons.forEach((hex: d3.selection): void => {
      const hexagon = d3.select(hex);
      const lastTimeHexagonGetHeated = Number.parseInt(hexagon.attr('heated'));
      if (timeNow - lastTimeHexagonGetHeated > this.temperatureTimeStep) {
        let heat = Number.parseInt(hexagon.attr('heat'));
        if (heat > 0) {
          --heat;
          const color = this.heatColors[heat];
          hexagon.attr('heat', heat)
            .transition()
            .duration(this.transitionTime)
            .attr('heated', timeNow.toString())
            .style('fill', () => color)
            .attr('stroke', () => color);
        } else {
          const parent = d3.select(hex.parentNode);
          parent.remove();
        }
      }
    });
  }

  private fireHeatAtLocation (hex: HexHeatElement, coordinates: Point): void {
    const timeNow = Date.now();
    this.coolDownActiveHexes(timeNow);
    if (!!hex) {
      const hexagon = d3.select(hex.element);
      let heat = Number.parseInt(hexagon.attr('heat'));
      const lastTimeHexagonGetHeated = Number.parseInt(hexagon.attr('heated'));
      if ((heat < 5) && (timeNow - lastTimeHexagonGetHeated > this.heatingUpTime)) {
        heat++;
      }
      const color = this.heatColors[heat];

      hexagon
        .transition()
        .duration(this.transitionTime)
        .attr('heat', heat)
        .attr('heated', timeNow.toString())
        .style('fill', () => color)
        .attr('stroke', () => color);

    } else {
      const hexbin = d3Hexbin.hexbin().radius(this.hexSize);

      const hexPoint =  this.points.find((point: [number, number]): boolean => point[0] > coordinates.x && point[1] > coordinates.y);

      this.hexMap = this.svg.append('g')
        .selectAll('.hexagon')
        .data(hexbin([hexPoint]))
        .enter().append('path')
        .attr('class', 'hexagon')
        .attr('d', (d, index, nodes) => {
          this.hexGridTable.push({x: d.x, y: d.y, element: nodes[index]});
          return 'M' + d.x + ',' + d.y + hexbin.hexagon();
        })
        .attr('heat', 0)
        .attr('heated', timeNow.toString())
        .attr('stroke', this.heatColors[0])
        .style('stroke-opacity', this.maxOpacity)
        .attr('stroke-width', `${this.strokeWidth}px`)
        .style('fill', this.heatColors[0])
        .style('fill-opacity', this.maxOpacity);
    }
  }

  private findHex (coordinates: Point): HexHeatElement {
    return this.hexGridTable.find((hex: HexHeatElement): boolean =>
      hex.x > coordinates.x &&
      hex.y > coordinates.y &&
      hex.x < coordinates.x + 1.5 * this.hexSize &&
      hex.y < coordinates.y + 1.5 * this.hexSize);
  };

  private calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / (this.hexSize * 1.5));
    const mapRows = Math.ceil(this.height / (this.hexSize * 1.5));
    return [mapColumns, mapRows];
  }

  private calculatePoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push([this.hexSize * j * 1.5, this.hexSize * i * 1.5]);
      }
    }
  }

}
