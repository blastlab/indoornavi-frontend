import {ConnectingLine} from './connection';
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

  dragOn(): void {
    super.dragOn();
    this.group.call(this.dragBehavior.on('drag.connectable', () => {
      this.dragMapDeviceBehavior();
    }));
  }

  dragOff(): void {
    this.group.on('.drag', null);
    this.group.select('.pointer').attr('stroke', 'black');
    this.group.style('cursor', 'pointer');
  }

  unlockConnections(): void {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.unlock();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.unlock();
    }
  }

  handleHovering(): void {
      this.group.on('mouseenter', () => {
        this.showConnections();
      });
      this.group.on('mouseout', () => {
        this.hideConnections();
      });
  }

  private showConnections(): void {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.show();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.show();
    }
  }

  private hideConnections(): void {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.hide();
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.hide();
    }
  }

  private dragMapDeviceBehavior(): void {
    const x: number = Math.max(0, Math.min(this.mapAttributes.width, this.group.attr('x')));
    const y: number = Math.max(0, Math.min(this.mapAttributes.height, this.group.attr('y')));
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.connection.attr('x1', x);
        line.connection.attr('y1', y);
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('x2', x);
      this.anchorConnection.connection.attr('y2', y);
    }
  }

}
