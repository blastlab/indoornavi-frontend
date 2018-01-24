import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/published.type';
import {ZoomService} from '../../services/zoom/zoom.service';
import {Helper} from '../helper/helper';

export class SvgGroupWrapper {
  private elements: Map<ElementType, d3.selection[]> = new Map();
  container: d3.selection;
  private color: string;

  constructor(public group: d3.selection,
              container: d3.selection,
              private zoomService: ZoomService,
              colored?: string) {
    this.group = group;
    this.container = container;
    this.color = (colored) ? colored : 'black';
  }

  place(coordinates: Point): SvgGroupWrapper {
    this.group
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  addIcon(coordinates: Point, icon: string): SvgGroupWrapper {
    let element: d3.selection;
    element = this.group
      .append('circle')
      .attr('cx', coordinates.x + 12)
      .attr('cy', coordinates.y + 12)
      .attr('r', '10px')
      .classed('dragarea', true)
      .attr('fill', 'transparent');
    this.addElement(ElementType.DRAGAREA, element);
    element = this.group
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .attr('stroke', this.color)
      .attr('fill', this.color);
    this.addElement(ElementType.ICON, element);
    return this;
  }

  addPointer(coordinates: Point, icon: string): SvgGroupWrapper {
    let element: d3.selection;
    element = this.group
      .append('circle')
      .attr('cx', coordinates.x + 12)
      .attr('cy', coordinates.y + 12)
      .attr('r', '7px')
      .classed('dragarea', true)
      .attr('fill', 'transparent');
    this.addElement(ElementType.DRAGAREA, element);
    element = this.group
      .append('svg')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .html(icon)
      .classed('pointer', true)
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
      const eventPosition: Point = this.zoomService.calculateInMapEditorRangeEvent({
        x: mousePosition.x,
        y: mousePosition.y
      }, offsetFromBorder);
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

  addBorderBox(defineColor?: string) {
    const boxColor = (defineColor) ? defineColor : this.color;
    const parentElement: SVGElement = this.group.node();
    const domRect: DOMRectInit = parentElement.getBoundingClientRect();
    const boxWidth = 2;
    const padding: {x: number , y: number} = Helper.getChildrenExtremeValues(parentElement);
    const paddingX = padding.x * 1 + boxWidth * 1;
    const paddingY = padding.y - boxWidth - 6;
    this.group
      .append('rect')
      .classed('group-border-box', true)
      .attr('x', paddingX)
      .attr('y', paddingY)
      .attr('width', (domRect.width * 1 + boxWidth * 2))
      .attr('height', (domRect.height * 1 + boxWidth * 2))
      .attr('stroke', boxColor)
      .attr('stroke-width', boxWidth)
      .attr('opacity', '0.5')
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '20,10,5,5,5,10')
      .attr('fill', 'none');
  }

  removeBorderBox() {
    this.group.select('rect.group-border-box').remove();
  }

  strokeConnectingLineBold(): void {
    if (this.group.classed('connection')) {
      this.group.attr('stroke-width', '3');
    }
  }

  strokeConnectingLineNormal(): void {
    if (this.group.classed('connection')) {
      this.group.attr('stroke-width', '1');
    }
  }

  changeColor(newColor) {
    const parentElement: SVGElement = this.group.node();
    const childrenCount: number = parentElement.childElementCount;
    const children: NodeList = parentElement.childNodes;
    for (let i = 0; i < childrenCount; i++) {
      const classed = children[i].attributes['class'];
      if (!classed || (!!classed && classed.value !== 'pointer' && classed.value !== 'dragarea' && classed.value !== 'group-border-box' )) {
        const child = d3.select(children[i]);
        if (child.attr('stroke') !== null) {
          child.attr('stroke', newColor)
        }
        if (child.attr('fill') !== null) {
          child.attr('fill', newColor);
        }
      }
    }
  }

  resetColor() {
    this.changeColor(this.color);
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
      .attr('y', 0).on('mousedown', () => {
        d3.select(`#${this.configuration.id}`).style('cursor', 'pointer')
      })
      .on('mouseup', () => {
        d3.select(`#${this.configuration.id}`).style('cursor', 'move')
      });
    if (this.configuration.cursor) {
      group.style('cursor', this.configuration.cursor);
    }
    return (this.configuration.color)
      ? new SvgGroupWrapper(group, this.appendable, this.zoomService, this.configuration.color)
      : new SvgGroupWrapper(group, this.appendable, this.zoomService);
  }
}

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE,
  DRAGAREA
}
