import {Point} from '../../map-editor/map.type';
import {DeviceInEditor} from './device';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/device-placer/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {DeviceInEditorConfiguration, DeviceType} from '../../map-editor/tool-bar/tools/device-placer/device-placer.types';
import {Box} from '../../shared/utils/drawing/drawing.builder';
import {ModelsConfig} from './models.config';

export class AnchorInEditor extends DeviceInEditor {

  type: DeviceType = DeviceType.ANCHOR;

  constructor(
    public shortId: number,
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService,
    protected translateService: TranslateService,
    protected containerBox: Box,
    protected models: ModelsConfig
    ) {
    super(shortId, coordinates, container, drawConfiguration, devicePlacerService, contextMenuService, translateService, containerBox, models);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon(
      {x: 18, y: 18},
      this.models.anchorUnicode,
      this.models.iconSizeScalar,
      this.models.transformHorizontal,
      this.models.transformVertical
    );
  }
}
