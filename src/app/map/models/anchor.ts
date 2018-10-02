import {Point} from '../../map-editor/map.type';
import {DeviceInEditor} from './device';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/device-placer/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {DeviceInEditorConfiguration, DeviceType} from '../../map-editor/tool-bar/tools/device-placer/device-placer.types';
import {Box} from '../../shared/utils/drawing/drawing.builder';

export class AnchorInEditor extends DeviceInEditor {

  type: DeviceType = DeviceType.ANCHOR;

  protected anchorUnicode: string = '\uf2ce'; // fa-podcast

  constructor(
    public shortId: number,
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService,
    protected translateService: TranslateService,
    protected containerBox: Box
    ) {
    super(shortId, coordinates, container, drawConfiguration, devicePlacerService, contextMenuService, translateService, containerBox);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 18, y: 18}, this.anchorUnicode, 2);
  }
}
