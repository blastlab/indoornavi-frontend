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
  bodyTextKey: string = 'ask.to.confirm.placement';
  confirmTextKey: string = 'ok';
  declineTextKey: string = 'cancel';

  constructor(private acceptButtonsService: AcceptButtonsService) {

  }

  ngOnInit() {
    this.acceptButtonsService.visibilityChanged.subscribe((value: boolean) => {
      value ? this.toolDetails.show() : this.toolDetails.hide();
    });

    this.acceptButtonsService.translationsChanged.subscribe((value: AcceptButtonsTranslations) => {
      if (!!value.bodyTextKey) {
        this.bodyTextKey = value.bodyTextKey;
      }
      if (!!value.confirmTextKey) {
        this.confirmTextKey = value.confirmTextKey;
      }
      if (!!value.declineTextKey) {
        this.declineTextKey = value.declineTextKey;
      }
    });
  }

  public decide(decision: boolean): void {
    this.acceptButtonsService.publishDecision(decision);
    this.toolDetails.hide();
  }
}

export interface AcceptButtonsTranslations {
  bodyTextKey?: string;
  confirmTextKey?: string;
  declineTextKey?: string;
}
