import {Point} from '../../../map-editor/map.type';


export interface Vertex {
  coordinates: Point;
  graphs: GraphRelation[];
}

export interface GraphRelation {
  vertexIndex: number;
  cost: number;
}

export interface Cost {
  [x: number]: number
}

export interface Parent {
  [child: number]: number
}
