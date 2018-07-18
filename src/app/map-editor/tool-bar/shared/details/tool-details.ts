import {Component, EventEmitter, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
    trigger('toggleMinimizedTop', [
      state('maximized', style({
        transform: 'translateX(0)'
      })),
      state('minimized', style({
        transform: 'translateX(-92%)'
      })),
      transition('maximized <=> minimized', animate(800))
    ]),
    trigger('toggleMinimizedBottom', [
      state('maximized', style({
        transform: 'translateY(0)'
      })),
      state('minimized', style({
        transform: 'translateY(-180%)'
      })),
      transition('maximized <=> minimized', animate(800))
    ])
  ]
})
export class ToolDetailsComponent {

  state: string = 'close';
  minimizedState: string = 'maximized';
  @Output() onHide: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  show(): void {
    this.state = 'open';
  }

  hide(): void {
    this.state = 'close';
  }

  toggleMinimized(): void {
    this.minimizedState = this.minimizedState === 'minimized' ? 'maximized' : 'minimized';
    console.log('changing min state:');
    console.log(this.minimizedState);
  }

  emitOnHide(): void {
    this.onHide.next();
  }

}
