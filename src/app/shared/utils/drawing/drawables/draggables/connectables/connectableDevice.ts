import {ConnectingLine} from './connection';
import * as d3 from 'd3';
import {Draggable} from '../draggable';
import {SvgGroupWrapper} from 'app/shared/utils/drawing/drawing.builder';
import {ZoomService} from '../../../../../services/zoom/zoom.service';


export class ConnectableDevice extends Draggable {
  public sinkConnections: ConnectingLine[];
  public anchorConnection: ConnectingLine;

  constructor(group: SvgGroupWrapper,
              zoomService: ZoomService) {
    super(group, zoomService);
    this.sinkConnections = [];
    this.anchorConnection = null;
    this.handleHovering();
  }

  public dragOn() {
    super.dragOn();
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
    const x = Math.max(0, Math.min(this.mapAttributes.width, this.group.attr('x')));
    const y = Math.max(0, Math.min(this.mapAttributes.height, this.group.attr('y')));
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
