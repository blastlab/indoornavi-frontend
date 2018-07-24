import {DeviceCallbacks, DeviceInEditor, DeviceInEditorConfiguration} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';
import {DevicePlacerService, DeviceType} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {AnchorInEditor} from './anchor';
import {TranslateService} from '@ngx-translate/core';

export class SinkInEditor extends DeviceInEditor {

  type: DeviceType = DeviceType.SINK;

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

  activateAnchors(contextMenu: DeviceCallbacks): void {
    this.anchors.forEach((anchor: AnchorInEditor): void => {
      anchor.on(contextMenu);
      anchor.activateForMouseEvents();
    });
  }

  deactivateAnchors(): void {
    this.anchors.forEach((anchor: AnchorInEditor): void => {
      anchor.off();
      anchor.deactivate();
    });
  }
}
