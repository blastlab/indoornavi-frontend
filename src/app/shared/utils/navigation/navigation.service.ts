import {Geometry} from '../helper/geometry';
import {Line, Point} from '../../../map-editor/map.type';
import {GraphRelation, Vertex} from './navigation.types';
import {SvgGroupWrapper} from '../drawing/drawing.builder';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {log} from 'util';

export class NavigationService {

  static updateVertexMatrix(vertexIndexToUpdate: number, relatedVertexIndex: number, cost: number, vertexMatrix: Vertex[]): void {
    const foundVertex: GraphRelation = vertexMatrix[vertexIndexToUpdate].graphs.find((relation: GraphRelation): boolean => {
      return vertexIndexToUpdate === relation.vertexIndex;
    });
    if (foundVertex) {
      return;
    }
    vertexMatrix[vertexIndexToUpdate].graphs.push({
      vertexIndex: relatedVertexIndex,
      cost: cost
    });
  }

  static addNewVertex (coordinates: Point, vertexMatrix: Vertex[]): number {
    vertexMatrix.push({
      coordinates: coordinates,
      graphs: []
    });
    return vertexMatrix.length - 1;
  }

  static appendToVertexMatrix(line: Line, vertexMatrix: Vertex[]): void {
    if (line.startPoint.x === line.endPoint.x && line.startPoint.y === line.endPoint.y) {
      return;
    }
    let startVertexIndex: number = vertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === line.startPoint.x && vertex.coordinates.y === line.startPoint.y;
    });
    let endVertexIndex: number = vertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === line.endPoint.x && vertex.coordinates.y === line.endPoint.y;
    });
    if (startVertexIndex === -1) {
      startVertexIndex = NavigationService.addNewVertex(line.startPoint, vertexMatrix);
    }
    if (endVertexIndex === -1) {
      endVertexIndex = NavigationService.addNewVertex(line.endPoint, vertexMatrix);
    }
    const cost: number = Geometry.getDistanceBetweenTwoPoints(line.startPoint, line.endPoint);
    NavigationService.updateVertexMatrix(startVertexIndex, endVertexIndex, cost, vertexMatrix);
    NavigationService.updateVertexMatrix(endVertexIndex, startVertexIndex, cost, vertexMatrix);
  }

  static calculateDijkstraShortestPath(lines: Line[], start: Point, finish: Point): Line[] {
    const startPointIndex: number = Geometry.pickClosestNodeIndex(lines, start);
    const endPointIndex: number = Geometry.pickClosestNodeIndex(lines, finish);
    console.log(startPointIndex, endPointIndex);
    const dijkstraVertexMatrix: Vertex[] = NavigationService.createDijkstraVertexMatrix(lines);
    console.log({index: endPointIndex, cost: Infinity});
    console.log(dijkstraVertexMatrix[startPointIndex]);
    console.log(dijkstraVertexMatrix[startPointIndex].graphs);
    const costs = {};
    costs[endPointIndex] = Infinity;
    dijkstraVertexMatrix[startPointIndex].graphs.forEach((cost: GraphRelation) => {
      costs[cost.vertexIndex] = cost.cost;
    });
    console.log(costs);
    // const parents: Dictionary<number, Vertex> = Object.assign({startPointIndex: }, {startPointIndex: dijkstraVertexMatrix[startPointIndex]});
    const processed = [];

    console.log(dijkstraVertexMatrix);
    return lines;
  }

  static createDijkstraVertexMatrix(lines: Line[]): Vertex[] {
    const vertexMatrix: Vertex[] = [];
    lines.forEach((line: Line): void => {
      NavigationService.appendToVertexMatrix(line, vertexMatrix);
    });
    return vertexMatrix;
  }
}
