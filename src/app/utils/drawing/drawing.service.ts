import {Injectable} from '@angular/core';
import {IconService, NaviIcons} from './icon.service';
import * as d3 from 'd3';
import {Point} from '../../map/map.type';

@Injectable()
export class DrawingService {

  constructor(private icons: IconService) {
  }

  public drawObject(objectParams: MapObjectParams,
                    where: Point): d3.selection {
    if (!objectParams.size) {
      objectParams.size = 24;
    }
    const boxSize = 100;
    const boxMargin = boxSize / 2;
    const map = d3.select('#map');
    const iconHalfSize = (objectParams.size / 2);
    const objectGroup = this.createGroup(map, objectParams,
      {x: where.x - boxMargin, y: where.y - boxMargin});
    const iconPadding = boxMargin - iconHalfSize;
    const markerPadding = boxMargin + iconHalfSize;
    this.appendPointer(objectGroup, iconPadding);
    this.appendMarker(objectGroup, boxMargin, objectParams);
    this.appendDescription(objectGroup, objectParams, boxMargin, markerPadding);
    this.appendDragArea(objectGroup, markerPadding, iconHalfSize);
    this.applyDragBehavior(objectGroup, true);
    return objectGroup;
  }

  private dragGroupBehavior(selection: d3.selection, boxMargin) {
    const map = d3.select('#map');
    let dx = parseInt(selection.attr('x'), 10);
    let dy = parseInt(selection.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    selection
      .attr('x', Math.max(-boxMargin, Math.min(map.attr('width') - boxMargin, dx)))
      .attr('y', Math.max(-boxMargin, Math.min(map.attr('height') - boxMargin, dy)));
  }

  public applyDragBehavior(selection: d3.selection, withButtons: boolean) {
    const selectedGroup = d3.select('#map').select('#' + selection._groups['0']['0'].id);
    const boxMargin = parseInt(selectedGroup._groups['0']['0'].childNodes[1].attributes[1].nodeValue, 10);
    console.log(boxMargin);
    console.log(selectedGroup);
    const dragGroup = d3.drag()
      .on('drag', (_, i, selections) => {
        this.dragGroupBehavior(d3.select(selections[i]), boxMargin);
        if (withButtons) {
          this.dragAcceptButtonsBehavior(boxMargin);
        }
      });
    selection.select('.pointer').attr('fill', 'red');
    selection.style('cursor', 'move');
    selection.call(dragGroup);
  }

  private dragAcceptButtonsBehavior(boxMargin) {
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((d3.select('#map').attr('height') - 100 ), by)) + 'px');
    buttons.style('left', Math.max(boxMargin, Math.min((d3.select('#map').attr('width') - boxMargin ), bx)) + 'px');
  }

  private createGroup(map: d3.selection, objectParams: MapObjectParams,
                      coords: Point): d3.selection {
    return map.append('svg')
      .attr('id', objectParams.id)
      .attr('class', objectParams.groupClass)
      .attr('x', coords.x)
      .attr('y', coords.y)
      .style('cursor', 'move');
  }

  private appendPointer(group: d3.selection, pointerPadding: number): void {
    group.append('svg').attr('class', 'pointer')
      .attr('x', (pointerPadding)).attr('y', (pointerPadding))
      .html(this.icons.getIcon(NaviIcons.POINTER))
      .attr('fill', 'red');
  }

  private appendMarker(group: d3.selection, boxMargin: number, objectParams: MapObjectParams) {
    if (!objectParams.fill) {
      objectParams.fill = 'red';
    }
    group.append('svg').attr('class', objectParams.markerClass)
      .attr('x', boxMargin).attr('y', boxMargin)
      .html(this.icons.getIcon(objectParams.iconName))
      .attr('stroke', objectParams.fill)
      .attr('fill', objectParams.fill);
  }

  private appendDescription(group: d3.selection, params: MapObjectParams, margin: number, padding: number) {
    group.append('text').attr('x', (padding)).attr('y', margin)
      .attr('class', params.id + 'name').attr('fill', params.fill).text(params.id);
  }

  private appendDragArea(group: d3.selection, padding: number, iconHalfSize: number) {
    const dragBackground = 'rgba(255,255,255,0.1)';
    group.append('circle').attr('class', 'objectArea')
      .attr('transform', this.transform({x: padding, y: padding}))
      .attr('r', iconHalfSize).attr('fill', dragBackground);
  }

  private transform(translation: Point): string {
    return 'translate(' + translation.x + ',' + translation.y + ')';
  }

  // TODO private getBoxMargin()

}

export interface MapObjectParams {
  id: string;
  iconName: string;
  groupClass: string;
  markerClass: string;
  size?: number;
  stroke?: string;
  fill?: string;
  opacity?: string;
}
