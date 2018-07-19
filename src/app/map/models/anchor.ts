import {Point} from '../../map-editor/map.type';
import {DeviceInEditor, DeviceInEditorConfiguration} from './device';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';

export class AnchorInEditor extends DeviceInEditor {

  protected anchorUnicode: string = '\uf2ce';

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService
    ) {
    super(coordinates, container, drawConfiguration, devicePlacerService, contextMenuService);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 5, y: 5}, this.anchorUnicode, 2);
  }
}
