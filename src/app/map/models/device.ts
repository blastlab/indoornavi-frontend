import {Point} from '../../map-editor/map.type';
import {DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/devices/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {
  DeviceAppearance,
  DeviceCallbacks,
  DeviceInEditorConfiguration
} from '../../map-editor/tool-bar/tools/devices/device-placer/device-placer.types';
import {Geometry} from '../../shared/utils/helper/geometry';
import {Box} from '../../shared/utils/drawing/drawing.types';


export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private reactiveToEvents: boolean = false;
  private cursorIcon: string = '\uf245';
  private colorOutOfScope: string = '#727272';
  private colorInScope: string = '#000000';
  private colorHover: string = '#ff3535';
  private colorBackgroundHover: string = '#75ffde';
  private colorBackgroundActive: string = '#1ed5ff';
  private colorBackgroundInactive: string = '#FFFFFF';
  private opacityBackgroundActive: number = 0.5;
  private opacityBackgroundInactive: number = 0;
  private appearance: DeviceAppearance = DeviceAppearance.IN_SCOPE;
  private unsetLabel: string;
  private readonly containerBox: Box;

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
    this.setTranslations();
    this.containerBox = this.container.node().getBBox();
  }

  getPosition(): Point {
    return {
      x: parseInt(this.svgGroupWrapper.getGroup().attr('x'), 10),
      y: parseInt(this.svgGroupWrapper.getGroup().attr('y'), 10)
    }
  }

  setActive(): void {
    this.setDeviceAppearance(this.colorInScope, this.colorBackgroundActive, this.opacityBackgroundActive);
    this.appearance = DeviceAppearance.ACTIVE;
  }

  setInGroupScope(): void {
    this.setDeviceAppearance(this.colorInScope, this.colorBackgroundInactive, this.opacityBackgroundInactive);
    this.appearance = DeviceAppearance.IN_SCOPE;
  }

  setOutOfGroupScope(): void {
    this.setDeviceAppearance(this.colorOutOfScope, this.colorBackgroundInactive, this.opacityBackgroundInactive);
    this.appearance = DeviceAppearance.OUT_SCOPE;
  }

  contextMenuOn(callbacks: DeviceCallbacks): d3.selection {
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

  activateForMouseEvents(): void {
    this.reactiveToEvents = true;
  }

  deactivate(): void {
    this.reactiveToEvents = false;
  }

  contextMenuOff(): d3.selection {
    this.svgGroupWrapper.getGroup().on('contextmenu', null);
    this.setOutOfGroupScope();
    return this;
  }

  remove(): void {
    this.svgGroupWrapper.getGroup().remove();
  }

  private createDeviceOnMapGroup(coordinates: Point, container: d3.selection, drawConfiguration: DeviceInEditorConfiguration) {
    const deviceDescription = this.getDeviceDescription();
    const colorBackground: string = this.colorBackgroundInactive;

    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place(coordinates)
      .addIcon2({x: 0, y: 0}, this.cursorIcon)
      .addText({x: 0, y: 40}, deviceDescription);
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
        if (this.reactiveToEvents) {
          this.setHover();
          this.svgGroupWrapper.getGroup().style('cursor', 'pointer');
          this.svgGroupWrapper.showTexts();
        }
      })
      .on('mouseout', (): void => {
        if (this.reactiveToEvents) {
          this.svgGroupWrapper.getGroup().style('cursor', 'default');
          this.svgGroupWrapper.hideTexts();
          switch (this.appearance) {
            case 0:
              this.setInGroupScope();
              break;
            case 1:
              this.setOutOfGroupScope();
              break;
            case 2:
              this.setActive();
              break;
          }
        }
      })
      .on('mousedown', (): void => {
        d3.event.stopPropagation();
        if (this.reactiveToEvents) {
          this.devicePlacerService.emitActivated(this);
        }
      })
      .on('click', (): void => {
        d3.event.stopPropagation();
      });
  }

  private setMovable(): void {
    let element: d3.selection = this.svgGroupWrapper.getGroup();
    let coordinatesBackUp: Point;
    let coordinates: Point;
    const drag: d3.event = d3.drag()
      .on('drag', (): void => {coordinatesBackUp = Object.assign({}, this.coordinates);
        if (this.reactiveToEvents) {
          coordinates = {
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
        const coordinatesInRange: boolean = Geometry.areCoordinatesInGivenRange(coordinates, this.containerBox);
        if (!coordinatesInRange && !!coordinatesBackUp) {
          this.svgGroupWrapper.getGroup().attr('x', coordinatesBackUp.x);
          this.svgGroupWrapper.getGroup().attr('y', coordinatesBackUp.y);
        }
        this.coordinates = {
          x: d3.event.dx + parseInt(this.svgGroupWrapper.getGroup().attr('x'), 10),
          y: d3.event.dy + parseInt(this.svgGroupWrapper.getGroup().attr('y'), 10)
        };
        element = null;
        this.devicePlacerService.emitDevicePositionChanged();
      });
    element.call(drag);
  }

  private setTranslations() {
    this.translateService.get('unset').subscribe((value: string) => {
      this.unsetLabel = value;
    });
  }
}
