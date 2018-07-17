import {DeviceInEditor, DeviceInEditorConfiguration} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';

export class SinkInEditor extends DeviceInEditor {

  protected sinkUnicode: string = '\uf1e6';

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DeviceInEditorConfiguration) {
    super(coordinates, container, drawConfiguration);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 5, y: 5}, this.sinkUnicode, 2)
  }
}
