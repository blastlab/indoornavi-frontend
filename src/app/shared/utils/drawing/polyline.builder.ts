import {DrawBuilder, SvgGroupWrapper} from './drawing.builder';
import {DrawConfiguration} from '../../../map-viewer/published.type';
import {ZoomService} from '../../services/zoom/zoom.service';

import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';

export class Polyline extends DrawBuilder {
  private lines: SvgGroupWrapper;

  constructor (
    protected appendable: d3.selection,
    protected configuration: DrawConfiguration,
    protected zoomService: ZoomService
            ) {
    super(
      appendable,
      configuration,
      zoomService);
    }

    draw(setOfPoints: Point[]) {
      this.lines = this.createGroup();

    }
}
