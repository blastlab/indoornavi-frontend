import * as d3 from 'd3';
import {Point, PositionDescription, TextPosition} from '../../../map-editor/map.type';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {LayersOwner} from './layers.owner';

export enum ElementType {
  ICON,
  TEXT,
  POLYGON,
  CIRCLE,
  LINE,
  DRAG_AREA,
  IMAGE,
  RECT
}

export class SvgGroupLayer {

  private name: string;

  constructor(private readonly group: d3.selection,
              name?: String
  ) {}

  getLayerGroup(): d3.selection {
    return this.group;
  }

  getLayerName(): string {
    return !!this.name ? this.name : null;
  }

  setVisible(): this {
    this.group
      .attr('visibility', 'visible');
    return this;
  }

  setHidden(): this {
    this.group
      .attr('visibility', 'hidden');
    return this;
  }
}

export class SvgGroupWrapper {
  container: d3.selection;
  private elements: Map<ElementType, d3.selection[]> = new Map();
  private textsHidden: boolean = true;
  private readonly groupDefaultColor: string;

  static throwErrorTypeNull(elementType: ElementType): void {
    throw new Error(`${elementType} is null or undefined`);
  }

  static setLineCurveData() {
    return d3.line()
      .x((points: Point) => points.x)
      .y((points: Point) => points.y)
      .curve(d3.curveLinear);
  }

  constructor(readonly group: d3.selection,
              container: d3.selection,
              colored?: string) {
    this.group = group;
    this.container = container;
    this.groupDefaultColor = (colored) ? colored : 'black';
  }

  addIcon(coordinates: Point, iconCode: string, iconSizeScalar?: number, transformHorizontal?: number, transformVertical?: number): SvgGroupWrapper {
    if (!!iconSizeScalar && (!transformHorizontal || !transformVertical)) {
      throw new Error('Icon size scalar must be set with horizontal transformation and vertical transformation set to integer');
    }

    let element: d3.selection;
    const x: number = transformHorizontal ? transformHorizontal : 0;
    const y: number = transformVertical ? transformVertical : 0;
    // create icon
    element = this.group
      .append('text')
      .attr('class', 'font-icon')
      .attr('x', coordinates.x - x)
      .attr('y', coordinates.y - y)
      .attr('font-family', 'FontAwesome')
      .attr('cursor', 'inherit')
      .text(iconCode);

    // set icon size
    if (!!iconSizeScalar) {
      element.attr('font-size', `${iconSizeScalar}px`);
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

  addText(position: TextPosition, text: string, color: string = this.groupDefaultColor): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('text')
      .attr('x', position.coordinates.x)
      .attr('y', position.coordinates.y)
      .attr('fill', color)
      .text(text);
    this.addElement(ElementType.TEXT, element);
    if (position.description === PositionDescription.CENTRE) {
      const x: number = (position.coordinates.x - element.node().getComputedTextLength()) / 2;
      const y: number = element.node().getBoundingClientRect().height + position.coordinates.y;
      element.attr('x', x).attr('y', y);
    }
    return this;
  }

  addBackground(coordinates: Point, color: string = this.groupDefaultColor): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('rect')
      .attr('x', coordinates.x - 10)
      .attr('y', coordinates.y - 15)
      .attr('width', 80)
      .attr('height', 20)
      .attr('fill', color);
    this.addElement(ElementType.RECT, element);
    return this;
  }

  hideElement(type: ElementType): SvgGroupWrapper {
    const elementToHide: d3.election = this.getElements(type);
    if (!!elementToHide) {
      elementToHide.forEach((element: d3.selection) => {
        element.attr('display', 'none');
      });
    }
    return this;
  }

  getTexts(): d3.selection[] {
    return this.getElements(ElementType.TEXT);
  }

  showTexts(): SvgGroupWrapper {
    const textsToShow: d3.selection[] = this.getTexts();
    if (!!textsToShow) {
      textsToShow.forEach((text: d3.selection) => {
        text.attr('display', 'block');
      });
    }
    this.textsHidden = false;
    return this;
  }

  hideTexts(): SvgGroupWrapper {
    const textsToHide: d3.selection[] = this.getTexts();
    if (!!textsToHide) {
      textsToHide.forEach((text: d3.selection) => {
        text.attr('display', 'none');
      });
    }
    this.textsHidden = true;
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

  addLineType(points: Point[], type: string, radius: number): SvgGroupWrapper {
    const lineType = {
      'solid': () => this.addPolyline(points, radius),
      'dotted': () => this.addDottedPolyline(points)
    };
    return lineType[type]();
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

  setVisibility(visible: boolean): void {
    const displayValue: string = visible ? `inline` : `none`;
    return this.group.attr(`display`, displayValue);
  }

  protected addElement(type: ElementType, element: d3.selection): void {
    if (this.elements.has(type)) {
      this.elements.get(type).push(element);
    } else {
      this.elements.set(type, [element]);
    }
  }

  private addDottedPolyline(points: Point[]): SvgGroupWrapper {
    const element: d3.selection = this.group
      .append('path')
      .attr('d', SvgGroupWrapper.setLineCurveData()(points));
    this.addElement(ElementType.LINE, element);
    return this;
  }

}

export class DrawBuilder {
  protected group: d3.selection;
  private layerOwner: LayersOwner;

  constructor(protected appendable: d3.selection,
              protected configuration: DrawConfiguration) {
    this.layerOwner = LayersOwner.getInstance();
  }

  createLayer(layer: d3.selection): number {
    if (!this.configuration.name) {
      this.configuration.name = this.configuration.id;
    }
    console.log(layer);
    return this.layerOwner.addLayer(new SvgGroupLayer(layer, this.configuration.name));
  }

  updateLayer(layerId: number, layer: d3.selection) {
    this.layerOwner.updateLayerById(layerId, layer);
  }

  removeLayer(layerId: number) {
    this.layerOwner.removeLayerById(layerId);
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

export interface ListLayerEntity {
  id: number;
  name: string;
}
