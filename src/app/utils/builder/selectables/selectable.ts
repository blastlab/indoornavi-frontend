import * as d3 from 'd3';
import {GroupCreated} from '../draw.builder';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private deselectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private lockHovering: boolean;


  constructor(protected group: GroupCreated) {
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
    this.emitSelectedEvent();
  }

  public deselect() {
    this.emitDeselectedEvent();
  }

  public handleHovering() {
    this.lockHovering = false;
    const onMouseEnterListener = this.group.domGroup.on('mouseenter');
    const onMouseLeaveListener = this.group.domGroup.on('mouseleave');
    if (onMouseEnterListener === undefined) {
      this.group.domGroup.on('mouseenter', () => {
        if (!this.lockHovering) {
          this.group.changeColor('red');
        }
      });
    } else {
        this.group.domGroup.on('mouseenter', () => {
          if (!this.lockHovering) {
            this.group.changeColor('red');
          }
          onMouseEnterListener();
        });
    }
    if (onMouseLeaveListener === undefined) {
        this.group.domGroup.on('mouseleave', () => {
          if (!this.lockHovering) {
            this.group.resetColor();
          }
        });
    } else {
        this.group.domGroup.on('mouseleave', () => {
          if (!this.lockHovering) {
            this.group.resetColor();
          }
          onMouseLeaveListener();
        });
    }
  }

  public selectOn() {
    this.group.domGroup.on('click.select', () => {
      this.select();
      event.stopPropagation();
    });
    this.handleHovering();
  }

  public selectOff() {
    this.group.domGroup.on('click.select', null);
    this.lockHovering = true;
    console.log(this.group.domGroup);
  }
}
