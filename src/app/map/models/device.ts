import {DrawConfiguration} from '../../map-viewer/publication.type';
import {Point} from '../../map-editor/map.type';
import {DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';

export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private plusUnicode = '\uf245';

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DeviceInEditorConfiguration) {
    const deviceDescription = this.getDeviceDescription();
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place(coordinates)
      .addIcon2({x: -12, y: -12}, this.plusUnicode)
      .addText({x: 5, y: -5}, deviceDescription);
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
