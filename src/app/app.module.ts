import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from "./complex/complex.service";
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ToastService} from "./utils/toast/toast.service";
import {HttpService} from "./utils/http/http.service";
import {AppComponent} from "./app.component";
import {Routes, RouterModule} from "@angular/router";
import {AppBuilding} from "./building/building";
import {BuildingDialog} from "./building/building.dialog";
import {BuildingService} from "./building/building.service";
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

const appRoutes: Routes = [
  { path: '', component: ComplexComponent },
  { path: 'building/:id', component: AppBuilding },
];

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    ComplexComponent,
    ComplexDialogComponent,
    AppBuilding,
    BuildingDialog,
    AppComponent
  ],
  entryComponents: [
    ComplexDialogComponent,
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
    }),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [BuildingService, HttpService, ComplexService, ToastService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
