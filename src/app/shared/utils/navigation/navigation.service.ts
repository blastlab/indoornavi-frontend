import {Geometry} from '../helper/geometry';
import {Line, Point} from '../../../map-editor/map.type';
import {Costs, GraphRelation, Parents, Vertex} from './navigation.types';

export class NavigationService {

  private lines: Line[];
  private dijkstraVertexMatrix: Vertex[] = [];
  private startPointIndex: number;
  private endPointIndex: number;
  private costs: Costs;
  private processed: number[];
  private parents: Parents;
  private cheapestVertexIndex: number;

  constructor() {}

  calculateDijkstraShortestPath(lines: Line[], start: Point, finish: Point): Line[] {
    this.lines = lines;
    this.calculateGraphWithPathParameters(start, finish);
    this.searchForShortestPathInGraph();
    return this.composeLinesFromParentsSchema();
  }

  private calculateGraphWithPathParameters(start, finish): void {
    if (!this.lines.length) {
      return;
    }
    const startPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(this.lines, start);
    const endPointCoordinatesOnLines: Point = Geometry.pickClosestNodeCoordinates(this.lines, finish);
    const isSamePoint: boolean = startPointCoordinatesOnLines.x === endPointCoordinatesOnLines.x && startPointCoordinatesOnLines.y === endPointCoordinatesOnLines.y;
    if (isSamePoint) {
      return;
    } else {
      this.createDijkstraVertexMatrix();
      this.startPointIndex = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
        return vertex.coordinates.x === startPointCoordinatesOnLines.x && vertex.coordinates.y === startPointCoordinatesOnLines.y;
      });
      this.endPointIndex = this.dijkstraVertexMatrix.findIndex((vertex: Vertex): boolean => {
        return vertex.coordinates.x === endPointCoordinatesOnLines.x && vertex.coordinates.y === endPointCoordinatesOnLines.y;
      });
      this.costs = {
        [this.startPointIndex]: 0,
        [this.endPointIndex]: Infinity
      };
      this.processed = [this.startPointIndex];
      this.parents = {[this.endPointIndex]: null};
      this.cheapestVertexIndex = this.startPointIndex;
    }
  }

  private updateVertexMatrix(vertexIndexToUpdate: number, relatedVertexIndex: number, cost: number): void {
    const foundVertex: GraphRelation = this.dijkstraVertexMatrix[vertexIndexToUpdate]
      .graphs.find((relation: GraphRelation): boolean => {
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

  private addNewVertex(coordinates: Point): number {
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

  private searchForShortestPathInGraph(): void {
    if (this.cheapestVertexIndex == null) {
      return;
    }
    while (this.processed.indexOf(this.endPointIndex) < 0) {
      this.dijkstraVertexMatrix[this.cheapestVertexIndex].graphs.forEach((graph: GraphRelation): void => {
        if (this.processed.indexOf(graph.vertexIndex) > -1) {
          return;
        }
        const parenCost: number = this.costs[`${this.cheapestVertexIndex}`];
        const childCost: number = graph.cost + parenCost;
        if (Object.keys(this.costs).indexOf(`${graph.vertexIndex}`) > -1) {
          if (this.costs[`${graph.vertexIndex}`] > childCost) {
            this.costs[`${graph.vertexIndex}`] = childCost;
            this.parents[`${graph.vertexIndex}`] = this.cheapestVertexIndex;
          }
        } else {
          this.costs[`${graph.vertexIndex}`] = childCost;
          this.parents[`${graph.vertexIndex}`] = this.cheapestVertexIndex;
        }
      });
      let minCost = Infinity;
      let minValueIndex: number;
      for (const key of Object.keys(this.costs)) {
        const keyAsNumber = parseInt(key, 10);
        if (this.processed.indexOf(keyAsNumber) < 0) {
          if (minCost > this.costs[key]) {
            minCost = this.costs[key];
            minValueIndex = keyAsNumber;
          }
        }
      }
      this.cheapestVertexIndex = minValueIndex;
      this.processed.push(this.cheapestVertexIndex);
    }
  }

  private composeLinesFromParentsSchema(): Line[] {
    if (!this.cheapestVertexIndex) {
      return [];
    }
    const shortestPathLine: Line[] = [];
    let actualIndexFromParents = this.endPointIndex;
    let currentStartPoint: Point;
    let currentEndPoint: Point = this.dijkstraVertexMatrix[this.endPointIndex].coordinates;
    while ( actualIndexFromParents !== this.startPointIndex) {
      actualIndexFromParents = this.parents[`${actualIndexFromParents}`];
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

}
