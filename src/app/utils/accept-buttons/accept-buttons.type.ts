import {Point} from '../../map/map.type';

export interface AcceptButtons {
  show(position: Point): void;
  decide(decision: boolean): void;
}
