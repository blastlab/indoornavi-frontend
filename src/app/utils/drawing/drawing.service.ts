import {Injectable} from '@angular/core';
import {IconService, NaviIcons} from './icon.service';
import * as d3 from 'd3';
import {Point} from '../../map/map.type';

@Injectable()
export class DrawingService {
  static boxSize: number = 100;

  constructor(private icons: IconService) {
  }

  public drawObject(id: string,
                    objectParams: ObjectParams,
                    where: Point,
                    groupClass: string,
                    markerClass: string): d3.selection {
    if (!objectParams.size) {
      objectParams.size = 24;
    }
    const boxMargin = DrawingService.boxSize / 2;
    const map = d3.select('#map');
    const iconHalfSize = (objectParams.size / 2);
    const objectGroup = map.append('svg')
      .attr('id', id)
      .attr('class', groupClass)
      .attr('x', where.x - boxMargin)
      .attr('y', where.y - boxMargin)
      .style('cursor', 'move');
    const pointerPadding = boxMargin - iconHalfSize;
    objectGroup.append('svg').attr('class', 'pointer')
      .attr('x', (pointerPadding)).attr('y', (pointerPadding))
      .html(this.icons.getIcon(NaviIcons.POINTER))
      .attr('fill', 'red');
    objectGroup.append('svg').attr('class', markerClass)
      .attr('x', boxMargin).attr('y', boxMargin)
      .html(this.icons.getIcon(objectParams.iconName))
      .attr('stroke', objectParams.fill)
      .attr('fill', objectParams.fill);
    const iconPadding = boxMargin - iconHalfSize;
    objectGroup.append('text').attr('x', (iconPadding)).attr('y', boxMargin)
      .attr('class', id + 'name').attr('fill', objectParams.fill).text(id);
    objectGroup.append('circle').attr('class', 'objectArea')
      .attr('transform', 'translate(' + (iconPadding) + ',' + (iconPadding) + ')')
      .attr('r', iconHalfSize).attr('fill', 'rgba(255,255,255,0.1)');
    const dragGroup = d3.drag()
      .on('drag', this.dragGroupBehavior);
    objectGroup.call(dragGroup);
    return objectGroup;
  }


  /*
   private pointerAppend() {

   }

   private markerAppend() {

   }

   private descriptionAppend() {

   }
   */

  public dragGroupBehavior() {
    const boxMargin = DrawingService.boxSize / 2;
    let dx = parseInt(d3.select(this).attr('x'), 10);
    let dy = parseInt(d3.select(this).attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    d3.select(this)
      .attr('x', Math.max(-boxMargin, Math.min(d3.select('#map').attr('width') - boxMargin, dx)))
      .attr('y', Math.max(-boxMargin, Math.min(d3.select('#map').attr('height') - boxMargin, dy)));
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((d3.select('#map').attr('height') - 100 ), by)) + 'px');
    buttons.style('left', Math.max(boxMargin, Math.min((d3.select('#map').attr('width') - boxMargin ), bx)) + 'px');
  }

}

export interface ObjectParams {
  iconName: string;
  size?: number;
  stroke?: string;
  fill?: string;
  opacity?: string;
}
