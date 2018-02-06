import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';


export class HexagonHeatMap {
  private strokeWidth: number = 1;
  private maxOpacity: number  = 0.6;
  private heatingUpTime: number;
  private coolingDownTime: number;
  private points: any[] = [];
  private hexGridTable: any[] = [];
  private svg: any;
  private hexMap: any;
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
    const hexbin = d3Hexbin.hexbin().radius(this.hexSize);

    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'hexagon-heatmap')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.hexMap = this.svg.append('g')
      .selectAll('.hexagon')
      .data(hexbin(this.points))
      .enter().append('path')
      .attr('class', 'hexagon')
      .attr('d', (d, index, nodes) => {
        this.hexGridTable.push({x: d.x, y: d.y, element: nodes[index]});
        return 'M' + d.x + ',' + d.y + hexbin.hexagon();
      })
      .attr('heat', 0)
      .attr('stroke', this.heatColors[0])
      .style('stroke-opacity', 0)
      .attr('stroke-width', `${this.strokeWidth}px`)
      .style('fill', this.heatColors[0])
      .style('fill-opacity', 0);
  }

  eraseHeatMap (): void {
    this.hexGridTable.forEach((hex: HexHeatElement) => {
      const element = d3.select(hex.element);
      if (element.attr('heat') > 0) {
        element
          .transition()
          .style('fill', this.heatColors[0])
          .attr('stroke', this.heatColors[0])
          .style('stroke-opacity', 0)
          .style('fill-opacity', 0)
          .attr('heat', 0);
      }
    })
  }

  feedWithCoordinates(data: Point): void {
    this.fireHeatAtLocation(this.findHexIndex(data));
  }

  set heatingUp(value) {
    this.heatingUpTime = value;
  }

  set coolingDown(value) {
    this.coolingDownTime = value;
  }

  private fireHeatAtLocation (hex: HexHeatElement): void {
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
        .style('fill-opacity', this.maxOpacity)
        .style('stroke-opacity', this.maxOpacity)
        .style('fill', () => color)
        .attr('stroke', () => color)
        .on('end', () => {
          const coolDown = (): void => {
            if (heat > 1) {
              hexagon
                .transition()
                .on('end', (): any => { // can return alpha function or string
                  heat--;
                  return coolDown;
                })
                .duration(this.coolingDownTime)
                .attr('heat', heat)
                .style('fill', () => {
                  return this.heatColors[heat - 1]
                })
                .attr('stroke', (): string => this.heatColors[heat - 1]);
            } else {
              hexagon
                .transition()
                .duration(this.coolingDownTime)
                .style('fill-opacity', 0)
                .style('stroke-opacity', 0);
            }
          };
          coolDown();
        });
    }
  }

  private findHexIndex (coordinates: Point): HexHeatElement {
    return this.hexGridTable.find(hex => hex.x > coordinates.x && hex.y > coordinates.y);
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

export interface Margin {
  top: number,
  bottom: number,
  left: number,
  right: number
}

export interface HexHeatElement {
  x: number,
  y: number,
  element: d3.selection
}
