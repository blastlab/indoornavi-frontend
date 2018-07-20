import {DrawConfiguration} from '../../map-viewer/publication.type';
import {Point} from '../../map-editor/map.type';
import {DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {SinkInEditor} from './sink';
import {AnchorInEditor} from './anchor';

export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private plusUnicode: string = '\uf245';
  private colorOutOfScope: string = '#bababa';
  private colorInScope: string = '#000000';
  private colorHover: string = '#ff3535';
  private colorBackgroundHover: string = '#75ffde';
  private colorBackgroundActive: string = '#1ed5ff';
  private colorBackgroundInactive: string = '#FFFFFF';
  private opacityBackgroundActive: number = 0.5;
  private opacityBackgroundInactive: number = 0;
  private appearance: DeviceAppearance = DeviceAppearance.INSCOPE;

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService
  ) {
    this.createDeviceOnMapGroup(coordinates, container, drawConfiguration);
    this.addReactionToMouseEvents();
    this.setMovable();
  }

  setActive(): void {
    this.setDeviceAppearance(this.colorInScope, this.colorBackgroundActive, this.opacityBackgroundActive);
    this.appearance = DeviceAppearance.ACTIVE;
  }

  setInGroupScope(): void {
    this.setDeviceAppearance(this.colorInScope, this.colorBackgroundInactive, this.opacityBackgroundInactive);
    this.appearance = DeviceAppearance.INSCOPE;
  }

  setOutOfGroupScope(): void {
    this.setDeviceAppearance(this.colorOutOfScope, this.colorBackgroundInactive, this.opacityBackgroundInactive);
    this.appearance = DeviceAppearance.OUTSCOPE;
  }

  on(callbacks: DeviceCallbacks): d3.selection {
    this.contextMenuService.setItems([
      {
        label: 'unset',
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

  private createDeviceOnMapGroup(coordinates: Point, container: d3.selection, drawConfiguration: DeviceInEditorConfiguration) {
    const deviceDescription = this.getDeviceDescription();
    const colorBackground: string = this.colorBackgroundInactive;

    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place(coordinates)
      .addIcon2({x: -12, y: -12}, this.plusUnicode)
      .addText({x: 5, y: -5}, deviceDescription)
      .addRectangle({x: -22, y: -33}, {x: 65, y: 65}, 0, colorBackground, true);
  }

  private setHover(): void {
    this.setDeviceAppearance(this.colorHover, this.colorBackgroundHover, this.opacityBackgroundActive);
  }

  private setDeviceAppearance(color, colorBackground, opacityBackground): void {
    this.svgGroupWrapper.getGroup()
      .selectAll('text')
      .attr('stroke', color)
      .attr('fill', color);

    this.svgGroupWrapper.getGroup()
      .selectAll('rect')
      .attr('fill', colorBackground)
      .attr('opacity', opacityBackground);
  }

  private getDeviceDescription(): string {
    let text = (!!this.drawConfiguration.name)
      ? `${this.drawConfiguration.name}-${this.drawConfiguration.id}`
      : `${this.drawConfiguration.clazz}-${this.drawConfiguration.id}`;
    if (!!this.drawConfiguration.heightInMeters) {
      text += ` (${this.drawConfiguration.heightInMeters}m)`
    }
    return text;
  }

  private addReactionToMouseEvents(): void {
    this.svgGroupWrapper.getGroup()
      .on('mouseover', (): void => {
        this.setHover();
      })
      .on('mouseout', (): void => {
        switch (this.appearance) {
          case 0: this.setInGroupScope();
            break;
          case 1: this.setOutOfGroupScope();
            break;
          case 2: this.setActive();
            break;
        }
      })
      .on('click', (): void => {
        this.devicePlacerService.emitActive(this);
      });
  }

  private setMovable(): void {
    let element: d3.selection = this.svgGroupWrapper.getGroup();
    element.call(
      d3.drag()
        .on('drag', (): void => {
          const coordinates: Point = {
            x: d3.event.dx + parseInt(this.svgGroupWrapper.getGroup().attr('x'), 10),
            y: d3.event.dy + parseInt(this.svgGroupWrapper.getGroup().attr('y'), 10)
          };
          this.svgGroupWrapper.getGroup().attr('x', coordinates.x);
          this.svgGroupWrapper.getGroup().attr('y', coordinates.y);
          }
        )
        .on('start', (): void => {
          element = d3.select(d3.event.sourceEvent.target);
          d3.event.sourceEvent.stopPropagation();
        })
        .on('end', (): void => {
          element = null;
        })
    );
  }


}

export interface DeviceInEditorConfiguration extends DrawConfiguration {
  heightInMeters: number;
}

export enum DeviceAppearance {
  INSCOPE, OUTSCOPE, ACTIVE
}

export interface DeviceCallbacks {
  unset: () => void;
}

export enum DeviceInEditorType {
  ANCHOR, SINK
}
