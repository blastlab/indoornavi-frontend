import {Injectable} from '@angular/core';
import {IconService} from './icon.service';
import * as d3 from 'd3';

@Injectable()
export class DrawingService {

  constructor (private _icons: IconService) {
  }

  /**
  */
  public drawObject(id: string,
                    markerParams: MarkerParams,
                    data: object[] = [],
                    classes: string[] = []): d3.selection {
    const map = d3.select('#map');
    const objectGroup = map.append('svg').attr('id', id);
    const iconSvg = objectGroup.append('svg')
      .attr('x', markerParams.x - 12)
      .attr('y', markerParams.y - 12);
    iconSvg.append('path')
      .attr('d', this._icons.getIcon(markerParams.markerType))
      .attr('stroke', 'red')
      .attr('fill', 'green');
    return objectGroup;
  };
}

export interface MarkerParams {
  x: number;
  y: number;
  markerType: string;
}


/** @example usage in other component
 *
 * import {NaviIcons} from '../../../../utils/drawing/icon.service';
 * private _draw: DrawingService in constructor
 *
 * const map = d3.select('#map');
 * map.style('cursor', 'crosshair');
 * map.on('click', () => {
 *          let icon = this._draw.drawObject(
 *            'tagOne',
 *            {x: d3.event.offsetX, y: d3.event.offsetY, markerType: NaviIcons.TAG});
 * icon.on('mouseover', function () {
 *   d3.select(this).select('path').transition().duration(2000)
 *   .attr('stroke', 'blue').transition().duration(2000)
 *   .attr('stroke', 'yellow').transition().duration(2000)
 *   .attr('stroke', 'green');
 * });
 * });
 */
