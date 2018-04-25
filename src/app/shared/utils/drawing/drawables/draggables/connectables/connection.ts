import * as d3 from 'd3';
import {ConnectableDevice} from './connectableDevice';
import {Selectable} from '../../selectables/selectable';
import {SvgGroupWrapper} from '../../../drawing.builder';

export class ConnectingLine extends Selectable {
  public id: string;
  public connection: d3.selection;
  private sink: ConnectableDevice;
  private anchor: ConnectableDevice;
  private lockVisibility: boolean = false;

  constructor(group: SvgGroupWrapper,
              sink: ConnectableDevice,
              anchor: ConnectableDevice) {
    super(group);
    this.sink = sink;
    this.anchor = anchor;
    this.id = this.getId();
    this.drawConnectingLine();
  }

  public connectedSink(): ConnectableDevice {
    return this.sink;
  }

  public connectedAnchor(): ConnectableDevice {
    return this.anchor;
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

  public highlightSet(color?: string): void {
    super.highlightSet(color);
    this.strokeConnectingLineBold();
  }

  public highlightReset(): void {
    super.highlightReset();
    this.strokeConnectingLineNormal();
  }

  private strokeConnectingLineBold(): void {
    this.group.getGroup().attr('stroke-width', '3');
  }

  private strokeConnectingLineNormal(): void {
    this.group.getGroup().attr('stroke-width', '1');
  }

  public lock(): void {
    this.lockVisibility = true;
  }

  public unlock(): void {
    this.lockVisibility = false;
  }

  private getId(): string {
    return this.group.getGroup().attr('id');
  }

  private drawConnectingLine(): void {
    this.connection = this.group.getGroup().append('line')
      .attr('x1', this.sink.group.attr('x'))
      .attr('y1', this.sink.group.attr('y'))
      .attr('x2', this.anchor.group.attr('x'))
      .attr('y2', this.anchor.group.attr('y'))
      .attr('stroke-linecap', 'round')
      .attr('stroke', 'none');
  }

  public removeConnection(): void {
    this.sink = null;
    this.anchor = null;
    this.id = null;
    this.connection.remove();
    this.group.getGroup().remove();
  }
}
