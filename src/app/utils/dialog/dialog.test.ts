import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AnchorDialogComponent} from '../../anchor/anchor.dialog';
import {BuildingDialogComponent} from '../../building/building.dialog';
import {BuildingConfirmComponent} from "../../building/building.confirm";
import {FloorDialogComponent} from "../../floor/floor.dialog";

const DIALOGS = [
  ComplexDialogComponent,
  AnchorDialogComponent,
  ComplexConfirmComponent,
  BuildingDialogComponent,
  BuildingConfirmComponent,
  FloorDialogComponent
];

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: DIALOGS,
  declarations: DIALOGS,
  entryComponents: DIALOGS,})
export class DialogTestModule { }
