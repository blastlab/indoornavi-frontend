import {Injectable} from '@angular/core';
import {IconService, NaviIcons} from './icon.service';
import * as d3 from 'd3';
import {Point} from '../../../map-editor/map.type';
import {AcceptButtonsService} from '../../components/accept-buttons/accept-buttons.service';
import {ZoomService} from '../../../map-editor/zoom.service';

@Injectable()
export class DrawingService {
  static boxSize: number = 100;
  private id: string;

  private static transform(translation: Point): string {
    return 'translate(' + translation.x + ',' + translation.y + ')';
  }

  private static descriptionAppend(group: d3.selector, params: ObjectParams, margin: number, padding: number) {
    group.append('text').attr('x', (padding)).attr('y', margin)
      .attr('class', params.id + 'name').attr('fill', params.fill).text(params.id);
  }

  private static dragAreaAppend(group: d3.selector, padding: number, iconHalfSize: number) {
    const dragBackground = 'rgba(255,255,255,0.1)';
    group.append('circle').attr('class', 'objectArea')
      .attr('transform', DrawingService.transform({x: padding, y: padding}))
      .attr('r', iconHalfSize).attr('fill', dragBackground);
  }

  constructor(private icons: IconService, private acceptButtons: AcceptButtonsService, private zoomService: ZoomService) {
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
    DrawingService.descriptionAppend(objectGroup, objectParams, boxMargin, markerPadding);
    DrawingService.dragAreaAppend(objectGroup, markerPadding, iconHalfSize);

    // DRAGGING
    const dragStart = (d, index: number, selection: d3.selection[]): void => {
      d3.event.sourceEvent.stopPropagation();
      d3.select(selection[index]).classed('dragging', true);
    };

    const dragging = (d, index: number, selections: d3.selection[]): void => {
      console.log(d3.select(selections[index]).attr('x'));
      const mousePosition = <Point>{
        x: d3.event.x,
        y: d3.event.y
      };
      d3.select(selections[index]).attr('x', mousePosition.x).attr('y', mousePosition.y);
    };

    const dragStop = (_, index, selection: d3.selection[]): void => {
      d3.select(selection[index]).classed('dragging', false);
    };

    const subject = () => { return { x: d3.event.x, y: d3.event.y }};
    const dragGroup = d3.drag()
      .subject(subject)
      .on('start', dragStart)
      // .on('drag', this.dragGroupBehavior.bind(this))
      .on('drag', dragging)
      .on('end', dragStop);


    objectGroup.call(dragGroup);
    return objectGroup;
  }

  private createGroup(map: d3.selector, objectParams: ObjectParams,
                      coordinates: Point): d3.selector {
    this.id = objectParams.id;
    return map.append('svg')
      .attr('id', objectParams.id)
      .attr('class', objectParams.groupClass)
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .style('cursor', 'move')
      .on('mousedown', () => {
        this.acceptButtons.publishVisibility(false);
      })
      .on('mouseup', () => {
        this.acceptButtons.publishVisibility(true);
      })
  }

  private pointerAppend(group: d3.selector, pointerPadding: number): void {
    group.append('svg').attr('class', 'pointer')
      .attr('x', (pointerPadding)).attr('y', (pointerPadding))
      .html(this.icons.getIcon(NaviIcons.POINTER))
      .attr('fill', 'red');
  }

  private markerAppend(group: d3.selector, boxMargin: number, objectParams: ObjectParams): void {
    if (!objectParams.fill) {
      objectParams.fill = 'red';
    }
    group.append('svg').attr('class', objectParams.markerClass)
      .attr('x', boxMargin).attr('y', boxMargin)
      .html(this.icons.getIcon(objectParams.iconName))
      .attr('stroke', objectParams.fill)
      .attr('fill', objectParams.fill);
  }

  private dragGroupBehavior(): void {
    const boxMargin = DrawingService.boxSize / 2;
    let dx = parseInt(d3.select('#' + this.id).attr('x'), 10);
    let dy = parseInt(d3.select('#' + this.id).attr('y'), 10);
    const transition: Point = this.zoomService.calculate({x: d3.event.dx, y: d3.event.dy});
    dx += d3.event.dx;
    dy += d3.event.dy;
    console.log(dx, transition.x, dy, transition.y);
    d3.select('#' + this.id)
      .attr('x', dx).attr('y', dy);
      // .attr('x', Math.max(-boxMargin, Math.min(map.attr('width') - boxMargin, dx)))
      // .attr('y', Math.max(-boxMargin, Math.min(map.attr('height') - boxMargin, dy)));
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((d3.select('#map').attr('height') - 100 ), by)) + 'px');
    buttons.style('left', Math.max(boxMargin, Math.min((d3.select('#map').attr('width') - boxMargin ), bx)) + 'px');
    this.acceptButtons.publishCoordinates({x: dx, y: dy});
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
