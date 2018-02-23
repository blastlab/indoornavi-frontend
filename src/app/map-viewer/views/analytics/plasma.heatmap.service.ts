import { Injectable } from '@angular/core';
import {HexagonalHeatMap} from './hexagonal.heatmap.service';
import {Point} from '../../../map-editor/map.type';
import {HeatPoint} from './analytics.type';
import {CoordinatesSocketData} from '../../publication.type';

@Injectable()
export class PlasmaHeatMap extends HexagonalHeatMap {
  protected svgId: string = 'plasma-heatmap';
  protected heatElementClazz = 'pixel';

  constructor(width, height, heatPointSize, heatColors) {
    super(width, height, heatPointSize, heatColors);
    this.calculatePlasmaPoints();
  }

  protected calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / this.heatPointSize);
    const mapRows = Math.ceil(this.height / this.heatPointSize );
    return [mapColumns, mapRows];
  }

  private calculatePlasmaPoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push([this.heatPointSize * j, this.heatPointSize * i]);
      }
    }
  }

  protected findHex (data: CoordinatesSocketData): HeatPoint {
    const coordinates: Point = data.coordinates.point;
    return this.gridTable.find((hexHeatElement: HeatPoint): boolean =>
      hexHeatElement.x > coordinates.x &&
      hexHeatElement.y > coordinates.y &&
      hexHeatElement.x < coordinates.x + this.heatPointSize &&
      hexHeatElement.y < coordinates.y + this.heatPointSize &&
      hexHeatElement.tagShortId === data.coordinates.tagShortId
    );
  }

  protected createNewHeatPoint (data: CoordinatesSocketData, timeNow: number): void {
    const coordinates: Point = data.coordinates.point;
    const plasmaPoint: [number, number] =  this.points.find((point: [number, number]): boolean => point[0] > coordinates.x && point[1] > coordinates.y);

    this.heatMap = this.svg.append('g')
      .selectAll(`.${this.heatElementClazz}`)
      .data([plasmaPoint])
      .enter().append('rect')
      .attr('x', d => d[0])
      .attr('y', d => d[1])
      .attr('width', this.heatPointSize)
      .attr('height', this.heatPointSize)
      .attr('class', this.heatElementClazz)
      .attr('d', (d, index, nodes) => {
        this.gridTable.push({x: d[0], y: d[1], element: nodes[index], tagShortId: data.coordinates.tagShortId});
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

}
