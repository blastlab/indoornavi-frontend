import {Point} from '../../../map-editor/map.type';

export namespace APIObject {
  export interface Base {
    id: number;
  }

  export interface Polyline extends Base {
    stroke: string;
  }

  export interface Area extends Base {
    fill: string;
    opacity: number;
  }

  export interface Circle extends Base {
    radius: number;
    border: Border;
    opacity: number;
    color: string;
  }

  export interface Metadata {
    type: string;
    object: Base;
  }

  export interface Marker extends Base {
    events: string[];
    icon: string;
    label: string;
    points: Point[];
  }

  export interface InfoWindow extends Base {
    content: string;
    position: number;
    width: number;
    height: number;
    relatedObjectId: number;
  }

  export interface DefaultIcon {
    icon: string;
    translation: Point;
  }

  export interface Border {
    width: number;
    color: string;
  }

  export enum Position {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT,
    TOP_RIGHT,
    TOP_LEFT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT
  }
}
