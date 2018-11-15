import {Box, BoxSize, DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {DrawConfiguration} from '../../../map-viewer/publication.type';
import {Point} from '../../../map-editor/map.type';
import * as d3 from 'd3';
import {APIObject} from './api.types';
import Metadata = APIObject.Metadata;
import Position = APIObject.Position;
import {ModelsConfig} from '../../../map/models/models.config';

export class InfoWindowGroupWrapper {
  private svgGroupWrapper: SvgGroupWrapper;
  private closeIconContainerWidth: number = 13;
  private closeIconContainerHeight: number = 16;

  private infoWindowSize: BoxSize = {
    width: 350,
    height: 250
  };
  private infoWindowBoxProps: BoxProperties = {
    fill: '#cfdef7',
    color: '#5382d1',
    width: 2,
    opacity: 0.9,
    style: 'solid',
    radius: 10,
    padding: 25
  };

  constructor(
    private appendable: d3.selection,
    private configuration: DrawConfiguration,
    private models: ModelsConfig
  ) {
    const drawBuilder =  new DrawBuilder(appendable, configuration);
    this.svgGroupWrapper = drawBuilder.createGroup();
  }

  private get size(): BoxSize {
    return this.infoWindowSize;
  }

  draw(coordinates: Point, infoText: string, callback: Function, objectMetadata: Metadata): InfoWindowGroupWrapper {
    const closingInfoWindowPointCoordinates: Point = {x: coordinates.x + this.size.width - 20, y: coordinates.y + 5 };
    this.svgGroupWrapper.getGroup()
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .append('foreignObject')
      .attr('width', this.infoWindowSize.width)
      .attr('height', this.infoWindowSize.height)
      // height of content should be infoWindowSize.height - 2 x padding top
      .html(`<div class="infoWindow-content" style="height: ${this.infoWindowSize.height - 50}px">${infoText}</div>`)
      .style('background-color', this.infoWindowBoxProps.fill)
      .style('border-style', this.infoWindowBoxProps.style)
      .style('border-radius', `${this.infoWindowBoxProps.radius}px`)
      .style('border-width', `${ this.infoWindowBoxProps.width}px`)
      .style('border-color', this.infoWindowBoxProps.color)
      .style('padding-top', `25px`)
      .attr('opacity', this.infoWindowBoxProps.opacity);

    this.svgGroupWrapper.getGroup()
      .append('foreignObject')
      .attr('x', closingInfoWindowPointCoordinates.x - coordinates.x)
      .attr('y', closingInfoWindowPointCoordinates.y - coordinates.y)
      .attr('width', this.closeIconContainerWidth)
      .attr('height', this.closeIconContainerHeight)
      .attr('fill', 'black')
      .attr('cursor', 'pointer')
      .html('<i class="fa fa-close"></i>')
      .on('click', () => {
        // TODO: post message that info window has been closed to the API source.
        // todo: this todo should be made in future issues
        callback(objectMetadata);
      });

    return this;
  }

  remove(): void {
    this.svgGroupWrapper.remove();
  }

  set width(width: number) {
    this.infoWindowSize.width = width;
  }

  set height(height: number) {
    this.infoWindowSize.height = height;
  }

  calculateInfoWindowPosition(object: d3.selection, position: Position): Point {
    const element: d3.selection = object.getGroup();
    const box: Box = {
      x: element.attr('x'),
      y: element.attr('y'),
      height: element.node().getBBox().height,
      width: element.node().getBBox().width
    };
    Object.keys(box).forEach((key: string): number => box[key] = Math.round(box[key]));
    const coordinates: Point = { x: 0, y: 0 };
    switch (position) {
      case Position.TOP:
        coordinates.x = box.x - this.infoWindowSize.width / 2 + this.models.iconSizeScalar / 2;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.TOP_LEFT:
        coordinates.x = box.x - this.infoWindowSize.width;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.TOP_RIGHT:
        coordinates.x = box.x + box.width / 2;
        coordinates.y = box.y - this.infoWindowSize.height;
        break;
      case Position.LEFT:
        coordinates.x = box.x - this.infoWindowSize.width;
        coordinates.y = box.y + box.height / 2 - this.infoWindowSize.height / 2;
        break;
      case Position.RIGHT:
        coordinates.x = box.x + box.width / 2;
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
        coordinates.x = box.x + box.width / 2;
        coordinates.y = box.x + box.height;
        break;
    }
    return coordinates;
  }

}

interface BoxProperties {
  fill: string;
  color: string;
  width: number;
  opacity: number;
  style: string;
  radius: number;
  padding: number;
}
