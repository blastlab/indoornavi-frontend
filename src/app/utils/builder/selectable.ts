import * as d3 from 'd3';
import {GroupCreated} from './draw.builder';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private deselectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();


  constructor(private group: GroupCreated) {
    this.group.domGroup.on('click', () => {
      console.log(this.group.domGroup);
      this.select();
    });

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
    this.group.domGroup.classed('selected', true);
    this.emitSelectedEvent();
  }

  public deselect() {
    this.group.domGroup.classed('selected', false);
    this.emitDeselectedEvent();
  }

}
