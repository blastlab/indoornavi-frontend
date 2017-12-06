import {Component, OnInit, ViewChild} from '@angular/core';
import {AcceptButtonsService} from './accept-buttons.service';
import {Point} from '../../../map-editor/map.type';
import {ToolDetailsComponent} from '../../../map-editor/tool-bar/shared/details/tool-details';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent implements OnInit {
  // public visible: boolean = false;
  @ViewChild('toolDetails') toolDetails: ToolDetailsComponent;
  // private coordinates: Point;

  constructor(private acceptButtonsService: AcceptButtonsService) {

    // this.acceptButtonsService.coordinatesChanged.subscribe(data => {
    //   // this.coordinates = this.zoomService.reverseCalculate(data);
    //   this.coordinates = {x: data.x, y: data.y};
    //   const buttons = document.getElementById('accept-buttons');
    //   buttons.style.visibility = 'hidden';
    //   const checkButtonsVisibility = () => {
    //     if (buttons.clientWidth !== 0) {
    //       buttons.style.top = `${this.coordinates.y + 40}px`;
    //       buttons.style.left = `${this.coordinates.x - buttons.clientWidth / 2}px`;
    //       buttons.style.visibility = 'visible';
    //       clearInterval(interval);
    //     }
    //   };
    //   const interval = setInterval(checkButtonsVisibility, 100);
    // });

  }

  ngOnInit () {
    this.acceptButtonsService.visibilitySet.subscribe((value: boolean) => {
      this.toolDetails.show();
    });
  }

  public decide(decision: boolean): void {
    this.acceptButtonsService.publishDecision(decision);
    this.toolDetails.hide();
    // this.visible = false;
  }

}
