import {Injectable} from '@angular/core';
import {HexagonalHeatMap} from './hexagonal.heatmap.service';
import {Point} from '../../../map-editor/map.type';
import {Coordinates} from '../../publication.type';

@Injectable()
export class PixelHeatMap extends HexagonalHeatMap {
  protected heatElementClazz = 'pixel';
  private squareGridSize: number = 3;
  private transformDistance: number;
  private pixelPoints: Point[] = [];

  constructor(protected width: number,
              protected height: number,
              protected heatPointSize: number,
              protected heatColors: string[]) {
    super(width, height, heatPointSize, heatColors);
    this.calculatePixelPoints();
    this.calculatePlasmaParameters();
    this.setSvgId('pixel-heatmap');
  }

  protected calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / this.heatPointSize);
    const mapRows = Math.ceil(this.height / this.heatPointSize );
    return [mapColumns, mapRows];
  }

  protected findShapeStartPoint(coordinates: Point): Point {
    return this.pixelPoints.find((point: Point): boolean => point.x > coordinates.x && point.y > coordinates.y);
  }

  private calculatePlasmaParameters(): void {
    this.transformDistance = ((this.squareGridSize - 1) / 2 * this.heatPointSize + this.heatPointSize);
  }

  protected createNewHeatPoint (data: Coordinates, timeNow: number): void {
    this.shapeStartPoint = this.findShapeStartPoint(data.point);
    if (!!this.shapeStartPoint) {
      this.heatMap = this.svg
        .append('rect')
        .datum([[this.shapeStartPoint.x, this.shapeStartPoint.y]][0])
        .attr('x', d => d[0])
        .attr('y', d => d[1])
        .attr('width', this.heatPointSize)
        .attr('height', this.heatPointSize)
        .attr('class', this.heatElementClazz)
        .attr('d', (d, index, nodes) => {
          this.gridTable.push({
            x: this.shapeStartPoint.x,
            y: this.shapeStartPoint.y,
            element: nodes[index], tagShortId: data.tagShortId,
            heat: 0,
            timeHeated: timeNow
          });
        })
        .attr('tagShortId', data.tagShortId.toString())
        .attr('stroke', this.heatColors[0])
        .style('stroke-opacity', this.maxOpacity)
        .attr('stroke-width', `${this.strokeWidth}px`)
        .style('fill', this.heatColors[0])
        .style('fill-opacity', this.maxOpacity);
    }
  }

  protected addRelationWithSurrounding(data: Coordinates, time: number): void {
    this.distributePlasmaOnHeatMapGrid(data, time);
  }

  private setSvgId(id: string) {
    this.svgId = id;
  }

  private calculatePixelPoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.pixelPoints.push({x: this.heatPointSize * j, y: this.heatPointSize * i});
      }
    }
  }

  private distributePlasmaOnHeatMapGrid(data: Coordinates, time: number): void {
    this.shapeStartPoint = this.findShapeStartPoint(data.point);
    if (!!this.shapeStartPoint) {
      const firstPixelCoordinates: Point = {
        x: this.shapeStartPoint.x -  this.transformDistance,
        y: this.shapeStartPoint.y - this.transformDistance
      };
      for (let i = 0; i < this.squareGridSize; i++) {
        data.point.x = firstPixelCoordinates.x + (this.heatPointSize * i);
        for (let j = 0; j < this.squareGridSize; j++) {
          data.point.y = firstPixelCoordinates.y + (this.heatPointSize * j);
          this.fireHeatAtLocation(this.findHeatPoint(data), data, time);
        }
      }
    }
  }
}
