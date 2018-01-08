import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';


export class HexagonHeatmap {
  private strokeWidth: number = 1;
  private heatingUpTime: number = 10;
  private coolingDownTime: number = 15000;
  private allowMouseEvents: boolean = false;
  private points: any[] = [];
  private hexGridTable: any[] = [];
  private svg: any;
  private hexMap: any;

  constructor (private width: number,
               private height: number,
               private hexSize: number,
               private margin: Margin,
               private heatColor: string) {
    this.width = width;
    this.height = height;
    this.hexSize = hexSize;
    this.margin = margin;
    this.heatColor = heatColor;
    this.calculatePoints();
  }

  create (id: string) {
    const hexbin = d3Hexbin.hexbin().radius(this.hexSize);
    const points = this.points;
    const strokeColor = this.heatColor;
    const mouseEvents = this.allowMouseEvents;
    const heatingTime = this.heatingUpTime;
    const coolingTime = this.coolingDownTime;
    const strokeWidth = this.strokeWidth;
    const hexGridTable = [];

    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'hexagon-heatmap')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    function heatUp (d) {
      if (mouseEvents) {
        const el = d3.select(this)
          .transition()
          .duration(heatingTime)
          .style('fill-opacity', .5)
          .style('stroke-opacity', .3);
      }
    }

    function coolDown (d) {
      if(mouseEvents) {
        const el = d3.select(this)
          .transition()
          .duration(coolingTime)
          .style('fill-opacity', 0)
          .style('stroke-opacity', 0);
      }
    }

    this.hexMap = this.svg.append('g')
      .selectAll('.hexagon')
      .data(hexbin(points))
      .enter().append('path')
      .attr('class', 'hexagon')
      .attr('d', function (d) {
        hexGridTable.push({x: d.x, y: d.y});
        return 'M' + d.x + ',' + d.y + hexbin.hexagon();
      })
      .attr('stroke', function (d, i) {
        return strokeColor;
      })
      .style('stroke-opacity', 0)
      .attr('stroke-width', `${strokeWidth}px`)
      .style('fill', function (d,i) {
        return points[i][2];
      })
      .style('fill-opacity', 0)
      .on('mouseover', heatUp)
      .on('mouseout', coolDown);

    this.hexGridTable = hexGridTable;

  }

  feedWithCoordinates (data) {
    const heatingTime = this.heatingUpTime;
    const coolingTime = this.coolingDownTime;

    const findHexIndex = coordinates => {
      return this.hexGridTable.findIndex(hex => hex.x > coordinates.x && hex.y > coordinates.y);
    };

    const fireHeatAtLocation = index => {
      d3.select(this.hexMap[0][index])
        .transition()
        .duration(heatingTime)
        .style('fill-opacity', .3)
        .style('stroke-opacity', .3)
        .transition()
        .duration(coolingTime)
        .style('fill-opacity', 0)
        .style('stroke-opacity', 0);
    };

    if (Array.isArray(data)) {
      data.length < 20 ? data.forEach(arg => fireHeatAtLocation(findHexIndex(arg))) : data.slice(0, 19).forEach(arg => fireHeatAtLocation(findHexIndex(arg)));
    } else {
      fireHeatAtLocation(findHexIndex(data));
    }

  }

  set toggleMouseEvents (value) {
    this.allowMouseEvents = value;
  }

  set heatingUp (value) {
    this.heatingUpTime = value;
  }

  set coolingDown (value) {
    this.coolingDownTime = value;
  }

  private calculateMap () {
    const mapColumns = Math.ceil(this.width / (this.hexSize * 1.5));
    const mapRows = Math.ceil(this.height / (this.hexSize * 1.5));
    return [mapColumns, mapRows];
  }

  private calculatePoints () {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push([this.hexSize * j * 1.5, this.hexSize * i * 1.5, this.heatColor]);
      }
    }
  }

}

export interface Margin {
  left: number,
  right: number,
  top: number,
  bottom: number
}
