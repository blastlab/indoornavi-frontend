import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';


export class HexagonHeatmap {
  private strokeWidth: number = 1;
  private heatingUpTime: number;
  private coolingDownTime: number;
  private allowMouseEvents: boolean = false;
  private points: any[] = [];
  private hexGridTable: any[] = [];
  private svg: any;
  private hexMap: any;
  private margin: Margin;

  constructor(private width: number,
              private height: number,
              private hexSize: number,
              private heatColor: string) {
    this.width = width;
    this.height = height;
    this.hexSize = hexSize;
    this.heatColor = heatColor;
    this.margin = {left: hexSize, top: hexSize, right: hexSize, bottom: hexSize};
    this.calculatePoints();
  }

  create(id: string) {
    // variables are located in method because d3.selections changes context of this key word
    const hexbin = d3Hexbin.hexbin().radius(this.hexSize);
    const points = this.points;
    const strokeColor = this.heatColor;
    const mouseEvents = this.allowMouseEvents;
    const heatingTime = this.heatingUpTime;
    const coolingTime = this.coolingDownTime;
    const strokeWidth = this.strokeWidth;
    const hexGridTable = [];

    // functions are located in method because d3.selections changes context of this key word
    function heatUp(d) {
      if (mouseEvents) {
        const el = d3.select(this)
          .transition()
          .duration(heatingTime)
          .style('fill-opacity', .5)
          .style('stroke-opacity', .3);
      }
    }

    function coolDown(d) {
      if (mouseEvents) {
        const el = d3.select(this)
          .transition()
          .duration(coolingTime)
          .style('fill-opacity', 0)
          .style('stroke-opacity', 0);
      }
    }

    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'hexagon-heatmap')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.hexMap = this.svg.append('g')
      .selectAll('.hexagon')
      .data(hexbin(points))
      .enter().append('path')
      .attr('class', 'hexagon')
      .attr('d', function (d, index, nodes) {
        hexGridTable.push({x: d.x, y: d.y, element: nodes[index]});
        return 'M' + d.x + ',' + d.y + hexbin.hexagon();
      })
      .attr('stroke', function (d, i) {
        return strokeColor;
      })
      .style('stroke-opacity', 0)
      .attr('stroke-width', `${strokeWidth}px`)
      .style('fill', function (d, i) {
        return points[i][2];
      })
      .style('fill-opacity', 0)
      .on('mouseover', heatUp)
      .on('mouseout', coolDown);

    this.hexGridTable = hexGridTable;

  }

  coolDownImmediately () {
    this.hexGridTable.forEach((hex: HexHeatElement) => {
      d3.select(hex.element)
        .transition()
        .duration(1000)
        .style('fill-opacity', 0)
        .style('stroke-opacity', 0);
    });
  }

  feedWithCoordinates(data: Point) {
    this.fireHeatAtLocation(this.findHexIndex(data));
  }

  set toggleMouseEvents(value) {
    this.allowMouseEvents = value;
  }

  set heatingUp(value) {
    this.heatingUpTime = value;
  }

  set coolingDown(value) {
    this.coolingDownTime = value;
  }

  private fireHeatAtLocation = (hex: HexHeatElement) => {
    // variables are located in method because d3.select changes context of this key word
    if (!!hex) {
      const heatingTime = this.heatingUpTime;
      const coolingTime = this.coolingDownTime;
      d3.select(hex.element)
        .transition()
        .duration(heatingTime)
        .style('fill-opacity', .3)
        .style('stroke-opacity', .3)
        .transition()
        .duration(coolingTime)
        .style('fill-opacity', 0)
        .style('stroke-opacity', 0);
    }
  };

  private findHexIndex = coordinates => {
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
        this.points.push([this.hexSize * j * 1.5, this.hexSize * i * 1.5, this.heatColor]);
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
