import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/publication.type';

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE,
  DRAG_AREA,
  IMAGE
}

export class SvgGroupWrapper {
  container: d3.selection;
  private elements: Map<ElementType, d3.selection[]> = new Map();
  private textsHidden: boolean = true;
  private readonly groupDefaultColor: string;

  static throwErrorTypeNull(elementType: ElementType): void {
    throw new Error(`${elementType} is null or undefined`);
  }

  constructor(private group: d3.selection,
              container: d3.selection,
              colored?: string) {
    this.group = group;
    this.container = container;
    this.groupDefaultColor = (colored) ? colored : 'black';
  }

  addIcon(coordinates: Point, iconCode: string, iconSizeMultiplier?: number): SvgGroupWrapper {
    if (!!iconSizeMultiplier && iconSizeMultiplier < 2 || iconSizeMultiplier > 5) {
      throw new Error('Icon size multiplier must be in range <2, 5>');
    }

    let element: d3.selection;

    // create icon
    element = this.group
      .append('text')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('font-family', 'FontAwesome')
      .text(iconCode);

    // set icon size
    if (!!iconSizeMultiplier) {
      element.attr('font-size', `${iconSizeMultiplier}em`);
    }

    this.addElement(ElementType.ICON, element);

    return this;
  }

  place(coordinates: Point): SvgGroupWrapper {
    this.group
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  translate(vector: Point): SvgGroupWrapper {
    d3.selection = this.group
      .attr('x', -vector.x)
      .attr('y', -vector.y);
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
    this.addElement(ElementType.DRAG_AREA, element);
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
      .attr('fill', 'black');
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
    const elements: d3.selection[] = this.elements.get(type);
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

  protected addElement(type: ElementType, element: d3.selection): void {
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
  protected group: d3.selection;

  constructor(protected appendable: d3.selection,
              protected configuration: DrawConfiguration) {
  }

  createGroup(): SvgGroupWrapper {
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
    if (this.configuration.display) {
      this.group.attr('display', this.configuration.display);
    }
    return (this.configuration.color)
      ? new SvgGroupWrapper(this.group, this.appendable, this.configuration.color)
      : new SvgGroupWrapper(this.group, this.appendable);
  }

  getConfiguration(): DrawConfiguration {
    return this.configuration;
  }
}

export interface BoxSize {
  width: number;
  height: number;
}

export interface Box extends BoxSize {
  x: number;
  y: number;
}
