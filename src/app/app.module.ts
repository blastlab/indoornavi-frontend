import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {MaterialModule} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ComplexConfirmComponent} from './complex/complex.confirm';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {BuildingComponent} from './building/building';
import {BuildingDialogComponent} from './building/building.dialog';
import {BuildingConfirmComponent} from './building/building.confirm';
import {BuildingService} from './building/building.service';
import {FloorComponent} from './floor/floor';
import {FloorService} from './floor/floor.service';
import {FloorDialogComponent} from './floor/floor.dialog';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
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
import {ImageUploadModule} from 'angular2-image-upload';
import {MapControllerComponent} from './map/map.controller';
import {MapViewerComponent} from './map/map.viewer';
import {MapUploaderComponent} from './map/map.uploader';
import {MapService} from './map/map.service';


const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'complexes', component: ComplexComponent},
  {path: 'complexes/:complexId/buildings', component: BuildingComponent},
  {path: 'anchors', component: AnchorComponent},
  {path: 'tags', component: TagComponent},
  {path: 'complexes/:complexId/buildings/:buildingId/floors', component: FloorComponent},
  {path: 'complexes/:complexId/buildings/:buildingId/floors/:floorId/map', component: MapControllerComponent},
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
    AnchorComponent,
    DeviceListComponent,
    DeviceDialogComponent,
    BuildingConfirmComponent,
    FloorComponent,
    FloorDialogComponent,
    AppComponent,
    TagComponent,
    MapControllerComponent,
    MapViewerComponent,
    MapUploaderComponent
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
    FlexLayoutModule,
    ImageUploadModule.forRoot()
  ],
  providers: [
    BuildingService,
    FloorService,
    HttpService,
    ComplexService,
    ToastService,
    WebSocketService,
    SocketService,
    DeviceService,
    MapService
  ], bootstrap: [AppComponent]
})

export class AppModule {
}
