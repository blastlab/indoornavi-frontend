import {Point, Point3d} from '../../map-editor/map.type';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {DrawConfiguration} from '../../map-viewer/publication.type';
import {ModelsConfig} from './models.config';

export class TagOnMap {
  static TRANSITION_DURATION: number = 1000;

  protected svgGroupWrapper: SvgGroupWrapper;
  private transitionEnded: boolean = true;
  private shortId: number;

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DrawConfiguration,
    protected models: ModelsConfig
  ) {
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .addIcon(
        {x: 0, y: 0},
        this.models.tagUnicode,
        this.models.iconSizeScalar,
        this.models.transformHorizontal,
        this.models.transformVertical
      )
      .addText({coordinates: {x: 0, y: 36}}, this.getDeviceDescription(), 'f000')
      .place({x: coordinates.x, y: coordinates.y});
  }

  setShortId(id: number) {
    this.shortId = id;
    return this;
  }

  getIconElement(): d3.selection {
    return this.svgGroupWrapper.getLastElement(ElementType.ICON);
  }

  move(destination: Point3d): Promise<number> {
    return new Promise((resolve) => {
      this.svgGroupWrapper.getGroup()
        .transition()
        .attr('x', destination.x)
        .attr('y', destination.y)
        .on('start', () => {
          this.transitionEnded = false;
        })
        .on('end', () => {
          this.transitionEnded = true;
          resolve(this.shortId);
        }).duration(TagOnMap.TRANSITION_DURATION);
    });
  }

  remove() {
    this.svgGroupWrapper.remove();
  }

  hasTransitionEnded() {
    return this.transitionEnded;
  }

  private getDeviceDescription(): string {
    return `${this.drawConfiguration.name}`;
  }
}
