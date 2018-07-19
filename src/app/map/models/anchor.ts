import {Point} from '../../map-editor/map.type';
import {DeviceInEditor, DeviceInEditorConfiguration} from './device';
import * as d3 from 'd3';

export class AnchorInEditor extends DeviceInEditor {

  protected anchorUnicode: string = '\uf2ce';

  constructor(protected coordinates: Point, protected container: d3.selection, protected drawConfiguration: DeviceInEditorConfiguration) {
    super(coordinates, container, drawConfiguration);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 5, y: 5}, this.anchorUnicode, 2);
  }
}
