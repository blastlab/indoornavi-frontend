import * as d3 from 'd3';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {Point} from '../../../map-editor/map.type';


export class SvgGroupWrapper {
  static customIconSize: BoxSize = {
    width: 25,
    height: 25
  };
  private elements: Map<ElementType, d3.selection[]> = new Map();

  static throwErrorTypeNull(elementType: ElementType): void {
    throw new Error(`${elementType} is null or undefined`);
  }

  constructor(private group: d3.selection) {
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

  addCustomIcon(coordinates: Point, image: string): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('svg:image')
      .attr('id', '1')
      .attr('xlink:href', image)
      .attr('x', coordinates.x - SvgGroupWrapper.customIconSize.width / 2)
      .attr('y', coordinates.y - SvgGroupWrapper.customIconSize.height)
      .attr('width', SvgGroupWrapper.customIconSize.width)
      .attr('height', SvgGroupWrapper.customIconSize.height)
      .attr('stroke', 'black')
      .attr('fill', 'black');
    this.addElement(ElementType.IMAGE, element);
    return this;
  }

  translate(vector: Point): SvgGroupWrapper {
    d3.selection = this.group
      .attr('x', -vector.x)
      .attr('y', -vector.y);
    return this;
  }

  addText(coordinates: Point, text: string): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('text')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('id', 'marker')
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

  addPolyline(points: Point[], radius: number): SvgGroupWrapper {
    let lastPoint: Point;
    points.forEach((point: Point): void => {
      this.addCircle(point, radius);
      if (!!lastPoint) {
        this.addLine(lastPoint, point);
      }
      lastPoint = point;
    });
    return this;
  }

  setDraggable(customDragging?: () => void): SvgGroupWrapper {
    const dragStart = (): void => {
      d3.event.sourceEvent.stopPropagation();
      this.group.classed('dragging', true);
    };

    const dragging = !!customDragging ? customDragging : (): void => {
      this.group.attr('x', d3.event.dx + parseInt(this.group.attr('x'), 10)).attr('y', d3.event.dy + parseInt(this.group.attr('y'), 10));
    };

    const dragStop = (): void => {
      this.group.classed('dragging', false);
    };

    const subject = (): Point => {
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
    if (!!elements) {
      return elements[elements.length - 1];
    }
    SvgGroupWrapper.throwErrorTypeNull(type);
  }

  removeElements(type: ElementType): void {
    const elements = this.elements.get(type);
    if (!!elements) {
      elements.forEach((element: d3.selection) => {
        element.remove();
      });
      elements.length = 0;
    }
    SvgGroupWrapper.throwErrorTypeNull(type);
  }

  removeLastElement(type: ElementType): void {
    const elements = this.elements.get(type);
    if (!!elements) {
      elements[elements.length - 1].remove();
      elements.splice(-1, 1);
    }
  }

  protected addElement(type: ElementType, element: d3.selection): void {
    if (this.elements.has(type)) {
      this.elements.get(type).push(element);
    } else {
      this.elements.set(type, [element]);
    }
  }
}


export class DrawBuilder {
  protected group: d3.selection;

  constructor(protected appendable: d3.selection,
              protected configuration: DrawConfiguration) {
  }

  createGroup(): SvgGroupWrapper {
    this.appendSvgToGroup();
    return new SvgGroupWrapper(this.group);
  }

  protected appendSvgToGroup() {
    this.group = this.appendable
      .append('svg')
      .attr('id', this.configuration.id)
      .attr('class', this.configuration.clazz)
      .attr('overflow', 'visible')
      .attr('x', 0)
      .attr('y', 0);
    if (this.configuration.cursor) {
      this.group.style('cursor', this.configuration.cursor);
    }
  }
}

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE,
  IMAGE,
  HTML
}

export interface BoxSize {
  width: number;
  height: number;
}
