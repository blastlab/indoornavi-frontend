import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';

import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from "./complex/complex.service";
import {ComplexDialog} from './complex/complex.dialog';
import {ToastService} from "./utils/toast/toast.service";
import {HttpService} from "./utils/http/http.service";

const appRoutes: Routes = [
  { path: '', component: AppComplex },
  { path: 'building/:id', component: AppBuilding },
];

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    ComplexComponent,
    ComplexDialogComponent
    AppBuilding,
    BuildingDialog,
    AppComponent
  ],
  entryComponents: [
    ComplexDialogComponent
    BuildingDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
    RouterModule.forRoot(appRoutes)
  ],
  providers: [BuildingService, HttpService, ComplexService, ToastService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
