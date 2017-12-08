import * as d3 from 'd3';
import {GroupCreated} from './draw.builder';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private deselectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private hasBorder: boolean;


  constructor(private group: GroupCreated) {
  }

  private emitSelectedEvent() {
    this.selectedEmitter.next(this.group.domGroup);
  }

  private emitDeselectedEvent() {
    this.deselectedEmitter.next(this.group.domGroup);
  }

  public onSelected(): Observable<d3.selection> {
    return this.selectedEmitter.asObservable();
  }

  public onDeselected(): Observable<d3.selection> {
    return this.deselectedEmitter.asObservable();
  }

  public select() {
    // this.group.domGroup.classed('selected', true);
    this.emitSelectedEvent();
    this.createBorderBox();
    // this.selectOff();
  }

  public deselect() {
    this.removeBorderBox();
    // this.group.domGroup.classed('selected', false);
    this.emitDeselectedEvent();
  }

  public selectOn() {
    this.group.domGroup.on('click.select', () => {
      this.select();
    });
  }

  public selectOff() {
    this.group.domGroup.on('.click.select', null);
  }

  private createBorderBox() {
    this.removeBorderBox();
    this.group.addBorderBox();
    this.hasBorder = true;
  }

  private removeBorderBox() {
    if (this.hasBorder) {
      this.group.removeBorderBox();
      this.hasBorder = false;
    }
  }
}
