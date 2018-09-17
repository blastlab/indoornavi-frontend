import {Point} from '../../map-editor/map.type';
import {Box, DrawBuilder, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {DevicePlacerService} from '../../map-editor/tool-bar/tools/device-placer/device-placer.service';
import {ContextMenuService} from '../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {DeviceAppearance, DeviceCallbacks, DeviceInEditorConfiguration} from '../../map-editor/tool-bar/tools/device-placer/device-placer.types';
import {Geometry} from '../../shared/utils/helper/geometry';


export class DeviceInEditor {

  protected svgGroupWrapper: SvgGroupWrapper;

  private reactiveToEvents: boolean = false;
  private cursorIcon: string = '\uf245';
  private colorOutOfScope: string = '#727272';
  private colorInScope: string = '#000000';
  private appearance: DeviceAppearance = DeviceAppearance.IN_SCOPE;
  private unsetLabel: string;

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
    this.createDeviceOnMapGroup(coordinates, container, drawConfiguration);
    this.addReactionToMouseEvents();
    this.setMovable();
    this.setTranslations();
  }

  getPosition(): Point {
    return this.coordinates;
  }

  setActive(): void {
    this.setDeviceAppearance(this.colorInScope);
    this.appearance = DeviceAppearance.ACTIVE;
  }

  setInGroupScope(): void {
    this.setDeviceAppearance(this.colorInScope);
    this.appearance = DeviceAppearance.IN_SCOPE;
  }

  setOutOfGroupScope(): void {
    this.setDeviceAppearance(this.colorOutOfScope);
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
    this.svgGroupWrapper = new DrawBuilder(container, drawConfiguration).createGroup()
      .place(coordinates)
      .addIcon2({x: 0, y: 11}, this.cursorIcon) // icon 0,0 coordinates are at the font bottom left
      .addText({x: 0, y: 40}, deviceDescription)
      .hideTexts();
  }

  private setDeviceAppearance(color): void {
    this.svgGroupWrapper.getGroup()
      .selectAll('text')
      .attr('stroke', color)
      .attr('fill', color);
  }

  private getDeviceDescription(): string {
    let text = (!!this.drawConfiguration.name)
      ? `${this.drawConfiguration.name}-${this.drawConfiguration.id}`
      : `${this.drawConfiguration.clazz}-${this.drawConfiguration.id}`;

    const heightInMeters = this.drawConfiguration.heightInMeters;

    if (!!heightInMeters || heightInMeters === 0) {
      text += ` (${heightInMeters / 100}m)`
    }
    return text;
  }

  private addReactionToMouseEvents(): void {
    const onMouseOut = (): void => {
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
    };
    this.svgGroupWrapper.getGroup()
      .on('mouseover', (): void => {
        if (this.reactiveToEvents) {
          this.svgGroupWrapper.getGroup().style('cursor', 'pointer');
          this.svgGroupWrapper.showTexts();
        }
      })
      .on('mouseout', onMouseOut)
      .on('mousedown', (): void => {
        this.svgGroupWrapper.getGroup().on('mouseout', null);
        if (this.reactiveToEvents) {
          this.devicePlacerService.emitActivated(this);
        }
      })
      .on('click', (): void => {
        // to stop map click event that deactivates selection
        d3.event.stopPropagation();
      })
      .on('mouseup', (): void => {
        this.svgGroupWrapper.getGroup().on('mouseout', onMouseOut);
      });
  }

  private setMovable(): void {
    let element: d3.selection = this.svgGroupWrapper.getGroup();
    let coordinatesBackUp: Point;
    let coordinates: Point;
    const drag: d3.event = d3.drag()
      .on('drag', (): void => {
          coordinatesBackUp = Object.assign({}, this.coordinates);
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
          this.svgGroupWrapper.hideTexts();
          this.svgGroupWrapper.getGroup().dispatch('mouseup');
        }
        this.coordinates = {
          x: d3.event.dx + parseInt(this.svgGroupWrapper.getGroup().attr('x'), 10),
          y: d3.event.dy + parseInt(this.svgGroupWrapper.getGroup().attr('y'), 10)
        };
        element = null;
        if (!!coordinates && !!coordinatesBackUp) {
          this.devicePlacerService.emitDevicePositionChanged();
        }
      });
    element.call(drag);
  }

  private setTranslations() {
    this.translateService.get('unset').subscribe((value: string) => {
      this.unsetLabel = value;
    });
  }
}
