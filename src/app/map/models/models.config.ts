import {BoxSize} from '../../shared/utils/drawing/drawing.builder';

export class ModelsConfig {
  iconSizeScalar = 45;
  transformHorizontal = 8;
  transformVertical = 8;
  markerUnicode = '\uf041'; // fa-map-marker
  cursorIcon = '\uf245';
  anchorUnicode = '\uf2ce'; // fa-podcast
  tagUnicode = '\uf183'; // fa-male
  colorOutOfScope = '#727272';
  colorInScope = '#000000';
  pointRadius = 5;
  labelTextLength = 24;
  customIconSize: BoxSize = {
    width: 45,
    height: 45
  };
  defaultIconSize: BoxSize = {
    width: 10,
    height: 32
  };
}
