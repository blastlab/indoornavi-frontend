import {BoxSize} from '../../shared/utils/drawing/drawing.builder';

export class ModelsConfig {
  iconSizeScalar: number = 45;
  transformHorizontal: number = 8;
  transformVertical: number = 8;
  markerUnicode = '\uf041'; // fa-map-marker
  cursorIcon: string = '\uf245';
  anchorUnicode: string = '\uf2ce'; // fa-podcast
  tagUnicode = '\uf183'; // fa-male
  colorOutOfScope: string = '#727272';
  colorInScope: string = '#000000';
  pointRadius: number = 5;
  customIconSize: BoxSize = {
    width: 45,
    height: 45
  };
  defaultIconSize: BoxSize = {
    width: 10,
    height: 32
  };
}
