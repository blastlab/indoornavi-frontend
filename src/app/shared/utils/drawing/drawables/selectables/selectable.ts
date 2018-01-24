import * as d3 from 'd3';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {SvgGroupWrapper} from 'app/shared/utils/drawing/drawing.builder';

export class Selectable {
  private selectedEmitter: Subject<d3.selection> = new Subject<d3.selection>();
  private lockedSelecting: boolean;


  constructor(protected group: SvgGroupWrapper) {
  }

  private emitSelectedEvent(): void {
    this.selectedEmitter.next(this.group.group);
  }

  public onSelected(): Observable<d3.selection> {
    return this.selectedEmitter.asObservable();
  }

  public select(): void {
    this.emitSelectedEvent();
  }

  public handleHovering(): void {
    this.unlockHovering();
    const onMouseEnterListener = this.group.group.on('mouseenter');
    const onMouseLeaveListener = this.group.group.on('mouseleave');
    if (onMouseEnterListener === undefined) {
      this.group.group.on('mouseenter', () => {
        this.highlightSet();
      });
    } else {
        this.group.group.on('mouseenter', () => {
          this.highlightSet();
          onMouseEnterListener();
        });
    }
    if (onMouseLeaveListener === undefined) {
        this.group.group.on('mouseleave', () => {
          this.highlightReset();
        });
    } else {
        this.group.group.on('mouseleave', () => {
          this.highlightReset();
          onMouseLeaveListener();
        });
    }
  }

  public selectOn(): void {
    this.group.group.on('click.select', () => {
      this.select();
      event.stopPropagation();
    });
    this.handleHovering();
  }

  public lockHovering(): void {
    this.lockedSelecting = true;
  }

  public unlockHovering(): void {
    this.lockedSelecting = false;
  }

  public selectOff(): void {
    this.group.group.on('click.select', null);
    this.lockHovering();
  }

  public highlightSet(color?: string): void {
    const setColor = (color) ? color : 'red';
    if (!this.lockedSelecting) {
      this.group.changeColor(setColor);
      this.group.strokeConnectingLineBold();
    }
  }

  public highlightReset(): void {
    if (!this.lockedSelecting) {
      this.group.resetColor();
      this.group.strokeConnectingLineNormal();
    }
  }

}
