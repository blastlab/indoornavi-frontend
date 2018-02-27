import { Injectable } from '@angular/core';
import {HexagonalHeatMap} from './hexagonal.heatmap.service';
import {Point} from '../../../map-editor/map.type';
import {HeatPoint} from './analytics.type';
import {CoordinatesSocketData} from '../../publication.type';

@Injectable()
export class PlasmaHeatMap extends HexagonalHeatMap {
  protected svgId: string = 'plasma-heatmap';
  protected heatElementClazz = 'pixel';
  private squareGridSize: number = 3;
  private transformDistance: number;

  constructor(width, height, heatPointSize, heatColors) {
    super(width, height, heatPointSize, heatColors);
    this.calculatePlasmaPoints();
    this.calculatePlasmaParameters();
  }

  protected calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / this.heatPointSize);
    const mapRows = Math.ceil(this.height / this.heatPointSize );
    return [mapColumns, mapRows];
  }

  private calculatePlasmaParameters(): void {
    this.transformDistance = ((this.squareGridSize - 1) / 2 * this.heatPointSize + this.heatPointSize);
}

  private calculatePlasmaPoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push({x: this.heatPointSize * j, y: this.heatPointSize * i});
      }
    }
  }

  protected createNewHeatPoint (data: CoordinatesSocketData, timeNow: number): void {
    this.shapeStartPoint = this.findShapeStartPoint(data.coordinates.point);

    this.heatMap = this.svg.append('g')
      .selectAll(`.${this.heatElementClazz}`)
      .data([[this.shapeStartPoint.x, this.shapeStartPoint.y]])
      .enter().append('rect')
      .attr('x', d => d[0])
      .attr('y', d => d[1])
      .attr('width', this.heatPointSize)
      .attr('height', this.heatPointSize)
      .attr('class', this.heatElementClazz)
      .attr('d', (d, index, nodes) => {
        this.gridTable.push({
          x: this.shapeStartPoint.x,
          y: this.shapeStartPoint.y,
          element: nodes[index], tagShortId: data.coordinates.tagShortId});
      })
      .attr('tagShortId', data.coordinates.tagShortId.toString())
      .attr('heat', 0)
      .attr('heated', timeNow.toString())
      .attr('stroke', this.heatColors[0])
      .style('stroke-opacity', this.maxOpacity)
      .attr('stroke-width', `${this.strokeWidth}px`)
      .style('fill', this.heatColors[0])
      .style('fill-opacity', this.maxOpacity);
  }

  protected addRelationWithSurrounding(data: CoordinatesSocketData, time: number): void {
    this.distributePlasmaOnHeatMapGrid(data, time);
  }

  private distributePlasmaOnHeatMapGrid(data: CoordinatesSocketData, time: number): void {
    this.shapeStartPoint = this.findShapeStartPoint(data.coordinates.point);
    const firstPixelCoordinates: Point = {
      x: this.shapeStartPoint.x -  this.transformDistance,
      y: this.shapeStartPoint.y - this.transformDistance
    };
    // i and j are corresponding to unit vectors in plasma grid.
    // Below loops will iterate through every pixel in the plasma activation grid to display each heat point that this.plasmaRadius allows to reach.
    for (let i = 0; i < this.squareGridSize; i++) {
      data.coordinates.point.x = firstPixelCoordinates.x + (this.heatPointSize * i);
      for (let j = 0; j < this.squareGridSize; j++) {
        data.coordinates.point.y = firstPixelCoordinates.y + (this.heatPointSize * j);
        this.fireHeatAtLocation(this.findHeatPint(data), data, time);
      }
    }
  }


}
