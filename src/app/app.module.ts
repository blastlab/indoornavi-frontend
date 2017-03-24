import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';

@NgModule({
  declarations: [
    ComplexComponent,
    ComplexDialogComponent
  ],
  entryComponents: [
    ComplexDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpModule
  ],
  providers: [HttpService, ComplexService, ToastService],
  bootstrap: [ComplexComponent]
})

export class AppModule {
}
