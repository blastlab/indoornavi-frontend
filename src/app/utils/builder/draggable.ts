import {GroupCreated} from './draw.builder';
import * as d3 from 'd3';

export class Draggable {
  private group: d3.selection;
  private mapAttributes: { width: number, height: number };

  constructor(groupCreated: GroupCreated,
              container: d3.selection) {
    this.group = groupCreated.group;
    this.mapAttributes = {width: container.attr('width'), height: container.attr('height')};
  }

  public on(withButtons: boolean) {
    const dragGroup = d3.drag()
      .on('drag', () => {
        this.dragGroupBehavior();
        if (withButtons) {
          this.dragAcceptButtonsBehavior();
        }
      });
    this.group.select('.pointer').attr('stroke', 'red');
    this.group.style('cursor', 'move');
    this.group.call(dragGroup);
    this.group.on('click', () => {
      this.select();
    });
  }

  public off() {
    this.group.on('drag', null);
    this.group.select('.pointer').attr('stroke', 'black');
    this.group.style('cursor', 'pointer');
    this.group.on('click', null);
  }

  private select() {
    console.log('select and set deselect');
    this.group.on('click', () => {
      this.deselect();
    });
    this.group.classed('selected', true);
  }

  private deselect() {
    console.log('deselect');
    this.group.on('click', () => {
      this.select();
    });
    this.group.classed('selected', false);
  }

  private dragGroupBehavior() {
    let dx = parseInt(this.group.attr('x'), 10);
    let dy = parseInt(this.group.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    this.group
      .attr('x', Math.max(0, Math.min(this.mapAttributes.width, dx)))
      .attr('y', Math.max(0, Math.min(this.mapAttributes.height, dy)));
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

  private createSelectionBorder() {

  }

}
