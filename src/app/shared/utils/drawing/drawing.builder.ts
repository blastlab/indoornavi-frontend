import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {Helper} from '../helper/helper';
import {Anchor, Sink} from '../../../device/device.type';
import {CommonDeviceConfiguration} from './common/device.common';

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
  static customIconSize: BoxSize = {
    width: 25,
    height: 25
  };
  container: d3.selection;
  private elements: Map<ElementType, d3.selection[]> = new Map();
  private textsHidden: boolean = true;
  private groupDefaultColor: string;

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

  addIcon2(coordinates: Point, iconCode: string, iconSizeMultiplier?: number): SvgGroupWrapper {
    if (!!iconSizeMultiplier && iconSizeMultiplier < 2 || iconSizeMultiplier > 5) {
      throw new Error('Icon size multiplier must be in range <2, 5>');
    }

    let element: d3.selection;

    // create drag area
    element = this.group
      .append('circle')
      .attr('cx', coordinates.x + 12)
      .attr('cy', coordinates.y + 12)
      .attr('r', '10px')
      .classed('dragarea', true)
      .attr('fill', 'transparent');

    this.addElement(ElementType.DRAG_AREA, element);

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

  addRectangle (coordinates: Point, size: Point, opacity?: number, color?: string, smoothCorners?: boolean): SvgGroupWrapper {
    const opacityValue: number = !!opacity ? opacity : 0;
    const colorValue: string = !!color ? color : '#FFFFFF';

    const element: d3.selection = this.group
      .append('rect')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('width', size.x)
      .attr('height', size.y)
      .attr('fill', colorValue)
      .attr('stroke', colorValue)
      .attr('opacity', opacityValue);

    if (smoothCorners) {
      element
        .attr('rx', 16)
        .attr('ry', 16);
    }
    return this;
  }

  place(coordinates: Point): SvgGroupWrapper {
    this.group
      .attr('x', coordinates.x)
      .attr('y', coordinates.y);
    return this;
  }

  // TODO: remove if no more uses
  addIcon(coordinates: Point, icon: string): SvgGroupWrapper {
    let element: d3.selection;
    element = this.group
      .append('circle')
      .attr('cx', coordinates.x + 12)
      .attr('cy', coordinates.y + 12)
      .attr('r', '10px')
      .classed('dragarea', true)
      .attr('fill', 'transparent');
    this.addElement(ElementType.DRAG_AREA, element);
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

  // TODO: this should be part of MarkerOnMap class
  addCustomIcon(coordinates: Point, image: string): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('svg:image')
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

  addBorderBox(scale: number, defineColor?: string): void {
    const boxColor: string = (defineColor) ? defineColor : this.groupDefaultColor;
    const parentElement: SVGElement = this.group.node();
    const domRect: DOMRectInit = parentElement.getBoundingClientRect();
    const boxWidth = 2;
    const padding: Point = Helper.getChildrenExtremeValues(parentElement);
    const paddingX: number = padding.x * 1 + boxWidth * 1;
    let paddingY: number = padding.y - boxWidth - 6;
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

  removeBorderBox(): void {
    this.group.select('rect.group-border-box').remove();
  }

  // TODO: Refactor this method to be more specific - remember about usages
  changeColor(newColor): void {
    const parentElement: SVGElement = this.group.node();
    const childrenCount: number = parentElement.childElementCount;
    const children: NodeList = parentElement.childNodes;
    for (let i = 0; i < childrenCount; i++) {
      const classed: Attr = children[i]['attributes']['class'];
      if (!classed || (!!classed && classed.value !== 'pointer' && classed.value !== 'dragarea' && classed.value !== 'group-border-box')) {
        const child: d3.selection = d3.select(children[i]);
        if (child.attr('stroke') !== null) {
          child.attr('stroke', newColor)
        }
        if (child.attr('fill') !== null) {
          child.attr('fill', newColor);
        }
      }
    }
  }

  resetColor(): void {
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


  // TODO: remove this or move to proper class
  static buildAnchorDrawConfiguration(anchor: Anchor): CommonDeviceConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      name: `${anchor.name}`,
      cursor: `pointer`,
      color: `green`,
      display: `none`,
      heightInMeters: anchor.z / 100
    };
  }

  static buildSinkDrawConfiguration(sink: Sink): CommonDeviceConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      name: `${sink.name}`,
      cursor: `pointer`,
      color: `orange`,
      display: `none`,
      heightInMeters: sink.z / 100
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
