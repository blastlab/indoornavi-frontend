import {Component, OnInit} from '@angular/core';
import {AcceptButtonsService} from './accept-buttons.service';
import {Point, Transform} from '../../../map-editor/map.type';
import {MapService} from '../../../map-editor/map.service';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent implements OnInit {
  public visible: boolean = false;
  private coordinates: Point;
  private map2DTranslation: Transform = {
    k: 1,
    x: 0,
    y: 0
  };

  constructor(private acceptButtonsService: AcceptButtonsService, private mapService: MapService) {
    this.mapService.mapIsTransformed().subscribe((transformation: Transform) => {
        this.map2DTranslation.k = transformation.k;
        this.map2DTranslation.x = transformation.x;
        this.map2DTranslation.y = transformation.y;
    });
    this.acceptButtonsService.coordinatesChanged.subscribe(data => {
      console.log(data);
      console.log(this.map2DTranslation);
      this.coordinates = data;
      const buttons = document.getElementById('accept-buttons');
      buttons.style.visibility = 'hidden';
      const checkButtonsVisibility = () => {
        if (buttons.clientWidth !== 0) {
          buttons.style.top = `${(this.coordinates.y + this.map2DTranslation.y) * this.map2DTranslation.k}px`;
          buttons.style.left = `${(this.coordinates.x + this.map2DTranslation.x - (buttons.clientWidth / 2))  * this.map2DTranslation.k}px`;
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
