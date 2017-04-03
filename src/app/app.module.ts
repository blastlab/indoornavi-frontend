import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ComplexConfirmComponent} from './complex/complex.confirm';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';
import {AppComponent} from './app.component';
import {Routes, RouterModule} from '@angular/router';
import {BuildingComponent} from './building/building';
import {BuildingDialogComponent} from './building/building.dialog';
import {BuildingService} from './building/building.service';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AnchorComponent} from './anchor/anchor';
import {AnchorListComponent} from './anchor/anchor.list';
import {Ng2BreadcrumbModule} from 'ng2-breadcrumb/ng2-breadcrumb';
import {WebSocketService} from 'angular2-websocket-service';
import {SocketService} from './utils/socket/socket.service';
import {DndModule} from 'ng2-dnd';
import {AnchorService} from './anchor/anchor.service';
import {AnchorDialogComponent} from './anchor/anchor.dialog';

const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'complexes', component: ComplexComponent},
  {path: 'complexes/:id/buildings', component: BuildingComponent},
  {path: 'anchors', component: AnchorComponent},
  {path: '**', redirectTo: '/complexes'}
];

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    ComplexComponent,
    ComplexDialogComponent,
    ComplexConfirmComponent,
    BuildingComponent,
    BuildingDialogComponent,
    AppComponent,
    AnchorComponent,
    AnchorListComponent,
    AnchorDialogComponent
  ],
  entryComponents: [
    ComplexDialogComponent,
    ComplexConfirmComponent,
    BuildingDialogComponent,
    AnchorDialogComponent
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
    RouterModule.forRoot(appRoutes),
    Ng2BreadcrumbModule.forRoot(),
    DndModule.forRoot()
  ],
  providers: [
    BuildingService,
    HttpService,
    ComplexService,
    ToastService,
    WebSocketService,
    SocketService,
    AnchorService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
