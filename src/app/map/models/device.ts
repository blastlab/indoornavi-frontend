import {DrawConfiguration} from '../../map-viewer/publication.type';
import {Point} from '../../map-editor/map.type';
import {DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {BrowserDetector} from '../../shared/services/browser-detector/browser.detector';
import {TranslateService} from '@ngx-translate/core';


export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private reactiveToEvents: boolean = false;
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
  protected unsetLabel: string;

  constructor(
    protected coordinates: Point,
    protected container: d3.selection,
    protected drawConfiguration: DeviceInEditorConfiguration,
    protected devicePlacerService: DevicePlacerService,
    protected contextMenuService: ContextMenuService,
    protected translateService: TranslateService
  ) {
    this.createDeviceOnMapGroup(coordinates, container, drawConfiguration);
    this.addReactionToMouseEvents();
    this.setMovable();
    this.setTranslation('unset');
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
        label: this.unsetLabel,
        command: callbacks.unset
      }
    ]);
    this.svgGroupWrapper.getGroup().on('contextmenu', (): void => {
      this.contextMenuService.openContextMenu();
      this.devicePlacerService.emitSelected(this);
    });
    return this;
  }

  activate(): void {
    this.reactiveToEvents = true;
  }

  deactivate(): void {
    this.reactiveToEvents = false;
  }

  off(): d3.selection {
    this.svgGroupWrapper.getGroup().on('contextmenu', null);
    this.setOutOfGroupScope();
    return this;
  }

  remove(): void {
    this.svgGroupWrapper.getGroup().remove();
  }

  private setTranslation(value: string): void {
    this.translateService.setDefaultLang('en');
    this.translateService
      .get(value, {'browser': BrowserDetector.getBrowserName()})
      .subscribe((translatedValue) => {
        this.unsetLabel = translatedValue;
      });
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
        this.svgGroupWrapper.getGroup().style('cursor', 'pointer');
      })
      .on('mouseout', (): void => {
        this.svgGroupWrapper.getGroup().style('cursor', 'default');
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
        d3.event.stopPropagation();
        if (this.reactiveToEvents) {
          this.devicePlacerService.emitActive(this);
        }
      });
  }

  private setMovable(): void {
    let element: d3.selection = this.svgGroupWrapper.getGroup();
    const drag: d3.event = d3.drag()
      .on('drag', (): void => {
          if (this.reactiveToEvents) {
            const coordinates: Point = {
              x: d3.event.dx + parseInt(this.svgGroupWrapper.getGroup().attr('x'), 10),
              y: d3.event.dy + parseInt(this.svgGroupWrapper.getGroup().attr('y'), 10)
            };
            this.svgGroupWrapper.getGroup().attr('x', coordinates.x);
            this.svgGroupWrapper.getGroup().attr('y', coordinates.y);
          }
        }
      )
      .on('start', (): void => {
        element = d3.select(d3.event.sourceEvent.target);
        d3.event.sourceEvent.stopPropagation();
      })
      .on('end', (): void => {
        element = null;
      });
    element.call(drag);
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
