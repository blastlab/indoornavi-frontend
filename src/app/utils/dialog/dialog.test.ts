import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {ComplexConfirmComponent} from '../../complex/complex.confirm';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: [ComplexDialogComponent, ComplexConfirmComponent],
  declarations: [ComplexDialogComponent, ComplexConfirmComponent],
  entryComponents: [ComplexDialogComponent, ComplexConfirmComponent],
})
export class DialogTestModule { }
