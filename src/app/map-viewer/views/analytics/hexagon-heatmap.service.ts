import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';
import {HexHeatElement, Margin} from './analytics.type';


export class HexagonHeatMap {
  private strokeWidth: number = 1;
  private maxOpacity: number  = 0.6;
  private heatingUpTime: number;
  private coolingDownTime: number;
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
    this.fireHeatAtLocation(this.findHexIndex(data), data);
  }

  set heatingUp(value) {
    this.heatingUpTime = value;
  }

  set coolingDown(value) {
    this.coolingDownTime = value;
  }

  private coolDownActiveHexes(): void {
    const hexagons = this.svg.selectAll('.hexagon').nodes();
    hexagons.forEach((hexagon: d3.selection): void => {
      // hexagon.remove();
      console.log(hexagon);
      // act on hexagons with cool down method checking time heated
    })
    // this.hexMap.forEach((hexagon: d3.selection): void => {
    //   console.log(hexagon.attr('heatedAtTime'));
    // });
  }

  private fireHeatAtLocation (hex: HexHeatElement, coordinates: Point): void {
    this.coolDownActiveHexes();

    if (!!hex) {
      const hexagon = d3.select(hex.element);

      let heat = Number.parseInt(hexagon.attr('heat'));
      if (heat < 5) {
        heat++;
      }
      const color = this.heatColors[heat];

      hexagon
        .transition()
        .duration(this.heatingUpTime)
        .attr('heat', heat)
        .attr('heated', Date.now().toString())
        .style('fill-opacity', this.maxOpacity)
        .style('stroke-opacity', this.maxOpacity)
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
        .attr('heat', 1)
        .attr('stroke', this.heatColors[0])
        .style('stroke-opacity', this.maxOpacity)
        .attr('stroke-width', `${this.strokeWidth}px`)
        .style('fill', this.heatColors[0])
        .style('fill-opacity', this.maxOpacity);
    }
  }

  private findHexIndex (coordinates: Point): HexHeatElement {
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
