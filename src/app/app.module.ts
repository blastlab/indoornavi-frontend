import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComplex} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from "./complex/complex.service";
import {AppService} from "./app.service";

@NgModule({
  declarations: [
    AppComplex
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpModule
  ],
  providers: [AppService, ComplexService],
  bootstrap: [AppComplex]
})

export class AppModule {
}
