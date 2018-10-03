import {Geometry} from '../helper/geometry';
import {Line, Point} from '../../../map-editor/map.type';
import {Cost, GraphRelation, Parent, Vertex} from './navigation.types';

export class NavigationService {

  private lines: Line[];
  private dijkstraVertexMatrix: Vertex[] = [];

  constructor() {

  }
  calculateDijkstraShortestPath(lines: Line[], start: Point, finish: Point): Line[] {
    this.lines = lines;
    const startPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(lines, start);
    const endPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(lines, finish);
    this.createDijkstraVertexMatrix();
    const startPointIndex: number = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === startPointCoordinatesOnLines.x && vertex.coordinates.y === startPointCoordinatesOnLines.y;
    });
    const endPointIndex: number = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === endPointCoordinatesOnLines.x && vertex.coordinates.y === endPointCoordinatesOnLines.y;
    });
    console.log('Vertex[]: ', this.dijkstraVertexMatrix);

    const costs: Cost = {
      [startPointIndex]: 0,
      [endPointIndex]: Infinity
    };
    const processed: number[] = [startPointIndex];
    const parents: Parent = {[endPointIndex]: null};
    let cheapestVertexIndex: number = startPointIndex;
    while (!processed.includes(endPointIndex)) {
      this.dijkstraVertexMatrix[cheapestVertexIndex].graphs.forEach((graph: GraphRelation): void => {
        if (processed.includes(graph.vertexIndex)) {
          return;
        }
        const parenCost: number = costs[`${cheapestVertexIndex}`];
        const childCost: number = graph.cost + parenCost;
        console.log(`parenCost, childCost`, parenCost, childCost);

        if (Object.keys(costs).includes(`${graph.vertexIndex}`)) {
          if (costs[`${graph.vertexIndex}`] > childCost) {
            costs[`${graph.vertexIndex}`] = childCost;
            parents[`${graph.vertexIndex}`] = cheapestVertexIndex;
          }
        } else {
          costs[`${graph.vertexIndex}`] = childCost;
          parents[`${graph.vertexIndex}`] = cheapestVertexIndex;
        }
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
    const shortestPathLine: Line[] = [];
    let actualIndexFromParents = endPointIndex;
    let currentStartPoint: Point;
    let currentEndPoint: Point = this.dijkstraVertexMatrix[endPointIndex].coordinates;
    while ( actualIndexFromParents !== startPointIndex) {
      actualIndexFromParents = parents[`${actualIndexFromParents}`];
      currentStartPoint = this.dijkstraVertexMatrix[actualIndexFromParents].coordinates;
      const line: Line = {
        startPoint: currentStartPoint,
        endPoint: currentEndPoint
      };
      shortestPathLine.push(line);
      currentEndPoint = currentStartPoint;
    }
    return shortestPathLine;
  }


  private updateVertexMatrix(vertexIndexToUpdate: number, relatedVertexIndex: number, cost: number): void {
    const foundVertex: GraphRelation = this.dijkstraVertexMatrix[vertexIndexToUpdate].graphs.find((relation: GraphRelation): boolean => {
      return relatedVertexIndex === relation.vertexIndex;
    });
    if (!!foundVertex) {
      return;
    }
    this.dijkstraVertexMatrix[vertexIndexToUpdate].graphs.push({
      vertexIndex: relatedVertexIndex,
      cost: cost
    });
  }

  private addNewVertex (coordinates: Point): number {
    this.dijkstraVertexMatrix.push({
      coordinates: coordinates,
      graphs: []
    });
    return this.dijkstraVertexMatrix.length - 1;
  }

  private appendToVertexMatrix(line: Line): void {
    if (line.startPoint.x === line.endPoint.x && line.startPoint.y === line.endPoint.y) {
      return;
    }
    let startVertexIndex: number = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === line.startPoint.x && vertex.coordinates.y === line.startPoint.y;
    });
    let endVertexIndex: number = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
      return vertex.coordinates.x === line.endPoint.x && vertex.coordinates.y === line.endPoint.y;
    });
    if (startVertexIndex === -1) {
      startVertexIndex = this.addNewVertex(line.startPoint);
    }
    if (endVertexIndex === -1) {
      endVertexIndex = this.addNewVertex(line.endPoint);
    }
    const cost: number = Geometry.getDistanceBetweenTwoPoints(line.startPoint, line.endPoint);
    this.updateVertexMatrix(startVertexIndex, endVertexIndex, cost);
    this.updateVertexMatrix(endVertexIndex, startVertexIndex, cost);
  }

  private createDijkstraVertexMatrix() {
    this.lines.forEach((line: Line): void => {
      this.appendToVertexMatrix(line);
    });
  }

}
