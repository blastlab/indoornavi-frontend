import {Line, Point} from '../../../map-editor/map.type';

export namespace APIObject {
  export interface Base {
    id: number;
  }

  export interface Polyline extends Base {
    color: string;
  }

  export interface Path extends Base {
    lines: Line[];
  }

  export interface Area extends Base {
    events: string[];
    color: string;
    opacity: number;
    border: Border;
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

  export interface NavigationData {
    action: string;
    position?: Point;
    location?: Point;
    destination?: Point;
    accuracy?: number;
    navigationPoint?: Metadata;
    pathColor?: string;
    state?: boolean;
    pathWidth?: number;
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
