import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {MaterialModule, MdButtonModule, MdCardModule, MdDialogModule, MdIconModule, MdIconRegistry} from '@angular/material';
import {ComplexService} from './complex/complex.service';
import {ToastService} from './utils/toast/toast.service';
import {HttpService} from './utils/http/http.service';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {BuildingComponent} from './building/building';
import {BuildingService} from './building/building.service';
import {FloorComponent} from './floor/floor';
import {FloorService} from './floor/floor.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import {Ng2BreadcrumbModule} from 'ng2-breadcrumb/ng2-breadcrumb';
import {WebSocketService} from 'angular2-websocket-service';
import {SocketService} from './utils/socket/socket.service';
import {DndModule} from 'ng2-dnd';
import {DeviceService} from './device/device.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ImageUploadModule} from 'angular2-image-upload';
import {MapControllerComponent} from './map-editor/map.controller';
import {MapViewerComponent} from './map-editor/map.viewer';
import {MapUploaderComponent} from './map-editor/map.uploader';
import {MapService} from './map-editor/map.service';
import {HintBarComponent} from './map-editor/hint-bar/hint-bar';
import {ToolbarComponent} from './map-editor/tool-bar/toolbar';
import {ScaleComponent} from './map-editor/tool-bar/tools/scale/scale';
import {ScaleInputComponent} from './map-editor/tool-bar/tools/scale/input/input';
import {ScaleInputService} from './map-editor/tool-bar/tools/scale/input/input.service';
import {ScaleHintComponent} from './map-editor/tool-bar/tools/scale/hint/hint';
import {ScaleHintService} from './map-editor/tool-bar/tools/scale/hint/hint.service';
import {MapLoaderInformerService} from './utils/map-loader-informer/map-loader-informer.service';
import {UserComponent} from './user/user';
import {UserDialogComponent} from './user/user.dialog';
import {UserService} from './user/user.service';
import {AuthComponent} from './auth/auth';
import {AuthGuard, CanRead} from './auth/auth.guard';
import {AuthService} from './auth/auth.service';
import {ChangePasswordComponent} from './user/changePassword/changePassword';
import {SharedModule} from './utils/shared/shared.module';
import {UnauthorizedComponent} from './utils/unauthorized/unauthorized';
import {PermissionGroupComponent} from './user/permissionGroup/permissionGroup';
import {PermissionGroupService} from './user/permissionGroup/permissionGroup.service';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {WizardComponent} from './map-editor/tool-bar/tools/wizard/wizard';
import {AcceptButtonsComponent} from './utils/accept-buttons/accept-buttons';
import {AcceptButtonsService} from './utils/accept-buttons/accept-buttons.service';
import {FirstStepComponent} from './map-editor/tool-bar/tools/wizard/first-step/first-step';
import {SecondStepComponent} from './map-editor/tool-bar/tools/wizard/second-step/second-step';
import {ThirdStepComponent} from './map-editor/tool-bar/tools/wizard/third-step/third-step';
import {DrawingService} from './utils/drawing/drawing.service';
import {IconService} from './utils/drawing/icon.service';
import {HintBarService} from './map-editor/hint-bar/hint-bar.service';
import {ActionBarService} from './map-editor/action-bar/actionbar.service';
import {D3Service} from 'd3-ng2-service';
import {ScaleService} from './map-editor/tool-bar/tools/scale/scale.service';
import {PublishedComponent} from './map-viewer/published';
import {PublishedListComponent} from './publications/list/published-list';
import {appRoutes} from './app.routes';
import {PublishedService} from './map-viewer/published.service';
import {MapViewerService} from './map-editor/map.viewer.service';
import {PublishedDialogComponent} from './publications/dialog/published.dialog';
import {ConfirmDialogComponent} from './utils/confirm-dialog/confirm.dialog';
import {DeviceComponent} from './device/device';
import {ActionBarComponent} from 'app/map-editor/action-bar/actionbar';
import {AreaService} from './area/area.service';
import {Md5} from 'ts-md5/dist/md5';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  DataTableModule,
  DialogModule,
  DragDropModule,
  DropdownModule,
  InputTextModule,
  MultiSelectModule,
  PickListModule
} from 'primeng/primeng';
// import {FocusModule} from 'angular-focus-directive';
import {DragulaService} from 'ng2-dragula';
import {AppAutoFocusDirective} from './utils/directive/autofocus.directive';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    ComplexComponent,
    BuildingComponent,
    FloorComponent,
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
    DeviceComponent,
    AppAutoFocusDirective
  ],
  entryComponents: [
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
    DataTableModule,
    ButtonModule,
    DialogModule,
    // FocusModule,
    ConfirmDialogModule,
    DragDropModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    PickListModule,
    CheckboxModule
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
    Md5,
    ConfirmationService,
    DragulaService
  ], bootstrap: [AppComponent]
})

export class AppModule {
}
