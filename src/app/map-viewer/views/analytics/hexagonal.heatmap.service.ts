import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';
import {HeatPoint, Margin} from './analytics.type';
import {CoordinatesSocketData} from '../../publication.type';


export class HexagonalHeatMap {
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

  constructor(protected width: number,
              protected height: number,
              protected heatPointSize: number,
              protected heatColors: string[]) {
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

  eraseHeatMap (tagShortId?: number): void {
    if (!!tagShortId) {
      const nodes = this.svg.selectAll(`.${this.heatElementClazz}`).nodes();
      nodes.forEach((node: d3.selection): void => {
        const heatElement = d3.select(node);
        if (Number.parseInt(heatElement.attr('tagShortId'), 10) === tagShortId) {
          const parent = d3.select(node.parentNode);
          parent.remove();
          const index = this.gridTable.findIndex((heatPoint: HeatPoint): boolean => {
            return heatPoint.element === node;
          });
          this.gridTable.splice(index, 1);
        }
      });
    } else {
      this.svg.selectAll('g').remove();
      this.gridTable = [];
    }
  }

  feedWithCoordinates(data: CoordinatesSocketData, ): void {
    const timeNow = Date.now();
    this.fireHeatAtLocation(this.findHeatPint(data), data, timeNow);
    this.addRelationWithSurrounding(data, timeNow);
  }

  set temperatureTimeIntervalForHeating(value) {
    this.temperatureTimeStepForHeating = value;
  }

  set temperatureTimeIntervalForCooling(value) {
    this.temperatureTimeStepForCooling = value;
  }

  private coolDownActiveHeatPoints(timeNow: number): void {
    const nodes = this.svg.selectAll(`.${this.heatElementClazz}`).nodes();
    nodes.forEach((node: d3.selection): void => {
      const heatPointNode = d3.select(node);
      const lastTimeHexagonGetHeated = Number.parseInt(heatPointNode.attr('heated'));
      if (timeNow - lastTimeHexagonGetHeated > this.temperatureTimeStepForCooling) {
        let heat = Number.parseInt(heatPointNode.attr('heat'));
        if (heat > 0) {
          heat--;
          const color = this.heatColors[heat];
          heatPointNode
            .transition()
            .duration(this.transitionTime)
            .attr('heat', heat)
            .attr('heated', timeNow.toString())
            .style('fill', () => color)
            .attr('stroke', () => color);
        } else {
          const parent = d3.select(node.parentNode);
          parent.remove();
          const index = this.gridTable.findIndex((heatPoint: HeatPoint): boolean => {
            return heatPoint.element === node;
          });
          this.gridTable.splice(index, 1);
        }
      }
    });
  }

  protected fireHeatAtLocation (heatPoint: HeatPoint, data: CoordinatesSocketData, timeNow: number): void {
    if (!!heatPoint) {
      const element = d3.select(heatPoint.element);
      let heat = Number.parseInt(element.attr('heat'));
      const lastTimeHexagonGetHeated: number = Number.parseInt(element.attr('heated'));
      if ((heat < this.heatColors.length - 1) && (timeNow - lastTimeHexagonGetHeated > this.temperatureTimeStepForHeating)) {
        heat++;
        const color = this.heatColors[heat];
        element
          .transition()
          .duration(this.transitionTime)
          .attr('heat', heat)
          .attr('heated', timeNow.toString())
          .style('fill', () => color)
          .attr('stroke', () => color);
      }
    } else {
      this.createNewHeatPoint(data, timeNow);
    }
    this.coolDownActiveHeatPoints(timeNow);
  }

  protected createNewHeatPoint (data: CoordinatesSocketData, timeNow: number): void {
    const hexbin = d3Hexbin.hexbin().radius(this.heatPointSize);
    this.shapeStartPoint = this.findShapeStartPoint(data.coordinates.point);

    this.heatMap = this.svg.append('g')
      .selectAll(`.${this.heatElementClazz}`)
      .data(hexbin([[this.shapeStartPoint.x, this.shapeStartPoint.y]]))
      .enter().append('path')
      .attr('class', this.heatElementClazz)
      .attr('d', (d, index, nodes) => {
        this.gridTable.push({
          x: this.shapeStartPoint.x,
          y: this.shapeStartPoint.y,
          element: nodes[index], tagShortId: data.coordinates.tagShortId});
        return 'M' + d.x + ',' + d.y + hexbin.hexagon();
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

  protected findHeatPint (data: CoordinatesSocketData): HeatPoint {
    // hexagon shape builds grid that has different distance between hexes in x and y direction
    // which gives for x direction deference equal to radius of circle overwritten on hexagon,
    // and in y direction deference equal to sqrt from 3 times radius of circle overwritten on hexagon.
    const coordinates: Point = this.findShapeStartPoint(data.coordinates.point);
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

  protected addRelationWithSurrounding(data: CoordinatesSocketData, time: number): void {
  }

  private calculateHexPoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push({x: this.heatPointSize * j * 1.5, y: this.heatPointSize * i * 1.5});
      }
    }
  }


}
