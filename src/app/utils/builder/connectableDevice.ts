import {ConnectingLine} from './connection';
import * as d3 from 'd3';
import {GroupCreated} from './draw.builder';
import {Draggable} from './draggable';


export class ConnectableDevice extends Draggable {
  public sinkConnections: ConnectingLine[];
  public anchorConnection: ConnectingLine;

  constructor(groupCreated: GroupCreated) {
    super(groupCreated);
    this.sinkConnections = [];
    this.anchorConnection = null;
    this.handleHovering();
  }

  public dragOn(withButtons: boolean) {
    super.dragOn(withButtons);
    this.domGroup.call(this.dragBehavior.on('drag.connectable', () => {
      this.dragMapDeviceBehavior();
    }));
  }

  public dragOff() {
    this.domGroup.on('.drag', null);
    this.domGroup.select('.pointer').attr('stroke', 'black');
    this.domGroup.style('cursor', 'pointer');
  }

  public lockConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.lock();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.lock();
    }
  }

  public unlockConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.unlock();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.unlock();
    }
  }

  private handleHovering() {
      this.domGroup.on('mouseover', () => {
        this.showConnections();
      });
      this.domGroup.on('mouseout', () => {
        this.hideConnections();
      });
  }

  private showConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.show();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.show();
    }
  }

  private hideConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.hide();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.hide();
    }
  }

  private dragMapDeviceBehavior() {
    let dx = parseInt(this.domGroup.attr('x'), 10);
    let dy = parseInt(this.domGroup.attr('y'), 10);
    dx += d3.event.dx;
    dy += d3.event.dy;
    const xAtMap = Math.max(0, Math.min(this.mapAttributes.width, dx));
    const yAtMap = Math.max(0, Math.min(this.mapAttributes.height, dy));
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.connection.attr('x1', xAtMap);
        line.connection.attr('y1', yAtMap);
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('x2', xAtMap);
      this.anchorConnection.connection.attr('y2', yAtMap);
    }
  }

}
