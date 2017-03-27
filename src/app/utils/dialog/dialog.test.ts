import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule],
  exports: [ComplexDialogComponent],
  declarations: [ComplexDialogComponent],
  entryComponents: [ComplexDialogComponent],
})
export class DialogTestModule { }
