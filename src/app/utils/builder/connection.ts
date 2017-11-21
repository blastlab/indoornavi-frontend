import * as d3 from 'd3';
import {ConnectableDevice} from './connectableDevice';

export class ConnectingLine {
  private sink: ConnectableDevice;
  private anchor: ConnectableDevice;
  private container: d3.selection;
  public id: string;
  public connection: d3.selection;

  constructor(sink: ConnectableDevice,
              anchor: ConnectableDevice,
              id: string) {
    this.sink = sink;
    this.anchor = anchor;
    this.id = id;
    this.container = sink.container;
    this.drawConnectingLine();
  }

  private drawConnectingLine(): void {
    this.connection = this.container.append('line')
      .attr('id', this.id)
      .attr('x1', this.sink.domGroup.attr('x'))
      .attr('y1', this.sink.domGroup.attr('y'))
      .attr('x2', this.anchor.domGroup.attr('x'))
      .attr('y2', this.anchor.domGroup.attr('y'))
      .attr('stroke', 'none');
  }

}
