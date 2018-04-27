import {IconService, NaviIcons} from '../../../services/drawing/icon.service';
import {Expandable} from '../drawables/expandable';
import {DrawBuilder, SvgGroupWrapper} from '../drawing.builder';
import {SelectableDevice} from '../drawables/selectables/selectableDevice';
import {ConnectableDevice} from '../drawables/draggables/connectables/connectableDevice';
import {DrawConfiguration} from '../../../../map-viewer/publication.type';
import {Point} from '../../../../map-editor/map.type';

export class CommonDevice {

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

  protected drawEditorDevice(drawBuilder: DrawBuilder, drawConfiguration: DrawConfiguration,
                   coordinates: Point): SvgGroupWrapper {
    const text = (!drawConfiguration.name)
      ? `${drawConfiguration.name}-${drawConfiguration.id}`
      : `${drawConfiguration.clazz}-${drawConfiguration.id}`;
    console.log(drawBuilder);
    console.log(drawConfiguration);
    console.log(coordinates);
    const wrapper = drawBuilder.createGroup()
      .place(coordinates)
      .addPointer({x: -12, y: -12}, this.icons.getIcon(NaviIcons.POINTER))
      .addText({x: 5, y: -5}, text);
    if (drawConfiguration.clazz.includes(`sink`)) {
      wrapper.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.SINK));
    } else if (drawConfiguration.clazz.includes(`anchor`)) {
      wrapper.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    console.log(wrapper);
    return wrapper;
  }

}
