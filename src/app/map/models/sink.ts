import {DeviceInEditor, DeviceInEditorConfiguration} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';

export class SinkInEditor extends DeviceInEditor {

  protected sinkUnicode: string = '\uf1e6';

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService
  ) {
    super(coordinates, container, drawConfiguration, devicePlacerService, contextMenuService);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 5, y: 5}, this.sinkUnicode, 2)
  }
}
