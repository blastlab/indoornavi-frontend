import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import {Point, PositionDescription} from '../../map-editor/map.type';
import {DrawConfiguration} from '../../map-viewer/publication.type';
import * as d3 from 'd3';
import {ModelsConfig} from './models.config';

export class MarkerOnMap {
  protected svgGroupWrapper: SvgGroupWrapper;

  private id: number;
  private markerUnicode = '\uf041'; // fa-map-marker
  private customIconSize: BoxSize = {
    width: 55,
    height: 55
  };

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DrawConfiguration,
    private models: ModelsConfig
  ) {
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place({ x: coordinates.x - this.models.defaultIconSize.width / 2, y: coordinates.y })
      .addIcon(
        {x: 0, y: 0},
        this.models.markerUnicode,
        this.models.iconSizeScalar,
        this.models.transformHorizontal,
        this.models.transformVertical
      );

    this.svgGroupWrapper
      .getGroup()
      .attr('cursor', 'pointer');
  }

  addLabel(label: string): void {
    const isIconFont  = this.svgGroupWrapper.getGroup().selectAll('.font-icon').data().map( d => d).length > 0 ;
    let x = 0;
    let y = 0;
    if (!isIconFont) {
      x = this.models.customIconSize.width;
      y = this.models.customIconSize.height;
    }
    this.svgGroupWrapper
      .addText({coordinates: {x: x, y: y}, description: PositionDescription.CENTRE}, label, '#000');
  }

  addEvents(events: string[], originMessageEvent: MessageEvent): void {
    events.forEach((event: string): void => {
      this.svgGroupWrapper.getGroup().on(event, (): void => {
        // @ts-ignore
        originMessageEvent.source.postMessage({type: `${event}-${this.id}`, objectId: this.id}, '*');
      });
    });
  }

  setIconFromUrl(iconUrl: string): void {
    this.getGroup().removeElements(ElementType.ICON);
    const element: d3.selection = this.svgGroupWrapper
      .place({
        x: this.coordinates.x - this.models.customIconSize.width / 2,
        y: this.coordinates.y - this.models.customIconSize.height
      })
      .getGroup()
      .append('svg:image')
      .attr('xlink:href', iconUrl)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.models.customIconSize.width)
      .attr('height', this.models.customIconSize.height)
      .attr('stroke', 'black')
      .attr('fill', 'black')
      .attr('cursor', 'pointer');
    this.svgGroupWrapper.getElements(ElementType.ICON).push(element);
  }

  setIconFromBase64(iconBase64String: string): void {
    this.getGroup().removeElements(ElementType.ICON);
    const element: d3.selection = this.svgGroupWrapper
      .place({
        x: this.coordinates.x - this.customIconSize.width / 2,
        y: this.coordinates.y - this.customIconSize.height
      })
      .getGroup()
      .append('svg:image')
      .attr('xlink:href', 'data:image/png;base64,' + iconBase64String)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.customIconSize.width)
      .attr('height', this.customIconSize.height);
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
