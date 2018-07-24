import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {contentContainerAnimation, minimizeContainerAnimation} from './animations/tool-details.animation';

@Component({
  selector: 'app-tool-details',
  templateUrl: './tool-details.html',
  styleUrls: ['./tool-details.css'],
  animations: [
    trigger('toggleDetails', [
      state('open', style({
        transform: 'translateY(0)'
      })),
      state('close', style({
        transform: 'translateY(-100%)'
      })),
      transition('close <=> open', animate(300))
    ]),
    contentContainerAnimation,
    minimizeContainerAnimation
  ]
})
export class ToolDetailsComponent {

  state: string = 'close';
  contentContainerState: string = 'maximized';
  minimizeContainerState: string = 'maximized';
  @Output() onHide: EventEmitter<any> = new EventEmitter();
  @ViewChild('minimizeContainer') minimizeContainer: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  width: number = 0;
  height: number = 0;

  private buttonWidthAndPadding = 40;

  constructor(private cd: ChangeDetectorRef) {
  }

  show(): void {
    this.width = this.minimizeContainer.nativeElement.getBoundingClientRect().width - this.buttonWidthAndPadding;
    this.height = this.minimizeContainer.nativeElement.getBoundingClientRect().height + this.contentContainer.nativeElement.getBoundingClientRect().height;
    this.cd.detectChanges();
    this.state = 'open';
  }

  hide(): void {
    this.state = 'close';
  }

  toggleMinimized(): void {
    if (this.contentContainerState === 'maximized') {
      this.contentContainerState = 'minimized';
    } else {
      this.minimizeContainerState = 'maximized';
    }
  }

  contentContainerAnimationEnded(event: AnimationEvent): void {
    if (event.fromState === 'maximized' && event.toState === 'minimized') {
      this.minimizeContainerState = 'minimized';
    }
  }

  minimizeContainerAnimationEnded(event: AnimationEvent): void {
    if (event.fromState === 'minimized' && event.toState === 'maximized') {
      this.contentContainerState = 'maximized';
    }
  }

  emitOnHide(): void {
    this.onHide.next();
  }

}



