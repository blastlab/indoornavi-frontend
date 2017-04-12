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
import {BuildingConfirmComponent} from './building/building.confirm';
import {BuildingService} from './building/building.service';
import {FloorComponent} from './floor/floor';
import {FloorService} from './floor/floor.service';
import {FloorDialogComponent} from './floor/floor.dialog';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AnchorComponent} from './anchor/anchor';
import {Ng2BreadcrumbModule} from 'ng2-breadcrumb/ng2-breadcrumb';
import {WebSocketService} from 'angular2-websocket-service';
import {SocketService} from './utils/socket/socket.service';
import {DndModule} from 'ng2-dnd';
import {TagComponent} from './tag/tag';
import {DeviceListComponent} from './device/device.list';
import {DeviceDialogComponent} from './device/device.dialog';
import {DeviceService} from './device/device.service';
import {FlexLayoutModule} from '@angular/flex-layout';


const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'complexes', component: ComplexComponent},
  {path: 'complexes/:id/buildings', component: BuildingComponent},
  {path: 'anchors', component: AnchorComponent},
  {path: 'complexes/:complexId/buildings/:id/floors', component: FloorComponent},
  {path: 'tags', component: TagComponent},  {path: '**', redirectTo: '/complexes'}
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
    AnchorComponent,
    DeviceListComponent,
    DeviceDialogComponent,
    BuildingConfirmComponent,
    FloorComponent,
    FloorDialogComponent,
    AppComponent,
    TagComponent
  ],
  entryComponents: [
    ComplexDialogComponent,
    ComplexConfirmComponent,
    BuildingDialogComponent,
    DeviceDialogComponent,
    BuildingConfirmComponent,
    FloorDialogComponent,
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
    DndModule.forRoot(),
    FlexLayoutModule
  ],
  providers: [
    BuildingService,
    FloorService,
    HttpService,
    ComplexService,
    ToastService,
    WebSocketService,
    SocketService,
    DeviceService
  ], bootstrap: [AppComponent]
})

export class AppModule {
}
