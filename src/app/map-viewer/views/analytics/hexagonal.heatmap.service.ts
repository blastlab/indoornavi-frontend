import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';
import {HeatMap, HeatPoint, Margin} from './analytics.type';
import {Coordinates} from '../../publication.type';


export class HexagonalHeatMap implements HeatMap {
  protected svgId: string = 'hexagon-heatmap';
  protected heatElementClazz = 'hexagon';
  protected points: Point[] = [];
  protected gridTable: Array<HeatPoint> = [];
  protected heatMap: d3.selection;
  protected svg: d3.selection;
  protected strokeWidth: number = 1;
  protected maxOpacity: number  = 0.6;
  protected shapeStartPoint: Point;
  private temperatureTimeStepForHeating: number;
  private temperatureTimeStepForCooling: number;
  private transitionTime: number = 1000;
  private margin: Margin;

  constructor(
    protected width: number,
    protected height: number,
    protected heatPointSize: number,
    protected heatColors: string[]
  ) {
    this.margin = {left: heatPointSize, top: heatPointSize, right: heatPointSize, bottom: heatPointSize};
    this.calculateHexPoints();
  }

  create(id: string): void {
    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', this.svgId)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  erase (tagShortId?: number): void {
    if (!!tagShortId) {
      const indexesToDelete: number[] = [];
      this.gridTable.forEach((heatPoint: HeatPoint): void => {
        if (heatPoint.tagShortId === tagShortId) {
          indexesToDelete.push(this.gridTable.indexOf(heatPoint));
          d3.select(heatPoint.element).remove();
        }
      });
      indexesToDelete.sort((a: number, b: number): number => b - a);
      indexesToDelete.forEach(index => this.gridTable.splice(index, 1));
    } else {
      this.svg.selectAll(`.${this.heatElementClazz}`).remove();
      this.gridTable = [];
    }
  }

  feedWithCoordinates(data: Coordinates): void {
    const timeNow = Date.now();
    this.fireHeatAtLocation(this.findHeatPoint(data), data, timeNow);
    this.addRelationWithSurrounding(data, timeNow);
  }

  set temperatureTimeIntervalForHeating(value) {
    this.temperatureTimeStepForHeating = value;
  }

  set temperatureTimeIntervalForCooling(value) {
    this.temperatureTimeStepForCooling = value;
  }

  private coolDownActiveHeatPoints(coordinatesArrivalTime: number): void {
    this.gridTable.forEach((heatPoint: HeatPoint): void => {
      if (coordinatesArrivalTime - heatPoint.timeHeated > this.temperatureTimeStepForCooling) {
        if (heatPoint.heat > 0) {
          heatPoint.heat--;
          heatPoint.timeHeated = coordinatesArrivalTime;
          const color = this.heatColors[heatPoint.heat];
          const heatPointNode = d3.select(heatPoint.element);
          heatPointNode
            .transition()
            .duration(this.transitionTime)
            .style('fill', () => color)
            .attr('stroke', () => color);
        } else {
          const heatPointNode = d3.select(heatPoint.element);
          heatPointNode.remove();
          this.gridTable.splice(this.gridTable.indexOf(heatPoint), 1);
        }
      }
    });
  }

  protected fireHeatAtLocation (heatPoint: HeatPoint, data: Coordinates, coordinatesArrivalTime: number): void {
    if (!!heatPoint) {
      if ((heatPoint.heat < this.heatColors.length - 1) && (coordinatesArrivalTime - heatPoint.timeHeated > this.temperatureTimeStepForHeating)) {
        heatPoint.heat++;
        heatPoint.timeHeated = coordinatesArrivalTime;
        const color = this.heatColors[heatPoint.heat];
        const element = d3.select(heatPoint.element);
        element
          .transition()
          .duration(this.transitionTime)
          .style('fill', () => color)
          .attr('stroke', () => color);
      }
    } else {
      this.createNewHeatPoint(data, coordinatesArrivalTime);
    }
    this.coolDownActiveHeatPoints(coordinatesArrivalTime);
  }

  protected createNewHeatPoint (data: Coordinates, coordinatesArrivalTime: number): void {
    const hexbin = d3Hexbin.hexbin().radius(this.heatPointSize);
    this.shapeStartPoint = this.findShapeStartPoint(data.point);
    this.heatMap = this.svg
      .append('path')
      .datum(hexbin([[this.shapeStartPoint.x, this.shapeStartPoint.y]])[0])
      .attr('class', this.heatElementClazz)
      .attr('d', (d, index, nodes) => {
        this.gridTable.push({
          x: this.shapeStartPoint.x,
          y: this.shapeStartPoint.y,
          element: nodes[index], tagShortId: data.tagShortId,
          heat: 0,
          timeHeated: coordinatesArrivalTime
        });
        return 'M' + d.x + ',' + d.y + hexbin.hexagon();
      })
      .attr('tagShortId', data.tagShortId.toString())
      .attr('heat', 0)
      .attr('timeHeated', coordinatesArrivalTime.toString())
      .attr('stroke', this.heatColors[0])
      .style('stroke-opacity', this.maxOpacity)
      .attr('stroke-width', `${this.strokeWidth}px`)
      .style('fill', this.heatColors[0])
      .style('fill-opacity', this.maxOpacity);
  }

  protected findHeatPoint (data: Coordinates): HeatPoint {
    const coordinates: Point = this.findShapeStartPoint(data.point);
    return this.gridTable.find((hexHeatElement: HeatPoint): boolean =>
      coordinates.x === hexHeatElement.x &&
      coordinates.y === hexHeatElement.y
    );
  };

  protected calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / (this.heatPointSize * 1.5));
    const mapRows = Math.ceil(this.height / (this.heatPointSize * 1.5));
    return [mapColumns, mapRows];
  }

  protected findShapeStartPoint(coordinates: Point): Point {
    return this.points.find((point: Point): boolean => point.x > coordinates.x && point.y > coordinates.y);
  }

  protected addRelationWithSurrounding(data: Coordinates, time: number): void {
  }

  private calculateHexPoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push({x: this.heatPointSize * j * 1.5, y: this.heatPointSize * i * 1.5});
      }
    }
  }
}
