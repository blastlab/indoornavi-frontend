import {Selectable} from './selectable';
import {SvgGroupWrapper} from '../../drawing.builder';

export class SelectableDevice extends Selectable {
  private hasBorder: boolean;


  constructor(protected group: SvgGroupWrapper) {
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
