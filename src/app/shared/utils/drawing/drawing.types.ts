import {Point} from '../../../map-editor/map.type';

export interface MapObject {
  id: number;
}

export interface CoordinatesArray extends MapObject {
  points: Point[];
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stroke extends MapObject {
  stroke: string;
}

export interface Fill extends MapObject {
  fill: string;
}

export interface Opacity extends MapObject {
  opacity: number;
}

export interface MapObjectMetadata {
  type: string;
  object: MapObject
}

export interface Marker extends MapObject {
  events: number[];
  icon: string;
  label: string;
  points: Point[];
}

export interface InfoWindow extends MapObject {
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
