import {Component, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import * as d3 from 'd3';
import {Point} from '../../../map.type';
import {DrawBuilder, GroupCreated} from '../../../../map-viewer/published.builder';
import {Area} from '../../../../shared/services/area/area.type';
import {MapSvg} from '../../../../map/map.type';

@Component({
  selector: 'app-area',
  templateUrl: './area.html'
})
export class AreaComponent implements Tool, OnInit {
  private static CIRCLE_R: number = 5;

  active: boolean;
  private firstPoint: Point;
  private lastPoint: Point;
  private currentLine: d3.selection;
  private currentAreaGroup: GroupCreated;

  private container: d3.selection;
  private layer: d3.selection;
  private areas: Area[] = [];

  private static calculateCoordinates(coordinates: number[]): Point {
    // TODO change to zoom service method that will calculate it
    const transformation = d3.zoomTransform(document.getElementById('map-upper-layer'));
    coordinates[0] = coordinates[0] - transformation.x;
    coordinates[1] = coordinates[1] - transformation.y;

    return <Point> {
      x: coordinates[0],
      y: coordinates[1]
    };
  }

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService) {
  }

  ngOnInit(): void {
    this.mapLoaderInformer.loadCompleted().subscribe((mapSvg: MapSvg) => {
      this.container = mapSvg.container;
      this.layer = mapSvg.layer;
      this.currentAreaGroup = this.createBuilder().createGroup();
    });
  }

  getHintMessage(): string {
    return 'hint message';
  }

  getToolName(): ToolName {
    return ToolName.AREA;
  }

  setActive(): void {
    this.active = true;

    this.layer.on('click', (_, i: number, nodes: d3.selection[]) => {
      console.log('click');
      const coordinates: Point = AreaComponent.calculateCoordinates(d3.mouse(nodes[i]));
      this.handleMouseClick({x: coordinates.x, y: coordinates.y});
    });

    this.layer.on('mousemove', (_, i: number, nodes: d3.selection[]) => {
      if (!!this.firstPoint) {
        const coordinates: Point = AreaComponent.calculateCoordinates(d3.mouse(nodes[i]));
        this.currentLine
          .attr('x2', coordinates.x)
          .attr('y2', coordinates.y);
      }
    });

    // TODO
    // this.layer.on('dblclick', () => {
    //   console.log('dblclick');
    //   this.layer.on('mousemove', null);
    // });
  }

  setInactive(): void {
    this.active = false;

    this.layer.on('click', null);
    // TODO
    // this.layer.on('dblclick', null);
    this.layer.on('mousemove', null);
    this.currentAreaGroup.group.selectAll('circle')
      .on('click', null);
    this.firstPoint = null;
    this.lastPoint = null;
    this.currentLine = null;
    this.currentAreaGroup = null;
  }

  activate(): void {
    this.toolbarService.emitToolChanged(this);
  }

  deactivate(): void {
    console.log('deactivate');
    this.toolbarService.emitToolChanged(null);
  }

  private handleMouseClick(point: Point): void {
    if (!this.firstPoint) {
      this.firstPoint = point;
    }
    this.lastPoint = point;
    this.drawPoint(point);
    this.drawLine();
  }

  private drawPoint(point: Point): void {
    this.currentAreaGroup
      .addCircle(point, AreaComponent.CIRCLE_R);

    this.currentAreaGroup.group.selectAll('circle')
      .on('click', (_, i: number, nodes: d3.selection[]) => {
        d3.event.stopPropagation();
        console.log('cirlce clicked');
        this.layer.on('mousemove', null);
        // this.deactivate();
      });
  }

  private drawLine() {
    this.currentLine =
      this.currentAreaGroup
        .group
        .append('line')
        .attr('x1', this.lastPoint.x)
        .attr('y1', this.lastPoint.y)
        .attr('x2', this.lastPoint.x)
        .attr('y2', this.lastPoint.y)
        .attr('stroke-width', 1)
        .attr('stroke', 'black');
  }

  private createBuilder(): DrawBuilder {
    return new DrawBuilder(this.container, {
      id: `area-${this.areas.length}`,
      clazz: 'area'
    });
  }

}
