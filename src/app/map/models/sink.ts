import {DeviceInEditor, DeviceInEditorConfiguration, DeviceInEditorType} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {AnchorInEditor} from './anchor';

export class SinkInEditor extends DeviceInEditor {

  type: DeviceInEditorType = DeviceInEditorType.SINK;

  protected sinkUnicode: string = '\uf1e6';
  private anchors: AnchorInEditor[] = [];

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

  addAnchor(anchor: AnchorInEditor): void {
    this.anchors.push(anchor);
  }

  removeAnchor(anchor: AnchorInEditor): void {
    const index: number = this.anchors.indexOf(anchor);
    if (index !== -1) {
      this.anchors.splice(index, 1);
    }
  }

  setSinkGroupScope(): void {
    this.anchors.forEach((anchor: AnchorInEditor): void => {
      anchor.setInGroupScope();
    });
  }

  setSinkGroupOutOfScope(): void {
    this.anchors.forEach((anchor: AnchorInEditor): void => {
      anchor.setOutOfGroupScope();
    });
  }

  hasAnchor(anchor: AnchorInEditor): boolean {
    const index: number = this.anchors.indexOf(anchor);
    return index > -1;
  }

  get anchorsList(): AnchorInEditor[] {
    return this.anchors;
  }
}
