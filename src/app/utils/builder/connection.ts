import {Draggable} from './draggable';
import * as d3 from 'd3';

export class Connection {
  private sink: Draggable;
  private anchor: Draggable;
  private container: d3.selection;
  public id: string;
  public connection: d3.selection;

  constructor(sink: Draggable,
              anchor: Draggable,
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
      .attr('x1', this.sink.group.attr('x'))
      .attr('y1', this.sink.group.attr('y'))
      .attr('x2', this.anchor.group.attr('x'))
      .attr('y2', this.anchor.group.attr('y'))
      .attr('stroke', 'none');
  }

}
