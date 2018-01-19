import {Component, OnInit, ViewChild} from '@angular/core';
import {AcceptButtonsService} from './accept-buttons.service';
import {ToolDetailsComponent} from '../../../map-editor/tool-bar/shared/details/tool-details';

@Component({
  selector: 'app-accept-buttons',
  templateUrl: './accept-buttons.html',
  styleUrls: ['./accept-buttons.css']
})
export class AcceptButtonsComponent implements OnInit {
  @ViewChild('toolDetails') toolDetails: ToolDetailsComponent;
  constructor(private acceptButtonsService: AcceptButtonsService) {

  }

  ngOnInit () {
    this.acceptButtonsService.visibilitySet.subscribe((value: boolean) => {
      value ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  public decide(decision: boolean): void {
    this.acceptButtonsService.publishDecision(decision);
    this.toolDetails.hide();
  }
}
