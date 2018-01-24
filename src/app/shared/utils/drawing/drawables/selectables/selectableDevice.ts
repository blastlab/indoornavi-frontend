import {GroupCreated} from '../draw.builder';
import {Selectable} from './selectable';

export class SelectableDevice extends Selectable {
  private hasBorder: boolean;


  constructor(protected group: GroupCreated) {
    super(group);
  }

  public setBorderBox(defineColor?: string) {
    this.removeBorderBox();
    this.group.addBorderBox(defineColor);
    this.hasBorder = true;
  }

  public removeBorderBox() {
    if (this.hasBorder) {
      this.group.removeBorderBox();
      this.hasBorder = false;
    }
  }
}
