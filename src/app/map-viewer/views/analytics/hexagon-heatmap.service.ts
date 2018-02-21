import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import {Point} from '../../../map-editor/map.type';
import {HexHeatElement, Margin} from './analytics.type';
import {CoordinatesSocketData} from '../../publication.type';


export class HexagonHeatMap {
  private strokeWidth: number = 1;
  private maxOpacity: number  = 0.6;
  private temperatureTimeStepForHeating: number;
  private temperatureTimeStepForCooling: number;
  private transitionTime: number = 1000;
  private points: Array<[number, number]> = [];
  private hexGridTable: Array<HexHeatElement> = [];
  private svg: d3.selection;
  private hexMap: d3.selection;
  private margin: Margin;

  constructor(private width: number,
              private height: number,
              private hexRadius: number,
              private heatColors: string[]) {
    this.width = width;
    this.height = height;
    this.hexRadius = hexRadius;
    this.heatColors = heatColors;
    this.margin = {left: hexRadius, top: hexRadius, right: hexRadius, bottom: hexRadius};
    this.calculatePoints();
  }

  create(id: string): void {

    this.svg = d3.select(`#${id}`).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'hexagon-heatmap')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  }

  eraseHeatMap (tagShortId?: number): void {
    if (!!tagShortId) {
      const hexagons = this.svg.selectAll('.hexagon').nodes();
      hexagons.forEach((hex: d3.selection): void => {
        const hexagon = d3.select(hex);
        if (Number.parseInt(hexagon.attr('tagShortId'), 10) === tagShortId) {
          const parent = d3.select(hex.parentNode);
          parent.remove();
          const index = this.hexGridTable.findIndex((hexHeatElement: HexHeatElement): boolean => {
            return hexHeatElement.element === hex;
          });
          this.hexGridTable.splice(index, 1);
        }
      });
    } else {
      this.svg.selectAll('g').remove();
      this.hexGridTable = [];
    }
  }

  feedWithCoordinates(data: CoordinatesSocketData): void {
    this.fireHeatAtLocation(this.findHex(data), data);
  }

  set temperatureTimeIntervalForHeating(value) {
    this.temperatureTimeStepForHeating = value;
  }

  set temperatureTimeIntervalForCooling(value) {
    this.temperatureTimeStepForCooling = value;
  }

  private coolDownActiveHexes(timeNow: number): void {
    const hexagons = this.svg.selectAll('.hexagon').nodes();
    hexagons.forEach((hex: d3.selection): void => {
      const hexagon = d3.select(hex);
      const lastTimeHexagonGetHeated = Number.parseInt(hexagon.attr('heated'));
      if (timeNow - lastTimeHexagonGetHeated > this.temperatureTimeStepForCooling) {
        let heat = Number.parseInt(hexagon.attr('heat'));
        if (heat > 0) {
          --heat;
          const color = this.heatColors[heat];
          hexagon.attr('heat', heat)
            .transition()
            .duration(this.transitionTime)
            .attr('heated', timeNow.toString())
            .style('fill', () => color)
            .attr('stroke', () => color);
        } else {
          const parent = d3.select(hex.parentNode);
          parent.remove();
          const index = this.hexGridTable.findIndex((hexHeatElement: HexHeatElement): boolean => {
            return hexHeatElement.element === hex;
          });
          this.hexGridTable.splice(index, 1);
        }
      }
    });
  }

  private fireHeatAtLocation (hex: HexHeatElement, data: CoordinatesSocketData): void {
    const timeNow = Date.now();
    this.coolDownActiveHexes(timeNow);
    if (!!hex) {
    const hexagon = d3.select(hex.element);
      let heat = Number.parseInt(hexagon.attr('heat'));
      const lastTimeHexagonGetHeated = Number.parseInt(hexagon.attr('heated'));
      if ((heat < 5) && (timeNow - lastTimeHexagonGetHeated > this.temperatureTimeStepForHeating)) {
        heat++;
      }
      const color = this.heatColors[heat];

      hexagon
        .transition()
        .duration(this.transitionTime)
        .attr('heat', heat)
        .attr('heated', timeNow.toString())
        .style('fill', () => color)
        .attr('stroke', () => color);
    } else {
      this.createNewHexagon(data, timeNow);
    }
  }

  private  createNewHexagon (data: CoordinatesSocketData, timeNow: number): void {
    const hexbin = d3Hexbin.hexbin().radius(this.hexRadius);
    const coordinates: Point = data.coordinates.point;
    const hexPoint =  this.points.find((point: [number, number]): boolean => point[0] > coordinates.x && point[1] > coordinates.y);

    this.hexMap = this.svg.append('g')
      .selectAll('.hexagon')
      .data(hexbin([hexPoint]))
      .enter().append('path')
      .attr('class', 'hexagon')
      .attr('d', (d, index, nodes) => {
        this.hexGridTable.push({x: d.x, y: d.y, element: nodes[index], tagShortId: data.coordinates.tagShortId});
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

  private findHex (data: CoordinatesSocketData): HexHeatElement {
    // hexagon shape builds grid that has different distance between hexes in x and y direction
    // which gives for x direction deference equal to radius of circle overwritten on hexagon,
    // and in y direction deference equal to sqrt from 3 times radius of circle overwritten on hexagon.
    const coordinates: Point = data.coordinates.point;
    return this.hexGridTable.find((hexHeatElement: HexHeatElement): boolean =>
      hexHeatElement.x > coordinates.x &&
      hexHeatElement.y > coordinates.y &&
      hexHeatElement.x < coordinates.x + this.hexRadius &&
      hexHeatElement.y < coordinates.y + Math.sqrt(3) * this.hexRadius &&
      hexHeatElement.tagShortId === data.coordinates.tagShortId
    );
  };

  private calculateMap(): number[] {
    const mapColumns = Math.ceil(this.width / (this.hexRadius * 1.5));
    const mapRows = Math.ceil(this.height / (this.hexRadius * 1.5));
    return [mapColumns, mapRows];
  }

  private calculatePoints(): void {
    for (let i = 0; i < this.calculateMap()[1]; i++) {
      for (let j = 0; j < this.calculateMap()[0]; j++) {
        this.points.push([this.hexRadius * j * 1.5, this.hexRadius * i * 1.5]);
      }
    }
  }

}
