import * as d3 from 'd3';
import {Point} from '../map-editor/map.type';
import {DrawConfiguration} from './published.type';
import {ZoomService} from '../map-editor/zoom.service';

export class GroupCreated {
  group: d3.selection;
  transitionEnded: boolean = true;

  constructor(group: d3.selection, private zoomService: ZoomService) {
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

  addCircle(coordinates: Point, r: number) {
    this.group
      .append('circle')
      .attr('r', r)
      .attr('cx', coordinates.x)
      .attr('cy', coordinates.y)
      .style('fill', 'black');
    return this;
  }

  setDraggable(): GroupCreated {
    const dragStart = (): void => {
      d3.event.sourceEvent.stopPropagation();
      this.group.classed('dragging', true);
    };

    const dragging = (): void => {
      const mousePosition = <Point>{
        x: d3.event.x,
        y: d3.event.y
      };
      // offsetFromBorder[0] gives left and upper border offset,
      // and offsetFromBorder[1] gives right and bottom border offset,
      // sign is giving a direction of the offset
      // todo: set offset form icon values of width and height or other if suggested
      const offsetFromBorder = [{x : 0, y: 0}, {x: -25, y: -25}];
      const eventPosition: Point = this.zoomService.calculateInMapEditorRangeEvent({x: mousePosition.x, y: mousePosition.y}, offsetFromBorder);
      this.group.attr('x', eventPosition.x).attr('y', eventPosition.y);
    };

    const dragStop = (): void => {
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
              private configuration: DrawConfiguration,
              private zoomService: ZoomService
              ) {
  }

  createGroup(): GroupCreated {
    const group = this.appendable
      .append('svg')
      .attr('id', this.configuration.id)
      .attr('class', this.configuration.clazz)
      .attr('overflow', 'visible')
      .attr('x', 0)
      .attr('y', 0)
      .classed('pointer', true)
      // todo: discus proper cursor for moving device around the map
      .on('mousedown', () => {
        d3.select(`#${this.configuration.id}`).style('cursor', 'pointer')
      })
      .on('mouseup', () => {
        d3.select(`#${this.configuration.id}`).style('cursor', 'move')
      });
    if (this.configuration.cursor) {
      group.style('cursor', this.configuration.cursor);
    }
    return new GroupCreated(group, this.zoomService);
  }
}
