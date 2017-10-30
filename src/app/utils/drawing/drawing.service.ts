import {Injectable} from '@angular/core';
import {IconService, NaviIcons} from './icon.service';
import * as d3 from 'd3';
import {Point} from '../../map-editor/map.type';

@Injectable()
export class DrawingService {
  static boxSize: number = 100;

  constructor(private icons: IconService) {
  }

  public drawObject(objectParams: ObjectParams,
                    where: Point): d3.selection {
    if (!objectParams.size) {
      objectParams.size = 24;
    }
    const boxMargin = DrawingService.boxSize / 2;
    const map = d3.select('#map');
    const iconHalfSize = (objectParams.size / 2);
    const objectGroup = this.createGroup(map, objectParams,
      {x: where.x - boxMargin, y: where.y - boxMargin});
    const iconPadding = boxMargin - iconHalfSize;
    const markerPadding = boxMargin + iconHalfSize;
    this.pointerAppend(objectGroup, iconPadding);
    this.markerAppend(objectGroup, boxMargin, objectParams);
    this.descriptionAppend(objectGroup, objectParams, boxMargin, markerPadding);
    this.dragAreaAppend(objectGroup, markerPadding, iconHalfSize);
    const dragGroup = d3.drag()
      .on('drag', this.dragGroupBehavior);
    objectGroup.call(dragGroup);
    return objectGroup;
  }

  private createGroup(map: d3.selector, objectParams: ObjectParams,
                      coords: Point): d3.selector {
    return map.append('svg')
      .attr('id', objectParams.id)
      .attr('class', objectParams.groupClass)
      .attr('x', coords.x)
      .attr('y', coords.y)
      .style('cursor', 'move');
  }

  private pointerAppend(group: d3.selector, pointerPadding: number): void {
    group.append('svg').attr('class', 'pointer')
      .attr('x', (pointerPadding)).attr('y', (pointerPadding))
      .html(this.icons.getIcon(NaviIcons.POINTER))
      .attr('fill', 'red');
  }

  private markerAppend(group: d3.selector, boxMargin: number, objectParams: ObjectParams) {
    if (!objectParams.fill) {
      objectParams.fill = 'red';
    }
    group.append('svg').attr('class', objectParams.markerClass)
      .attr('x', boxMargin).attr('y', boxMargin)
      .html(this.icons.getIcon(objectParams.iconName))
      .attr('stroke', objectParams.fill)
      .attr('fill', objectParams.fill);
  }

  private descriptionAppend(group: d3.selector, params: ObjectParams, margin: number, padding: number) {
    group.append('text').attr('x', (padding)).attr('y', margin)
      .attr('class', params.id + 'name').attr('fill', params.fill).text(params.id);
  }

  private dragAreaAppend(group: d3.selector, padding: number, iconHalfSize: number) {
    const dragBackground = 'rgba(255,255,255,0.1)';
    group.append('circle').attr('class', 'objectArea')
      .attr('transform', this.transform({x: padding, y: padding}))
      .attr('r', iconHalfSize).attr('fill', dragBackground);
  }

  private dragGroupBehavior() {
    const map = d3.select('#map');
    const boxMargin = DrawingService.boxSize / 2;
    let dx = parseInt(d3.select(this).attr('x'), 10);
    let dy = parseInt(d3.select(this).attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    d3.select(this)
      .attr('x', Math.max(-boxMargin, Math.min(map.attr('width') - boxMargin, dx)))
      .attr('y', Math.max(-boxMargin, Math.min(map.attr('height') - boxMargin, dy)));
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((d3.select('#map').attr('height') - 100 ), by)) + 'px');
    buttons.style('left', Math.max(boxMargin, Math.min((d3.select('#map').attr('width') - boxMargin ), bx)) + 'px');
  }

  private transform(translation: Point): string {
    return 'translate(' + translation.x + ',' + translation.y + ')';
  }

}

export interface ObjectParams {
  id: string;
  iconName: string;
  groupClass: string;
  markerClass: string;
  size?: number;
  stroke?: string;
  fill?: string;
  opacity?: string;
}
