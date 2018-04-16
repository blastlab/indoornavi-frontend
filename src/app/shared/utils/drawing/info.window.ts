import {BoxSize, DrawBuilder, ElementType, SvgGroupWrapper} from './drawing.builder';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {Point} from '../../../map-editor/map.type';
import * as d3 from 'd3';
import {Box, Position} from './drawing.types';


export class InfoWindowGroupWrapper extends SvgGroupWrapper {

  private infoWindowSize: BoxSize = {
    width: 350,
    height: 250
  };
  private infoWindowBoxProps: BoxProps = {
    fill: '#cfdef7',
    color: '#5382d1',
    width: 2,
    opacity: 0.9,
    style: 'solid',
    radius: 10,
    padding: 25
  };

  constructor(protected group: d3.selection) {
    super(group);
  }

  addInfoWindow(coordinates: Point, infoText: string): InfoWindowGroupWrapper {
    const element: d3.selection = this.group
      .append('foreignObject')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('width', this.infoWindowSize.width)
      .attr('height', this.infoWindowSize.height)
      .html(`<div>${infoText}</div>`)
      .style('background-color', this.infoWindowBoxProps.fill)
      .style('border-style', this.infoWindowBoxProps.style)
      .style('border-radius', `${this.infoWindowBoxProps.radius}px`)
      .style('border-width', `${ this.infoWindowBoxProps.width}px`)
      .style('border-color', this.infoWindowBoxProps.color)
      .style('padding', `${this.infoWindowBoxProps.padding}px`)
      .attr('opacity', this.infoWindowBoxProps.opacity);
    this.addElement(ElementType.HTML, element);
    return this;
  }

  set width(width: number) {
    this.infoWindowSize.width = width;
  }

  set height(height: number) {
    this.infoWindowSize.height = height;
  }

  get size(): BoxSize {
    return this.infoWindowSize;
  }

  calculateInfoWindowPosition(object: d3.selection, position: Position): Point {
    const box: Box = object.getGroup().node().getBBox();
    Object.keys(box).forEach((key: string): number => box[key] = Math.round(box[key]));
    const coordinates: Point = { x: 0, y: 0 };
    switch (position) {
      case Position.TOP:
        coordinates.x = box.x + box.width / 2 - this.infoWindowSize.width / 2;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.TOP_LEFT:
        coordinates.x = box.x - this.infoWindowSize.width;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.TOP_RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.LEFT:
        coordinates.x = box.x - this.infoWindowSize.width;
        coordinates.y = box.y + box.height / 2 - this.infoWindowSize.height / 2;
        break;
      case Position.RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.y + box.height / 2 - this.infoWindowSize.height / 2;
        break;
      case Position.BOTTOM:
        coordinates.x = box.x + box.width / 2 - this.infoWindowSize.width / 2;
        coordinates.y = box.y + box.height;
        break;
      case Position.BOTTOM_LEFT:
        coordinates.x = box.x - this.infoWindowSize.width;
        coordinates.y = box.y + box.height;
        break;
      case Position.BOTTOM_RIGHT:
        coordinates.x = box.x + box.width;
        coordinates.y = box.x + box.height;
        break;
    }
    return coordinates;
  }

}

export class InfoWindowBuilder extends DrawBuilder {

  constructor(protected appendable: d3.selection,
              protected configuration: DrawConfiguration) {
    super(
      appendable,
      configuration
    )
  }

  createGroup(): InfoWindowGroupWrapper {
    this.appendSvgToGroup();
    return new InfoWindowGroupWrapper(this.group);
  }
}

interface BoxProps {
  fill: string;
  color: string;
  width: number;
  opacity: number;
  style: string;
  radius: number;
  padding: number;
}
