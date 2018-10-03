import {Geometry} from '../helper/geometry';
import {Line, Point} from '../../../map-editor/map.type';
import {Cost, GraphRelation, Parent, Vertex} from './navigation.types';

export class NavigationService {

  static updateVertexMatrix(vertexIndexToUpdate: number, relatedVertexIndex: number, cost: number, vertexMatrix: Vertex[]): void {
    const foundVertex: GraphRelation = vertexMatrix[vertexIndexToUpdate].graphs.find((relation: GraphRelation): boolean => {
      return relatedVertexIndex === relation.vertexIndex;
    });
    if (!!foundVertex) {
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
    console.log('lines', lines);
    const startPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(lines, start);
    const endPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(lines, finish);
    const dijkstraVertexMatrix: Vertex[] = NavigationService.createDijkstraVertexMatrix(lines);
    const startPointIndex: number = dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === startPointCoordinatesOnLines.x && vertex.coordinates.y === startPointCoordinatesOnLines.y;
    });
    const endPointIndex: number = dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === endPointCoordinatesOnLines.x && vertex.coordinates.y === endPointCoordinatesOnLines.y;
    });
    console.log(dijkstraVertexMatrix);

    const costs: Cost = {
      [startPointIndex]: 0,
      [endPointIndex]: Infinity
    };
    const processed: number[] = [startPointIndex];
    const parents: Parent = {[endPointIndex]: null};
    let cheapestVertexIndex: number = startPointIndex;
    while (!processed.includes(endPointIndex)) {
      dijkstraVertexMatrix[cheapestVertexIndex].graphs.forEach((graph: GraphRelation): void => {
        if (processed.includes(graph.vertexIndex)) {
          return;
        }
        const parenCost: number = costs[`${cheapestVertexIndex}`];
        const childCost: number = graph.cost + parenCost;

        if (Object.keys(costs).includes(`${graph.vertexIndex}`) && costs[`${graph.vertexIndex}`] > childCost) {
          costs[`${graph.vertexIndex}`] = childCost;
        } else {
          costs[`${graph.vertexIndex}`] = childCost;
        }
        parents[`${graph.vertexIndex}`] = cheapestVertexIndex;
      });
      let minCost = Infinity;
      let minValueIndex: number;
      for (const key of Object.keys(costs)) {
        const keyAsNumber = parseInt(key, 10);
        if (!processed.includes(keyAsNumber)) {
          if (minCost > costs[key]) {
            minCost = costs[key];
            minValueIndex = keyAsNumber;
          }
        }
      }
      cheapestVertexIndex = minValueIndex;
      processed.push(cheapestVertexIndex);
    }
    console.log('processed : ', processed);
    console.log('start, finish :', startPointIndex, endPointIndex);
    console.log('parents: ', parents);
    const shortestPathLine: Line[] = [];
    let actualIndexFromParents = endPointIndex;
    let currentStartPoint: Point;
    let currentEndPoint: Point = dijkstraVertexMatrix[endPointIndex].coordinates;
    while ( actualIndexFromParents !== startPointIndex) {
      actualIndexFromParents = parents[`${actualIndexFromParents}`];
      currentStartPoint = dijkstraVertexMatrix[actualIndexFromParents].coordinates;
      const line: Line = {
        startPoint: currentStartPoint,
        endPoint: currentEndPoint
      };
      shortestPathLine.push(line);
      currentEndPoint = currentStartPoint;
    }
    console.log('shortest path: ', shortestPathLine);
    return shortestPathLine;
  }

  static createDijkstraVertexMatrix(lines: Line[]): Vertex[] {
    const vertexMatrix: Vertex[] = [];
    lines.forEach((line: Line): void => {
      NavigationService.appendToVertexMatrix(line, vertexMatrix);
    });
    return vertexMatrix;
  }

}
