import * as d3 from 'd3';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {SvgGroupWrapper} from '../../drawing.builder';
import {ZoomService} from '../../../../services/zoom/zoom.service';


export class Draggable {
  public container: d3.selection;
  public group: d3.selection;
  private isDraggedNow: boolean;
  private draggedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  protected dragBehavior: d3.drag;
  protected mapAttributes: { width: number, height: number };

  constructor(groupCreated: SvgGroupWrapper,
              protected zoomService: ZoomService) {
    this.group = groupCreated.group;
    this.container = groupCreated.container.select('image');
    this.mapAttributes = {width: this.container.attr('width'), height: this.container.attr('height')};
  }

  public dragOn(): void {
    this.dragBehavior = d3.drag()
      .on('start.draggable', () => {
        event.stopPropagation();
      })
      .on('drag.draggable', () => {
        this.isDraggedNow = true;
        this.dragGroupBehavior();
      })
      .on('end.draggable', () => {
        if (this.isDraggedNow) {
          this.updateConfiguration();
          this.isDraggedNow = !this.isDraggedNow;
        }
        event.stopPropagation();
      });
    this.group.select('.pointer').attr('stroke', 'red');
    this.group.style('cursor', 'move');
    this.group.call(this.dragBehavior);
  }

  public dragOff(): void {
    this.group.on('.drag', null);
    this.group.select('.pointer').attr('stroke', 'black');
    this.group.style('cursor', 'pointer');
  }

  public afterDragEvent(): Observable<d3.selection> {
    return this.draggedEmitter.asObservable();
  }

  private updateConfiguration(): void {
    this.draggedEmitter.next(this.group);
  }

  private dragGroupBehavior(): void {
    let newX = parseInt(this.group.attr('x'), 10);
    let newY = parseInt(this.group.attr('y'), 10);
    newX += d3.event.dx;
    newY += d3.event.dy;
    const xAtMap = Math.max(0, Math.min(this.mapAttributes.width, newX));
    const yAtMap = Math.max(0, Math.min(this.mapAttributes.height, newY));
    this.group
      .attr('x', xAtMap)
      .attr('y', yAtMap);
  }
}
