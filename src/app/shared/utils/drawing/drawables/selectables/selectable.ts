import * as d3 from 'd3';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {SvgGroupWrapper} from 'app/shared/utils/drawing/drawing.builder';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private lockedSelecting: boolean;


  constructor(protected group: SvgGroupWrapper) {
  }

  emitSelectedEvent(): void {
    this.selectedEmitter.next(this.group.getGroup());
  }

  onSelected(): Observable<d3.selection> {
    return this.selectedEmitter.asObservable();
  }

  select(): void {
    this.emitSelectedEvent();
  }

  handleHovering(): void {
    this.unlockHovering();
    const onMouseEnterListener: d3.selection = this.group.getGroup().on('mouseenter');
    const onMouseLeaveListener:  d3.selection = this.group.getGroup().on('mouseleave');
    if (onMouseEnterListener === undefined) {
      this.group.getGroup().on('mouseenter', () => {
        this.highlightSet();
      });
    } else {
        this.group.getGroup().on('mouseenter', () => {
          this.highlightSet();
          onMouseEnterListener();
        });
    }
    if (onMouseLeaveListener === undefined) {
        this.group.getGroup().on('mouseleave', () => {
          this.highlightReset();
        });
    } else {
        this.group.getGroup().on('mouseleave', () => {
          this.highlightReset();
          onMouseLeaveListener();
        });
    }
  }

  selectOn(): void {
    this.group.getGroup().on('click.select', () => {
      this.select();
      event.stopPropagation();
    });
    this.handleHovering();
  }

  lockHovering(): void {
    this.lockedSelecting = true;
  }

  unlockHovering(): void {
    this.lockedSelecting = false;
  }

  selectOff(): void {
    this.group.getGroup().on('click.select', null);
    this.lockHovering();
  }

  highlightSet(color?: string): void {
    const setColor: string = (color) ? color : 'red';
    if (!this.lockedSelecting) {
      this.group.showTexts();
      this.group.changeColor(setColor);
    }
  }

  highlightReset(): void {
    if (!this.lockedSelecting) {
      this.group.hideTexts();
      this.group.resetColor();
    }
  }

}
