import {Tag} from '../tag/tag.type';
import {User} from '../user/user.type';
import {Floor} from '../floor/floor.type';
import {Point} from '../map/map.type';

export interface PublishedMap {
  id?: number;
  floor: Floor;
  users: User[];
  tags: Tag[];
}

export interface MeasureSocketData {
  type: MeasureSocketDataType;
  coordinates: Coordinates;
}

export enum MeasureSocketDataType {
  TAGS,
  COORDINATES
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
