import {User} from '../user/user.type';
import {Floor} from '../floor/floor.type';
import {Point} from '../map-editor/map.type';
import {Tag} from '../device/tag.type';

export interface PublishedMap {
  id?: number;
  floor: Floor;
  users: User[];
  tags: Tag[];
}

export interface MeasureSocketData {
  type: MeasureSocketDataType;
}

export enum MeasureSocketDataType {
  TAGS,
  COORDINATES,
  EVENT
}

export interface CoordinatesSocketData extends MeasureSocketData {
  coordinates: Coordinates;
}

export interface EventSocketData extends MeasureSocketData {
  event: AreaEvent;
}

export interface AreaEvent {
  mode: AreaEventMode;
  areaName: string;
  areaId: number;
  tagId: number;
}

export enum AreaEventMode {
  ON_LEAVE,
  ON_ENTER
}

export interface Coordinates {
  point: Point;
  floorId: number;
  tagShortId: number;
}

export interface SocketCommand {
  type: CommandType;
  args: string;
}

export enum CommandType {
  SET_FLOOR,
  SET_TAGS,
  TOGGLE_TAG
}

export interface DrawConfiguration {
  id: string;
  clazz: string;
  cursor?: string;
  name?: string;
  color?: string;
}
