import {Component} from '@angular/core';
import {Point} from '../../map/map.type';
import {AcceptButtonsService} from './accept-buttons.service';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent {
  public visible: boolean = false;
  private coords: Point;

  constructor(private _accButtons: AcceptButtonsService) {
    this._accButtons.coordinatesChanged.subscribe(
      data => {
        this.coords = data;
        const buttons = document.getElementById('accept-buttons');
        buttons.style.top = this.coords.y + 'px';
        buttons.style.left = this.coords.x + 'px';
      });
    this._accButtons.visibilitySet.subscribe(
      data => {
        this.visible = data;
      });
  }

  public decide(decision: boolean): void {
    this._accButtons.publishDecision(decision);
    this.hide();
  }

  private hide(): void {
    this.visible = false;
  }
}
