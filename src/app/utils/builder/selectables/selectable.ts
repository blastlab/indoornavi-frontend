import * as d3 from 'd3';
import {GroupCreated} from '../draw.builder';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private lockedSelecting: boolean;


  constructor(protected group: GroupCreated) {
  }

  private emitSelectedEvent(): void {
    this.selectedEmitter.next(this.group.domGroup);
  }

  public onSelected(): Observable<d3.selection> {
    return this.selectedEmitter.asObservable();
  }

  public select(): void {
    this.emitSelectedEvent();
  }

  public handleHovering(): void {
    this.lockedSelecting = false;
    const onMouseEnterListener = this.group.domGroup.on('mouseenter');
    const onMouseLeaveListener = this.group.domGroup.on('mouseleave');
    if (onMouseEnterListener === undefined) {
      this.group.domGroup.on('mouseenter', () => {
        this.colorSet();
      });
    } else {
        this.group.domGroup.on('mouseenter', () => {
          this.colorSet();
          onMouseEnterListener();
        });
    }
    if (onMouseLeaveListener === undefined) {
        this.group.domGroup.on('mouseleave', () => {
          this.colorReset();
        });
    } else {
        this.group.domGroup.on('mouseleave', () => {
          this.colorReset();
          onMouseLeaveListener();
        });
    }
  }

  public selectOn(): void {
    this.group.domGroup.on('click.select', () => {
      this.select();
      event.stopPropagation();
    });
    this.handleHovering();
  }

  public selectOff(): void {
    this.group.domGroup.on('click.select', null);
    this.lockedSelecting = true;
  }

  private colorSet(color?: string): void {
    const setColor = (color) ? color : 'red';
    if (!this.lockedSelecting) {
      this.group.changeColor(setColor);
      this.group.strokeConnectingLineBold();
    }
  }

  private colorReset(): void {
    if (!this.lockedSelecting) {
      this.group.resetColor();
      this.group.strokeConnectingLineNormal();
    }
  }

}
