import {Point} from '../map/map.type';
import * as d3 from 'd3';

export class HeatMapBuilder {
  private appendable: d3.selection;
  private coordinates: Point;
  private deviceId: number;

  constructor(appendable: d3.selection,
              coordinates: Point,
              deviceId: number) {
    this.appendable = appendable;
    this.coordinates = coordinates;
    this.deviceId = deviceId;
  }

  createHeatGroup(): HeatMapCreated {
    const group = this.appendable;
    return new HeatMapCreated(group);
  }
}

export class HeatMapCreated {
  private heatPointsList: Array<Point> = [];
  group: d3.selection;

  constructor(group: d3.selection) {
    this.group = group;
  }

  update(coordinates: Point): HeatMapCreated {
    const filteredCoordinates = {
      x: Math.round(coordinates.x),
      y: Math.round(coordinates.y)
    };
    this.heatPointsList.push(filteredCoordinates);
    setTimeout(() => {
      this.group
        .selectAll('heat-rect')
        .data(this.heatPointsList)
        .enter()
        .append('rect')
        .attr('x', d => d.x - 5)
        .attr('y', d => d.y - 5)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'red');
    }, 1000);
    return this;
  }
}

export interface MapConfiguration {
  id: string;
  clazz: string;
}
