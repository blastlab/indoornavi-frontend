import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComplex } from './complex/app.complex';
import { MaterialModule } from '@angular/material';

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
  providers: [],
  bootstrap: [AppComplex]
})

export class AppModule { }
