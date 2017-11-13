import {GroupCreated} from './draw.builder';
import * as d3 from 'd3';
import {Connection} from './connection';

export class Draggable {
  private mapAttributes: { width: number, height: number };
  public sinkConnections: Connection[] = [];
  public anchorConnection: Connection;
  public group: d3.selection;
  public container: d3.selection;

  constructor(groupCreated: GroupCreated,
              container: d3.selection) {
    this.container = container;
    this.group = groupCreated.group;
    this.mapAttributes = {width: container.attr('width'), height: container.attr('height')};
    this.handleHovering();
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
    this.makeSelectable();
  }

  public off() {
    this.group.on('drag', null);
    this.group.select('.pointer').attr('stroke', 'black');
    this.group.style('cursor', 'pointer');
    this.group.on('click', null);
  }

  private handleHovering() {
    this.group.on('mouseover', () => {
      this.showConnections();
    });
    this.group.on('mouseout', () => {
      this.hideConnections();
    });
  }

  private showConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: Connection) => {
        line.connection.attr('stroke', 'orange');
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('stroke', 'orange');
    }
  }

  private hideConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: Connection) => {
        line.connection.attr('stroke', 'none');
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('stroke', 'none');
    }
  }

  private makeSelectable() {
    this.group.on('click', () => {
      this.select();
    });
  }

  // TODO deselection logic, creating new connections between selectedSink and device
  // TODO // selectedDevice delete and warnings, activeSink searchBy anchor

  private select() {
    console.log('select and set deselect');
    this.group.on('click', () => {
      this.deselect();
    });
    this.group.classed('selected', true);
  }

  private deselect() {
    console.log('deselect');
    this.makeSelectable();
    this.group.classed('selected', false);
  }

  private dragGroupBehavior() {
    let dx = parseInt(this.group.attr('x'), 10);
    let dy = parseInt(this.group.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    const xAtMap = Math.max(0, Math.min(this.mapAttributes.width, dx));
    const yAtMap = Math.max(0, Math.min(this.mapAttributes.height, dy));
    this.group
      .attr('x', xAtMap)
      .attr('y', yAtMap);
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: Connection) => {
        line.connection.attr('x1', xAtMap);
        line.connection.attr('y1', yAtMap);
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('x2', xAtMap);
      this.anchorConnection.connection.attr('y2', yAtMap);
    }
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
