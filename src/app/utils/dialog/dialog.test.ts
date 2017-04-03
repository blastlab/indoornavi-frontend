import {MdDialogModule, MaterialModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {ComplexDialogComponent} from '../../complex/complex.dialog';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AnchorDialogComponent} from '../../anchor/anchor.dialog';

@NgModule({
  imports: [MdDialogModule, FormsModule, MaterialModule, TranslateModule.forRoot()],
  exports: [ComplexDialogComponent, AnchorDialogComponent],
  declarations: [ComplexDialogComponent, AnchorDialogComponent],
  entryComponents: [ComplexDialogComponent, AnchorDialogComponent],
})
export class DialogTestModule { }
