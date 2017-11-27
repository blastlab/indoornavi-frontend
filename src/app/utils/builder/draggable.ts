import {GroupCreated} from './draw.builder';
import * as d3 from 'd3';

export class Draggable {
  public container: d3.selection;
  public domGroup: d3.selection;
  private isDraggedNow: boolean;
  protected dragBehavior: d3.drag;
  protected mapAttributes: { width: number, height: number };

  constructor(groupCreated: GroupCreated) {
    this.domGroup = groupCreated.domGroup;
    this.container = groupCreated.container;
    this.mapAttributes = {width: this.container.attr('width'), height: this.container.attr('height')};
  }

  public dragOn(withButtons: boolean) {
    this.dragBehavior = d3.drag()
      .on('drag.draggable', () => {
        this.isDraggedNow = true;
        this.dragGroupBehavior();
        if (withButtons) {
          this.dragAcceptButtonsBehavior();
        }
      })
      .on('end.draggable', () => {
        if (this.isDraggedNow) {
          this.updateConfiguration();
          this.isDraggedNow = !this.isDraggedNow;
        }
      });
    this.domGroup.select('.pointer').attr('stroke', 'red');
    this.domGroup.style('cursor', 'move');
    this.domGroup.call(this.dragBehavior);
  }

  public dragOff() {
    this.domGroup.on('drag.draggable', null);
    this.domGroup.select('.pointer').attr('stroke', 'black');
    this.domGroup.style('cursor', 'pointer');
  }

  private updateConfiguration() {
    alert('update config'); // TODO fire event for dragEnd as observable to mapDevice object
  }

  private dragGroupBehavior() {
    let dx = parseInt(this.domGroup.attr('x'), 10);
    let dy = parseInt(this.domGroup.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    const xAtMap = Math.max(0, Math.min(this.mapAttributes.width, dx));
    const yAtMap = Math.max(0, Math.min(this.mapAttributes.height, dy));
    this.domGroup
      .attr('x', xAtMap)
      .attr('y', yAtMap);
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
