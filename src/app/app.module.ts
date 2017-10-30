import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {MaterialModule, MdButtonModule, MdCardModule, MdDialogModule, MdIconModule, MdIconRegistry} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ComplexDialogComponent} from './complex/complex.dialog';
import {ComplexConfirmComponent} from './complex/complex.confirm';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {BuildingComponent} from './building/building';
import {BuildingDialogComponent} from './building/building.dialog';
import {BuildingConfirmComponent} from './building/building.confirm';
import {BuildingService} from './building/building.service';
import {FloorComponent} from './floor/floor';
import {FloorService} from './floor/floor.service';
import {FloorDialogComponent} from './floor/floor.dialog';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import {Ng2BreadcrumbModule} from 'ng2-breadcrumb/ng2-breadcrumb';
import {WebSocketService} from 'angular2-websocket-service';
import {SocketService} from './utils/socket/socket.service';
import {DndModule} from 'ng2-dnd';
import {DeviceListComponent} from './device/device.list';
import {DeviceDialogComponent} from './device/device.dialog';
import {DeviceService} from './device/device.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ImageUploadModule} from 'angular2-image-upload';
import {MapControllerComponent} from './map/map.controller';
import {MapViewerComponent} from './map/map.viewer';
import {MapUploaderComponent} from './map/map.uploader';
import {MapService} from './map/map.service';
import {HintBarComponent} from './map/hint-bar/hint-bar';
import {ToolbarComponent} from './map/toolbar/toolbar';
import {ScaleComponent} from './map/toolbar/tools/scale/scale';
import {ScaleInputComponent} from './map/toolbar/tools/scale/input/input';
import {ScaleInputService} from './map/toolbar/tools/scale/input/input.service';
import {ScaleHintComponent} from './map/toolbar/tools/scale/hint/hint';
import {ScaleHintService} from './map/toolbar/tools/scale/hint/hint.service';
import {MapLoaderInformerService} from './utils/map-loader-informer/map-loader-informer.service';
import {UserComponent} from './user/user';
import {UserDialogComponent} from './user/user.dialog';
import {UserService} from './user/user.service';
import {AuthComponent} from './auth/auth';
import {AuthGuard, CanRead} from './auth/auth.guard';
import {AuthService} from './auth/auth.service';
import {ChangePasswordComponent} from './user/changePassword';
import {SharedModule} from './utils/shared/shared.module';
import {UnauthorizedComponent} from './utils/unauthorized/unauthorized';
import {PermissionGroupComponent} from './user/permissionGroup';
import {PermissionGroupService} from './user/permissionGroup.service';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {WizardComponent} from './map/toolbar/tools/wizard/wizard';
import {AcceptButtonsComponent} from './utils/accept-buttons/accept-buttons';
import {AcceptButtonsService} from './utils/accept-buttons/accept-buttons.service';
import {FirstStepComponent} from './map/toolbar/tools/wizard/first-step/first-step';
import {SecondStepComponent} from './map/toolbar/tools/wizard/second-step/second-step';
import {ThirdStepComponent} from './map/toolbar/tools/wizard/third-step/third-step';
import {DrawingService} from './utils/drawing/drawing.service';
import {IconService} from './utils/drawing/icon.service';
import {HintBarService} from './map/hint-bar/hint-bar.service';
import {ActionBarService} from './map/actionbar/actionbar.service';
import {D3Service} from 'd3-ng2-service';
import {ScaleService} from './map/toolbar/tools/scale/scale.service';
import {PublishedComponent} from './published/published';
import {PublishedListComponent} from './published/list/published-list';
import {appRoutes} from './app.routes';
import {PublishedService} from './published/published.service';
import {MapViewerService} from './map/map.viewer.service';
import {PublishedDialogComponent} from './published/dialog/published.dialog';
import {ConfirmDialogComponent} from './utils/confirm-dialog/confirm.dialog';
import {DeviceComponent} from './device/device.component';
import {ActionBarComponent} from 'app/map/actionbar/actionbar';
import {AreaService} from './area/area.service';
import {Md5} from 'ts-md5/dist/md5';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';

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
    DeviceListComponent,
    DeviceDialogComponent,
    BuildingConfirmComponent,
    FloorComponent,
    FloorDialogComponent,
    AppComponent,
    MapControllerComponent,
    MapViewerComponent,
    MapUploaderComponent,
    HintBarComponent,
    ToolbarComponent,
    ScaleComponent,
    ScaleInputComponent,
    ScaleHintComponent,
    UserComponent,
    UserDialogComponent,
    AuthComponent,
    ChangePasswordComponent,
    UnauthorizedComponent,
    PermissionGroupComponent,
    ActionBarComponent,
    WizardComponent,
    AcceptButtonsComponent,
    FirstStepComponent,
    SecondStepComponent,
    ThirdStepComponent,
    PublishedComponent,
    PublishedListComponent,
    PublishedDialogComponent,
    ConfirmDialogComponent,
    DeviceComponent
  ],
  entryComponents: [
    ComplexDialogComponent,
    ComplexConfirmComponent,
    BuildingDialogComponent,
    DeviceDialogComponent,
    BuildingConfirmComponent,
    FloorDialogComponent,
    UserDialogComponent,
    PublishedDialogComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    MdDialogModule,
    MdCardModule,
    MdButtonModule,
    MdIconModule,
    FormsModule,
    MaterialModule,
    HttpModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    RouterModule.forRoot(appRoutes),
    // Ng2BreadcrumbModule.forRoot(),
    DndModule.forRoot(),
    FlexLayoutModule,
    ImageUploadModule.forRoot(),
    SharedModule,
    AngularMultiSelectModule,
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
    MapService,
    AcceptButtonsService,
    DrawingService,
    MdIconRegistry,
    IconService,
    HintBarService,
    MapService,
    ScaleInputService,
    ScaleHintService,
    MapLoaderInformerService,
    UserService,
    AuthService,
    CanRead,
    AuthGuard,
    ActionBarService,
    PermissionGroupService,
    D3Service,
    ScaleService,
    PublishedService,
    MapViewerService,
    AreaService,
    Md5
  ], bootstrap: [AppComponent]
})

export class AppModule {
}
