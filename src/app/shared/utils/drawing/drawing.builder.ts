import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {Helper} from '../helper/helper';
import {Anchor, Sink} from '../../../device/device.type';

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE,
  DRAGAREA
}

export class SvgGroupWrapper {
  private elements: Map<ElementType, d3.selection[]> = new Map();
  private textsHidden: boolean = true;
  container: d3.selection;
  private groupDefaultColor: string;

  static throwErrorTypeNull (elementType: ElementType): void {
    throw new Error(`${elementType} is null or undefined`);
  }

  constructor(private group: d3.selection,
              container: d3.selection,
              colored?: string) {
    this.group = group;
    this.container = container;
    this.groupDefaultColor = (colored) ? colored : 'black';
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
      .attr('stroke', this.groupDefaultColor)
      .attr('fill', this.groupDefaultColor);
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
      .attr('fill', this.groupDefaultColor)
      .attr('display', 'none')
      .text(text);
    this.addElement(ElementType.TEXT, element);
    return this;
  }

  getTexts(): d3.selection[] {
    return this.getElements(ElementType.TEXT);
  }

  showTexts(): void {
    const textsToShow: d3.selection[] = this.getTexts();
    if (!!textsToShow) {
      textsToShow.forEach((text: d3.selection) => {
        text.attr('display', 'block');
      });
    }
    this.textsHidden = false;
  }

  hideTexts(): void {
    const textsToHide: d3.selection[] = this.getTexts();
    if (!!textsToHide) {
      textsToHide.forEach((text: d3.selection) => {
        text.attr('display', 'none');
      });
    }
    this.textsHidden = true;
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

  remove(): void {
    this.group.remove();
  }

  addBorderBox(scale: number, defineColor?: string) {
    const boxColor = (defineColor) ? defineColor : this.groupDefaultColor;
    const parentElement: SVGElement = this.group.node();
    const domRect: DOMRectInit = parentElement.getBoundingClientRect();
    const boxWidth = 2;
    const padding: {x: number , y: number} = Helper.getChildrenExtremeValues(parentElement);
    const paddingX = padding.x * 1 + boxWidth * 1;
    let paddingY = padding.y - boxWidth - 6;
    if (this.textsHidden) {
      paddingY += 10;
    }
    this.group
      .append('rect')
      .classed('group-border-box', true)
      .attr('x', paddingX)
      .attr('y', paddingY)
      .attr('width', (domRect.width * (1 / scale) + boxWidth * 2))
      .attr('height', (domRect.height * (1 / scale) + boxWidth * 2))
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
    this.changeColor(this.groupDefaultColor);
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
  }

  removeLastElement(type: ElementType): void {
    const elements = this.elements.get(type);
    if (!!elements) {
      elements[elements.length - 1].remove();
      elements.splice(-1, 1);
    }
  }

  private addElement(type: ElementType, element: d3.selection): void {
    if (this.elements.has(type)) {
      this.elements.get(type).push(element);
    } else {
      this.elements.set(type, [element]);
    }
  }

  setVisibility(visible: boolean): void {
    const displayValue: string = visible ? `inline` : `none`;
    return this.group.attr(`display`, displayValue);
  }

}

export class DrawBuilder {

  static buildAnchorDrawConfiguration(anchor: Anchor): DrawConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      name: `${anchor.name}`,
      cursor: `pointer`,
      color: `green`,
      display: `none`
    };
  }

  static buildSinkDrawConfiguration(sink: Sink): DrawConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      name: `${sink.name}`,
      cursor: `pointer`,
      color: `orange`,
      display: `none`
    };
  }

  static buildConnectingLineConfiguration(id: string | number): DrawConfiguration {
    return {
      id: `line${id}`,
      clazz: `connection`,
      cursor: `inherit`,
      color: `orange`
    };
  }

  constructor(protected appendable: d3.selection,
              protected configuration: DrawConfiguration) {
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
    if (this.configuration.display) {
      group.attr('display', this.configuration.display);
    }
    return (this.configuration.color)
      ? new SvgGroupWrapper(group, this.appendable, this.configuration.color)
      : new SvgGroupWrapper(group, this.appendable);
  }
}
