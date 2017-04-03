import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {BuildingDialogComponent} from "../../building/building.dialog";

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: [ComplexDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
  declarations: [ComplexDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
  entryComponents: [ComplexDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
})
export class DialogTestModule { }
