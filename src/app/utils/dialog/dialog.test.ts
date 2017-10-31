import {MaterialModule, MdDialogModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {BuildingConfirmComponent} from '../../building/building.confirm';
import {CommonModule} from '@angular/common';
import {UserDialogComponent} from '../../user/user.dialog';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm.dialog';
import {ComplexDialogComponent} from '../../complex/dilaog/complex.dialog';
import {DeviceDialogComponent} from '../../device/dialog/device.dialog';
import {BuildingDialogComponent} from '../../building/dialog/building.dialog';
import {FloorDialogComponent} from '../../floor/dialog/floor.dialog';
import {PublishedDialogComponent} from '../../publications/dialog/published.dialog';

const DIALOGS = [
  ComplexDialogComponent,
  DeviceDialogComponent,
  ComplexConfirmComponent,
  BuildingDialogComponent,
  BuildingConfirmComponent,
  FloorDialogComponent,
  UserDialogComponent,
  ConfirmDialogComponent,
  PublishedDialogComponent
];

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot(), CommonModule, AngularMultiSelectModule],
  exports: DIALOGS,
  declarations: DIALOGS,
  entryComponents: DIALOGS,
})
export class DialogTestModule {
}
