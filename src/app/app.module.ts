import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComplex} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from "./complex/complex.service";
import {ComplexDialog} from './complex/complex.dialog';
import {ToastService} from "./utils/toast/toast.service";
import {HttpService} from "./utils/http/http.service";
import {AppBuilding} from "./building/building";
import {BuildingDialog} from "./building/building.dialog";
import {Routes, RouterModule} from "@angular/router";
import {BuildingService} from "./building/building.service";
import {AppComponent} from "./app.component";

const appRoutes: Routes = [
  { path: '', component: AppComplex },
  { path: 'building/:id', component: AppBuilding },
];

@NgModule({
  declarations: [
    AppComplex,
    AppBuilding,
    BuildingDialog,
    ComplexDialog,
    AppComponent
  ],
  entryComponents: [
    ComplexDialog,
    BuildingDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [BuildingService, HttpService, ComplexService, ToastService],
  bootstrap: [AppComponent]
})

