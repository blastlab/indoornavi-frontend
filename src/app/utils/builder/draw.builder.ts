import * as d3 from 'd3';
import {Point} from '../../map-editor/map.type';

export class DrawBuilder {
  private configuration: DrawConfiguration;
  public container: d3.selection;

  constructor(container: d3.selection,
              configuration: DrawConfiguration) {
    this.container = container;
    this.configuration = configuration;
  }

  createGroup(): GroupCreated {
    const group = this.container
      .append('svg')
      .attr('id', this.configuration.id)
      .attr('class', this.configuration.clazz)
      .attr('overflow', 'visible')
      .attr('x', 0)
      .attr('y', 0);
    if (this.configuration.cursor) {
      group.style('cursor', this.configuration.cursor);
    }
    return new GroupCreated(group, this.container);
  }
}

export class GroupCreated {
  domGroup: d3.selection;
  container: d3.selection;

  constructor(domGroup: d3.selection,
              container: d3.selection) {
    this.domGroup = domGroup;
    this.container = container;
  }

  place(coordinates: Point): GroupCreated {
    this.domGroup
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  move(coordinates: Point): GroupCreated {
    this.domGroup
      .transition()
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .duration(1000);
    return this;
  }

  addIcon(coordinates: Point, icon: string): GroupCreated {
    this.domGroup
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .attr('stroke', 'black')
      .attr('fill', 'black');
    return this;
  }

  addPointer(coordinates: Point, icon: string): GroupCreated {
    this.domGroup
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .classed('pointer', true)
      .attr('stroke', 'black')
      .attr('fill', 'black');
    return this;
  }

  addText(coordinates: Point, text: string): GroupCreated {
    this.domGroup
      .append('text')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('fill', 'black')
      .text(text);
    return this;
  }

  remove(): void {
    this.domGroup.remove();
  }
}

export interface DrawConfiguration {
  id: string;
  clazz: string;
  cursor?: string;
}
