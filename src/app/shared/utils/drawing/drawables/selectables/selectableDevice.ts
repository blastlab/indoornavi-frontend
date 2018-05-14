import {Selectable} from './selectable';
import {SvgGroupWrapper} from '../../drawing.builder';
import * as d3 from 'd3';
import {MapEditorService} from '../../../../../map-editor/map.editor.service';

export class SelectableDevice extends Selectable {
  private hasBorder: boolean;

  constructor(protected group: SvgGroupWrapper,
              private borderColor?: string) {
    super(group);
  }

  public setBorderBox(scale: number) {
    this.removeBorderBox();
    this.group.addBorderBox(scale, this.borderColor);
    this.hasBorder = true;
  }

  public removeBorderBox() {
    if (this.hasBorder) {
      this.group.removeBorderBox();
      this.hasBorder = false;
    }
  }

  public highlightSet(color?: string): void {
    super.highlightSet(color);
    this.redrawBorderBox();
  }

  public highlightReset(): void {
    super.highlightReset();
    this.redrawBorderBox();
  }

  private redrawBorderBox(): void {
    if (this.hasBorder) {
      this.removeBorderBox();
      const scale = d3.zoomTransform(document.getElementById(MapEditorService.MAP_UPPER_LAYER_SELECTOR_ID));
      this.setBorderBox(scale.k);
    }
  }
}
