import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/published.type';
import {ZoomService} from '../../services/zoom/zoom.service';

export class SvgGroupWrapper {
  private elements: Map<ElementType, d3.selection[]> = new Map();

  constructor(private group: d3.selection, private zoomService: ZoomService) {
  }

  place(coordinates: Point): SvgGroupWrapper {
    this.group
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  addIcon(coordinates: Point, icon: string): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .attr('stroke', 'black')
      .attr('fill', 'black');
    this.addElement(ElementType.ICON, element);
    return this;
  }

  addText(coordinates: Point, text: string): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('text')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('fill', 'black')
      .text(text);
    this.addElement(ElementType.TEXT, element);
    return this;
  }

  addPolygon(points: Point[]): SvgGroupWrapper {
    let pointsString = '';
    points.forEach((point: Point) => {
      pointsString += `${point.x},${point.y} `;
    });
    const element: d3.selection = this.group
      .append('polygon')
      .attr('points', pointsString);
    this.addElement(ElementType.POLYGON, element);
    return this;
  }

  addCircle(coordinates: Point, r: number): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('circle')
      .attr('r', r)
      .attr('cx', coordinates.x)
      .attr('cy', coordinates.y)
      .style('fill', 'black');
    this.addElement(ElementType.CIRCLE, element);
    return this;
  }

  addLine(start: Point, stop: Point): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('line')
      .attr('x1', start.x)
      .attr('y1', start.y)
      .attr('x2', stop.x)
      .attr('y2', stop.y)
      .attr('stroke-width', 1)
      .attr('stroke', 'black');
    this.addElement(ElementType.LINE, element);
    return this;
  }

  setDraggable(customDragging?: () => void): SvgGroupWrapper {
    const dragStart = (): void => {
      d3.event.sourceEvent.stopPropagation();
      this.group.classed('dragging', true);
    };

    const dragging = !!customDragging ? customDragging : (): void => {
      const mousePosition = <Point>{
        x: d3.event.x,
        y: d3.event.y
      };
      // offsetFromBorder[0] gives left and upper border offset,
      // and offsetFromBorder[1] gives right and bottom border offset,
      // sign is giving a direction of the offset
      const offsetFromBorder = [{x: 0, y: 0}, {x: -25, y: -25}];
      const eventPosition: Point = this.zoomService.calculateInMapEditorRangeEvent({x: mousePosition.x, y: mousePosition.y}, offsetFromBorder);
      this.group.attr('x', d3.event.dx + parseInt(this.group.attr('x'), 10)).attr('y', d3.event.dy + parseInt(this.group.attr('y'), 10));
    };

    const dragStop = (): void => {
      this.group.classed('dragging', false);
    };

    const subject = () => {
      return {x: d3.event.x, y: d3.event.y}
    };
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

  getGroup(): d3.selection {
    return this.group;
  }

  getElements(type: ElementType): d3.selection[] {
    return this.elements.get(type);
  }

  getLastElement(type: ElementType): d3.selection {
    const elements: d3.selection[] = this.elements.get(type);
    return elements[elements.length - 1];
  }

  removeElements(type: ElementType) {
    const elements = this.elements.get(type);
    if (!!elements) {
      elements.forEach((element: d3.selection) => {
        element.remove();
      });
      elements.length = 0;
    }
  }

  removeLastElement(type: ElementType) {
    const elements = this.elements.get(type);
    if (!!elements) {
      elements[elements.length - 1].remove();
      elements.splice(-1, 1);
    }
  }

  private addElement(type: ElementType, element: d3.selection) {
    if (this.elements.has(type)) {
      this.elements.get(type).push(element);
    } else {
      this.elements.set(type, [element]);
    }
  }
}

export class DrawBuilder {

  constructor(private appendable: d3.selection,
              private configuration: DrawConfiguration,
              private zoomService: ZoomService) {
  }

  createGroup(): SvgGroupWrapper {
    const group = this.appendable
      .append('svg')
      .attr('id', this.configuration.id)
      .attr('class', this.configuration.clazz)
      .attr('overflow', 'visible')
      .attr('x', 0)
      .attr('y', 0);
    if (this.configuration.cursor) {
      group.style('cursor', this.configuration.cursor);
    }
    return new SvgGroupWrapper(group, this.zoomService);
  }
}

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE
}
