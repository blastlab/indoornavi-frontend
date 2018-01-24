import {ConnectingLine} from './connection';
import * as d3 from 'd3';
import {Draggable} from '../draggable';
import {SvgGroupWrapper} from 'app/shared/utils/drawing/drawing.builder';


export class ConnectableDevice extends Draggable {
  public sinkConnections: ConnectingLine[];
  public anchorConnection: ConnectingLine;

  constructor(group: SvgGroupWrapper) {
    super(group);
    this.sinkConnections = [];
    this.anchorConnection = null;
    this.handleHovering();
  }

  public dragOn(withButtons: boolean) {
    super.dragOn(withButtons);
    this.group.call(this.dragBehavior.on('drag.connectable', () => {
      this.dragMapDeviceBehavior();
    }));
  }

  public dragOff() {
    this.group.on('.drag', null);
    this.group.select('.pointer').attr('stroke', 'black');
    this.group.style('cursor', 'pointer');
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

  public handleHovering() {
      this.group.on('mouseenter', () => {
        this.showConnections();
      });
      this.group.on('mouseout', () => {
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
    let dx = parseInt(this.group.attr('x'), 10);
    let dy = parseInt(this.group.attr('y'), 10);
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
