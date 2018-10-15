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

  private defaultIconSize: BoxSize = {
    width: 10,
    height: 32
  };

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DrawConfiguration) {
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place({ x: coordinates.x - this.defaultIconSize.width / 2, y: coordinates.y })
      .addIcon(
        {
          x: 0,
          y: 0
        },
        this.markerUnicode,
        2
      );

    this.svgGroupWrapper
      .getGroup()
      .attr('cursor', 'pointer');
  }

  addLabel(label: string): void {
    this.svgGroupWrapper.addText(
      {
        x: this.customIconSize.width / 2,
        y: this.customIconSize.height / 2
      },
      label);
  }

  addEvents(events: string[], originMessageEvent: MessageEvent): void {
    events.forEach((event: string): void => {
      this.svgGroupWrapper.getGroup().on(event, (): void => {
        // @ts-ignore
        originMessageEvent.source.postMessage({type: `${event}-${this.id}`, objectId: this.id}, '*');
      });
    });
  }

  setIcon(icon: string): void {
    this.getGroup().removeElements(ElementType.ICON);
    const element: d3.selection = this.svgGroupWrapper
      .place({
        x: this.coordinates.x - this.customIconSize.width / 2,
        y: this.coordinates.y - this.customIconSize.height
      })
      .getGroup()
      .append('svg:image')
      .attr('xlink:href', icon)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.customIconSize.width)
      .attr('height', this.customIconSize.height)
      .attr('stroke', 'black')
      .attr('fill', 'black')
      .attr('cursor', 'pointer');
    this.svgGroupWrapper.getElements(ElementType.ICON).push(element);
  }

  remove(): void {
    this.svgGroupWrapper.remove();
  }

  getGroup(): SvgGroupWrapper {
    return this.svgGroupWrapper;
  }

  setId(id: number): void {
    this.id = id;
  }
}
