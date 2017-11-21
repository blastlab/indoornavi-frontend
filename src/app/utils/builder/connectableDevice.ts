import {Device} from '../../device/device.type';
import {ConnectingLine} from './connection';
import * as d3 from 'd3';
import {GroupCreated} from './draw.builder';


export class ConnectableDevice {
  private device: Device;
  public domGroup: d3.selection;
  public container: d3.selection;
  public sinkConnections: ConnectingLine[] = [];
  public anchorConnection: ConnectingLine;
  public groupCreated: GroupCreated;

  constructor(groupCreated: GroupCreated,
              device: Device) {
    this.groupCreated = groupCreated;
    this.domGroup = groupCreated.domGroup;
    this.container = groupCreated.container;
    this.device = device;
    this.handleHovering();
  }

  private dragGroupBehavior() {

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
        line.connection.attr('stroke', 'orange');
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('stroke', 'orange');
    }
  }

  private hideConnections() {
    if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.connection.attr('stroke', 'none');
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('stroke', 'none');
    }
  }

  private dragMapDeviceBehavior() {
    /* if (!!this.sinkConnections.length) {
      this.sinkConnections.forEach((line: ConnectingLine) => {
        line.connection.attr('x1', xAtMap);
        line.connection.attr('y1', yAtMap);
      });
    } else if (!!this.anchorConnection) {
      this.anchorConnection.connection.attr('x2', xAtMap);
      this.anchorConnection.connection.attr('y2', yAtMap);
    }*/
  }

}
