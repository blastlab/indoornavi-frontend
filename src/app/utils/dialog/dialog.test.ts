import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AnchorDialogComponent} from '../../anchor/anchor.dialog';
import {BuildingDialogComponent} from "../../building/building.dialog";

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: [ComplexDialogComponent, AnchorDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
  declarations: [ComplexDialogComponent, AnchorDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
  entryComponents: [ComplexDialogComponent, AnchorDialogComponent, ComplexConfirmComponent, BuildingDialogComponent],
})
export class DialogTestModule { }
