import * as d3 from 'd3';
import {ConnectableDevice} from './connectableDevice';
import {Point} from '../../map-editor/map.type';

export class ConnectingLine {
  public id: string;
  public connection: d3.selection;
  private sink: ConnectableDevice;
  private anchor: ConnectableDevice;
  private container: d3.selection;
  private lockVisibility: boolean = false;

  constructor(sink: ConnectableDevice,
              anchor: ConnectableDevice,
              id: string) {
    this.sink = sink;
    this.anchor = anchor;
    this.id = id;
    this.container = sink.container;
    this.drawConnectingLine();
  }

  public connectedSink(): ConnectableDevice {
    return this.sink;
  }

  public show(): void {
    if (!this.lockVisibility) {
      this.connection.attr('stroke', 'orange');
    }
  }

  public hide(): void {
    if (!this.lockVisibility) {
      this.connection.attr('stroke', 'none');
    }
  }
  public toggleLock (): void {
    this.lockVisibility = !this.lockVisibility;
  }

  private drawConnectingLine(): void {
    this.connection = this.container.append('line')
      .attr('id', this.id)
      .attr('x1', this.sink.domGroup.attr('x'))
      .attr('y1', this.sink.domGroup.attr('y'))
      .attr('x2', this.anchor.domGroup.attr('x'))
      .attr('y2', this.anchor.domGroup.attr('y'))
      .attr('pointer-events', 'none')
      .attr('stroke', 'none');
  }
}
