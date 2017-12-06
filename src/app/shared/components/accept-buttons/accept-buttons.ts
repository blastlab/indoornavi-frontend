import {Component, OnInit} from '@angular/core';
import {AcceptButtonsService} from './accept-buttons.service';
import {Point} from '../../../map-editor/map.type';
import {ZoomService} from '../../../map-editor/zoom.service';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent implements OnInit {
  public visible: boolean = false;
  private coordinates: Point;

  constructor(private acceptButtonsService: AcceptButtonsService, private zoomService: ZoomService) {

    this.acceptButtonsService.coordinatesChanged.subscribe(data => {
      this.coordinates = this.zoomService.reverseCalculate(data);
      // this.coordinates = {x: data.x, y: data.y};
      const buttons = document.getElementById('accept-buttons');
      buttons.style.visibility = 'hidden';
      const checkButtonsVisibility = () => {
        if (buttons.clientWidth !== 0) {
          buttons.style.top = `${this.coordinates.y + 40}px`;
          buttons.style.left = `${this.coordinates.x - buttons.clientWidth / 2}px`;
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

  ngOnInit () {

  }

  public decide(decision: boolean): void {
    this.acceptButtonsService.publishDecision(decision);
    this.visible = false;
  }

}
