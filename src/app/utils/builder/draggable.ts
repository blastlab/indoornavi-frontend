import {GroupCreated} from './draw.builder';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../map-loader-informer/map-loader-informer.service';
import {OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

export class Draggable implements OnInit {
  private group: d3.selection;
  private boxMargin: number;
  private mapLoaderInformerService = new MapLoaderInformerService();
  private mapLoadedSubscription: Subscription;
  private mapAttributes: { width: number, height: number };


  private static getBoxMargin(selection: d3.selection): number {
    const boxMargin = '50'; // selection._groups['0']['0'].children[1].attributes[1].nodeValue;
    return parseInt(boxMargin, 10);
  }

  constructor(groupCreated: GroupCreated) {
    this.group = groupCreated;
    this.boxMargin = Draggable.getBoxMargin(groupCreated);
  }

  ngOnInit(): void {
    this.mapLoadedSubscription = this.mapLoaderInformerService.loadCompleted().subscribe(() => {
      const map = d3.select('#map');
      this.mapAttributes.width = map.attr('width');
      this.mapAttributes.height = map.attr('height');
    });
  }

  // TODO add pointer
  public on(selection: d3.selection, withButtons: boolean) {
    const dragGroup = d3.drag()
      .on('drag', (_, i, selections) => {
        this.dragGroupBehavior(d3.select(selections[i]));
        if (withButtons) {
          this.dragAcceptButtonsBehavior();
        }
      });
    selection.select('.pointer').attr('fill', 'red');
    selection.style('cursor', 'move');
    selection.call(dragGroup);
  }

  public off(selection: d3.selection) {
    selection.on('drag', null);
  }

  private dragGroupBehavior(selection: d3.selection) {
    let dx = parseInt(selection.attr('x'), 10);
    let dy = parseInt(selection.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    selection
      .attr('x', Math.max(-this.boxMargin, Math.min(this.mapAttributes.width - this.boxMargin, dx)))
      .attr('y', Math.max(-this.boxMargin, Math.min(this.mapAttributes.height - this.boxMargin, dy)));
  }
  private dragAcceptButtonsBehavior() {
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((this.mapAttributes.height - 100 ), by)) + 'px');
    buttons.style('left', Math.max(this.boxMargin, Math.min((this.mapAttributes.width - this.boxMargin ), bx)) + 'px');
  }

}
