import {DrawConfiguration} from '../../map-viewer/publication.type';
import {Point} from '../../map-editor/map.type';
import {DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';

export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private plusUnicode: string = '\uf245';
  private colorOutOfScope: string = '#bababa';
  private colorInScope: string = '#000000';
  private colorBackgroundActive: string = '#84f4ff';
  private opacityBackgroundActive: number = 0.5;
  private opacityInScope: number = 1;
  private opacityOutOfScope: number = 0.7;

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DeviceInEditorConfiguration) {
    const deviceDescription = this.getDeviceDescription();
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place(coordinates)
      .addIcon2({x: -12, y: -12}, this.plusUnicode)
      .addText({x: 5, y: -5}, deviceDescription)
      .addRectangle({x: -22, y: -33}, {x: 65, y: 65}, 0, '#FFFFFF', true);
  }

  setActive(): void {
    const color: string = this.colorInScope;
    const colorBackground: string = this.colorBackgroundActive;
    const opacityBackgroundActive: number = this.opacityBackgroundActive;

    this.svgGroupWrapper.getGroup()
      .selectAll('text')
      .attr('stroke', color)
      .attr('fill', color);

    this.svgGroupWrapper.getGroup()
      .selectAll('rect')
      .attr('fill', colorBackground)
      .attr('opacity', opacityBackgroundActive);
  }

  setInScope(): void {
    console.log(this.svgGroupWrapper);
  }

  setOutOfScope(): void {
    console.log(this.svgGroupWrapper);
  }

  private getDeviceDescription(): string {
    let text = (!!this.drawConfiguration.name)
      ? `${this.drawConfiguration.name}-${this.drawConfiguration.id}`
      : `${this.drawConfiguration.clazz}-${this.drawConfiguration.id}`;
    if (!!this.drawConfiguration.heightInMeters) {
      text += ` (${this.drawConfiguration.heightInMeters}m)`
    }
    return text;
  }

}

export interface DeviceInEditorConfiguration extends DrawConfiguration {
  heightInMeters: number;
}
