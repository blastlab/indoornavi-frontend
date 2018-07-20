import {DeviceCallbacks, DeviceInEditor, DeviceInEditorConfiguration, DeviceInEditorType} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {AnchorInEditor} from './anchor';
import {TranslateService} from '@ngx-translate/core';

export class SinkInEditor extends DeviceInEditor {

  type: DeviceInEditorType = DeviceInEditorType.SINK;

  protected sinkUnicode: string = '\uf1e6';
  private anchors: AnchorInEditor[] = [];

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService,
    protected translateService: TranslateService
  ) {
    super(coordinates, container, drawConfiguration, devicePlacerService, contextMenuService, translateService);
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon2({x: 5, y: 5}, this.sinkUnicode, 2);
    this.setTranslation('remove.with.anchors');
  }

  get anchorsList(): AnchorInEditor[] {
    return this.anchors;
  }

  on(callbacks: DeviceCallbacks): d3.selection {
    this.contextMenuService.setItems([
      {
        label: this.unsetLabel,
        command: callbacks.unset
      }
    ]);
    this.svgGroupWrapper.getGroup().on('contextmenu', (): void => {
      d3.event.preventDefault();
      this.contextMenuService.openContextMenu();
      this.devicePlacerService.emitSelected(this);
    });
    return this;
  }

  off(): d3.selection {
    this.svgGroupWrapper.getGroup().on('contextmenu', null);
    return this;
  }

  removeAllAnchors(): void {
    this.anchors.forEach((anchor: AnchorInEditor) => {
      anchor.remove();
    });
    this.anchors = [];
  }

  addAnchor(anchor: AnchorInEditor): void {
    this.anchors.push(anchor);
  }

  removeAnchor(anchor: AnchorInEditor): void {
    anchor.remove();
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
}
