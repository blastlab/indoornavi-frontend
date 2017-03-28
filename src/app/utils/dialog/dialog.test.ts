import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: [ComplexDialogComponent],
  declarations: [ComplexDialogComponent],
  entryComponents: [ComplexDialogComponent],
})
export class DialogTestModule { }
