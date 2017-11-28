import {Component} from '@angular/core';
import {Point} from '../../map-editor/map.type';
import {AcceptButtonsService} from './accept-buttons.service';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent {
  public visible: boolean = false;
  private coordinates: Point;

  constructor(private acceptButtonsService: AcceptButtonsService) {
    this.acceptButtonsService.coordinatesChanged.subscribe(data => {
      this.coordinates = data;
      const buttons = document.getElementById('accept-buttons');
      buttons.style.visibility = 'hidden';
      const checkButtonsVisibility = () => {
        if (buttons.clientWidth !== 0) {
          buttons.style.top = this.coordinates.y + 'px';
          buttons.style.left = this.coordinates.x - (buttons.clientWidth / 2) + 'px';
          buttons.style.visibility = 'visible';
          clearInterval(interval);
        }
      };
      const interval = setInterval(checkButtonsVisibility, 100);
    });
    this.acceptButtonsService.visibilitySet.subscribe(data => {
      this.visible = data;
    });
  }

  public decide(decision: boolean): void {
    this.acceptButtonsService.publishDecision(decision);
    this.visible = false;
  }

}
