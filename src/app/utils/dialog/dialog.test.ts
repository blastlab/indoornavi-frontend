import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {BuildingDialogComponent} from '../../building/building.dialog';
import {BuildingConfirmComponent} from '../../building/building.confirm';
import {FloorDialogComponent} from '../../floor/floor.dialog';
import {DeviceDialogComponent} from '../../device/device.dialog';
import {CommonModule} from '@angular/common';

const DIALOGS = [
  ComplexDialogComponent,
  DeviceDialogComponent,
  ComplexConfirmComponent,
  BuildingDialogComponent,
  BuildingConfirmComponent,
  FloorDialogComponent
];

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot(), CommonModule],
  exports: DIALOGS,
  declarations: DIALOGS,
  entryComponents: DIALOGS,
})
export class DialogTestModule { }
