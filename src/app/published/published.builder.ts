import * as d3 from 'd3';
import {Point} from '../map/map.type';

export class DrawBuilder {
  private appendable: d3.selection;
  private configuration: DrawConfiguration;

  constructor(appendable: d3.selection,
              configuration: DrawConfiguration) {
    this.appendable = appendable;
    this.configuration = configuration;
  }

  createGroup(): GroupCreated {
    const group = this.appendable
      .append('svg')
      .attr('id', this.configuration.id)
      .attr('class', this.configuration.clazz)
      .attr('x', 0)
      .attr('y', 0);
    if (this.configuration.cursor) {
      group.style('cursor', this.configuration.cursor);
    }
    return new GroupCreated(group);
  }
}

export class GroupCreated {
  group: d3.selection;

  constructor(group: d3.selection) {
    this.group = group;
  }

  place(coordinates: Point): GroupCreated {
    this.group
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  move(coordinates: Point): GroupCreated {
    this.group
      .transition()
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .duration(1000);
    return this;
  }

  addIcon(coordinates: Point, icon: string): GroupCreated {
    this.group
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .attr('stroke', 'black')
      .attr('fill', 'black');
    return this;
  }

  addText(coordinates: Point, text: string): GroupCreated {
    this.group
      .append('text')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('fill', 'black')
      .text(text);
    return this;
  }

  remove(): void {
    this.group
      .remove();
  }
}

export interface DrawConfiguration {
  id: string;
  clazz: string;
  cursor?: string;
}
