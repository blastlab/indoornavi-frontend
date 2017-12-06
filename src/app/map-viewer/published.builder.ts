import * as d3 from 'd3';
import {Point} from '../map-editor/map.type';
import {DrawConfiguration} from './published.type';


export class GroupCreated {
  group: d3.selection;
  transitionEnded: boolean = true;

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
    if (this.transitionEnded) {
      this.group
        .transition()
        .attr('x', coordinates.x)
        .attr('y', coordinates.y)
        .on('start', () => {
          this.transitionEnded = false;
        })
        .on('end', () => {
          this.transitionEnded = true;
        }).duration(1000);
    }
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

  addPolygon(points: Point[], settings?: Map<string, string>): GroupCreated {
    let pointsString = '';
    points.forEach((point: Point) => {
      pointsString += `${point.x},${point.y}`;
    });
    this.group
      .append('polygon')
      .attr('points', pointsString);
    if (!!settings) {
      settings.forEach((value: string, key: string) => {
        this.group
          .attr(key, value);
      });
    }
    return this;
  }

  setDraggable(): GroupCreated {
    const dragStart = (d, index: number, selection: d3.selection[]): void => {
      d3.event.sourceEvent.stopPropagation();
      this.group.classed('dragging', true);
    };

    const dragging = (d, index: number, selections: d3.selection[]): void => {
      const mousePosition = <Point>{
        x: d3.event.x,
        y: d3.event.y
      };
      this.group.attr('x', mousePosition.x).attr('y', mousePosition.y);
    };

    const dragStop = (_, index, selection: d3.selection[]): void => {
      this.group.classed('dragging', false);
    };

    const subject = () => { return { x: d3.event.x, y: d3.event.y }};
    const dragGroup = d3.drag()
      .subject(subject)
      .on('start', dragStart)
      .on('drag', dragging)
      .on('end', dragStop);

    this.group.call(dragGroup);

    return this;
  }

  remove(): void {
    this.group.remove();
  }
}

export class DrawBuilder {

  constructor(private appendable: d3.selection,
              private configuration: DrawConfiguration
              ) {
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
