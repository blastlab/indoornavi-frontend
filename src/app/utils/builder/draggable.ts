import {GroupCreated} from './draw.builder';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../map-loader-informer/map-loader-informer.service';
import {OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

export class Draggable implements OnInit {
  private group: d3.selection;
  private mapLoaderInformerService = new MapLoaderInformerService();
  private mapLoadedSubscription: Subscription;
  private mapAttributes: { width: number, height: number };

  constructor(groupCreated: GroupCreated) {
    this.group = groupCreated;
  }

  ngOnInit(): void {
    this.mapLoadedSubscription = this.mapLoaderInformerService.loadCompleted().subscribe(() => {
      const map = d3.select('#map');
      this.mapAttributes.width = map.attr('width');
      this.mapAttributes.height = map.attr('height');
    });
  }

  // TODO add pointer
  public on(withButtons: boolean) {
    const dragGroup = d3.drag()
      .on('drag', () => {
        this.dragGroup();
        if (withButtons) {
          this.dragAcceptButtonsBehavior();
        }
      });
    // this.group.select('.pointer').attr('fill', 'red');
    console.log(this.group);
    this.group.style('cursor', 'move');
    this.group.call(dragGroup);
  }

  public off() {
    this.group.on('drag', null);
  }

  /*private dragGroupBehavior(selection: d3.selection) {
    let dx = parseInt(selection.attr('x'), 10);
    let dy = parseInt(selection.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    selection
      .attr('x', Math.max(-this.boxMargin, Math.min(this.mapAttributes.width - this.boxMargin, dx)))
      .attr('y', Math.max(-this.boxMargin, Math.min(this.mapAttributes.height - this.boxMargin, dy)));
  }*/

  private dragGroup() {
    console.log(this.group);
    }

  private dragAcceptButtonsBehavior() {
    const buttons = d3.select('#accept-buttons');
    let bx = parseInt(buttons.style('left'), 10);
    let by = parseInt(buttons.style('top'), 10);
    bx += d3.event.dx;
    by += d3.event.dy;
    buttons.style('top', Math.max(0, Math.min((this.mapAttributes.height - 100 ), by)) + 'px');
    buttons.style('left', Math.max(50, Math.min((this.mapAttributes.width - 50 ), bx)) + 'px');
  }

}
