import {IconService, NaviIcons} from '../../../services/drawing/icon.service';
import {Expandable} from '../drawables/expandable';
import {DrawBuilder, SvgGroupWrapper} from '../drawing.builder';
import {SelectableDevice} from '../drawables/selectables/selectableDevice';
import {ConnectableDevice} from '../drawables/draggables/connectables/connectableDevice';
import {DrawConfiguration} from '../../../../map-viewer/publication.type';
import {Point} from '../../../../map-editor/map.type';

export class CommonDevice {

  // TODO: remove this

  static createConnectableDevice(droppedDevice: SvgGroupWrapper): Expandable {
    return <Expandable>{
      groupCreated: droppedDevice,
      selectable: new SelectableDevice(droppedDevice, 'red'),
      connectable: new ConnectableDevice(droppedDevice)
    };
  }

  constructor(
    protected icons: IconService) {
  }

  protected drawEditorDevice(drawBuilder: DrawBuilder, drawConfiguration: CommonDeviceConfiguration,
                             coordinates: Point): SvgGroupWrapper {
    let text = (!drawConfiguration.name)
      ? `${drawConfiguration.name}-${drawConfiguration.id}`
      : `${drawConfiguration.clazz}-${drawConfiguration.id}`;
    if (!!drawConfiguration.heightInMeters) {
      text += ` (${drawConfiguration.heightInMeters}m)`
    }
    const wrapper = drawBuilder.createGroup()
      .place(coordinates)
      .addPointer({x: -12, y: -12}, this.icons.getIcon(NaviIcons.POINTER))
      .addText({x: 5, y: -5}, text);
    if (drawConfiguration.clazz.includes(`sink`)) {
      wrapper.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.SINK));
    } else if (drawConfiguration.clazz.includes(`anchor`)) {
      wrapper.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    return wrapper;
  }

}

export interface CommonDeviceConfiguration extends DrawConfiguration {
  heightInMeters: number;
}
