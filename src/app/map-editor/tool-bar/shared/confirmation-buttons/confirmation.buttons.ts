import {Component, Input} from '@angular/core';
import {ConfirmDialog} from 'primeng/primeng';

@Component({
  selector: 'app-confirmation-buttons',
  templateUrl: 'confirmation.buttons.html'
})
export class ConfirmationButtonsComponent {
  @Input('confirmationDialog') confirmationDialog: ConfirmDialog;
}
