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
    ])
  ]
})
export class ToolDetailsComponent {

  state: string = 'close';
  @Output() onHide: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  show(): void {
    this.state = 'open';
  }

  hide(): void {
    this.state = 'close';
  }

  emitOnHide(): void {
    this.onHide.next();
  }

}
