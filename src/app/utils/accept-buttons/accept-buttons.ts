import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Point} from '../../map/map.type';
import {AcceptButtons} from './accept-buttons.type';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent implements AcceptButtons {
  @Input() position: Point;
  @Output() decision: EventEmitter<boolean> = new EventEmitter<boolean>();
  public visibility: boolean;

  constructor() {
  }

  public show(position: Point): void {
    this.visibility = true;
    console.log('showButtons');
    console.log(position.x + 'btnsX: ' + this.position.x);
    console.log(position.y + 'btnsY: ' + this.position.y);
  }

  public decide(decision: boolean): void {
    this.decision.emit(decision);
    console.log('decision: ' + this.decision);
    this.hide();
  }

  public hide(): void {
    this.visibility = false;
    console.log('hideButtons');
  }
}
