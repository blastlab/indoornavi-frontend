import {DeviceInEditor} from './device';
import {Point} from '../../map-editor/map.type';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/device-placer/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {AnchorBag, DeviceCallbacks, DeviceInEditorConfiguration, DeviceType} from '../../map-editor/tool-bar/tools/device-placer/device-placer.types';
import {Box} from '../../shared/utils/drawing/drawing.builder';

export class SinkInEditor extends DeviceInEditor {

  type: DeviceType = DeviceType.SINK;

  protected sinkUnicode: string = '\uf1e6'; // fa-plug
  anchors: AnchorBag[] = [];

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
    this.svgGroupWrapper = this.svgGroupWrapper.addIcon({x: 18, y: 18}, this.sinkUnicode, 2);
  }

  addAnchor(anchor: AnchorBag): void {
    this.anchors.push(anchor);
  }

  removeAnchor(anchor: AnchorBag): void {
    anchor.deviceInEditor.remove();
    const index: number = this.anchors.indexOf(anchor);
    if (index !== -1) {
      this.anchors.splice(index, 1);
    }
  }

  removeAllAnchors(): void {
    this.anchors.forEach((anchor: AnchorBag) => {
      anchor.deviceInEditor.remove();
    });
    this.anchors = [];
  }

  setSinkGroupScope(): void {
    this.anchors.forEach((anchor: AnchorBag): void => {
      anchor.deviceInEditor.setInGroupScope();
    });
  }

  setSinkGroupOutOfScope(): void {
    this.anchors.forEach((anchor: AnchorBag): void => {
      anchor.deviceInEditor.setOutOfGroupScope();
    });
  }

  hasAnchor(anchor: AnchorBag): boolean {
    const index: number = this.anchors.indexOf(anchor);
    return index > -1;
  }

  activateAnchors(contextMenu: DeviceCallbacks): void {
    this.anchors.forEach((anchor: AnchorBag): void => {
      anchor.deviceInEditor.contextMenuOn(contextMenu);
      anchor.deviceInEditor.activateForMouseEvents();
    });
  }

  deactivateAnchors(): void {
    this.anchors.forEach((anchor: AnchorBag): void => {
      anchor.deviceInEditor.contextMenuOff();
      anchor.deviceInEditor.deactivate();
    });
  }
}
