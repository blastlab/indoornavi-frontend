import {BoxSize, DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import {Point} from '../../map-editor/map.type';
import {DrawConfiguration} from '../../map-viewer/publication.type';
import * as d3 from 'd3';

export class MarkerOnMap {
  protected svgGroupWrapper: SvgGroupWrapper;

  private id: number;
  private markerUnicode = '\uf041'; // fa-map-marker
  private customIconSize: BoxSize = {
    width: 25,
    height: 25
  };

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DrawConfiguration) {
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .addIcon(
        {
          x: coordinates.x - 12,
          y: coordinates.y - 22
        },
        this.markerUnicode,
        2
      );

    this.svgGroupWrapper
      .getGroup()
      .attr('cursor', 'pointer');
  }

  addLabel(label: string) {
    this.svgGroupWrapper.addText(
      {
        x: this.coordinates.x + this.customIconSize.width / 2,
        y: this.coordinates.y - this.customIconSize.height / 2
      },
      label);
  }

  addEvents(events: string[], originMessageEvent: MessageEvent) {
    events.forEach((event: string): void => {
      this.svgGroupWrapper.getGroup().on(event, (): void => {
        // @ts-ignore
        originMessageEvent.source.postMessage({type: `${event}-${this.id}`, objectId: this.id}, originMessageEvent.origin);
      });
    });
  }

  setIcon(icon: string) {
    this.getGroup().removeElements(ElementType.ICON);
    this.svgGroupWrapper
      .getGroup()
      .append('svg:image')
      .attr('xlink:href', icon)
      .attr('x', this.coordinates.x - this.customIconSize.width / 2)
      .attr('y', this.coordinates.y - this.customIconSize.height)
      .attr('width', this.customIconSize.width)
      .attr('height', this.customIconSize.height)
      .attr('stroke', 'black')
      .attr('fill', 'black')
      .attr('cursor', 'pointer');
  }

  remove() {
    this.svgGroupWrapper.remove();
  }

  getGroup() {
    return this.svgGroupWrapper;
  }

  setId(id: number) {
    this.id = id;
  }
}
