import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';

import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

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
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [HttpService, ComplexService, ToastService],
  bootstrap: [ComplexComponent]
})

export class AppModule {
}
