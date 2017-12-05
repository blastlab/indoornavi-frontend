import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {ComplexComponent} from './complex/complex';
import {RouterModule} from '@angular/router';
import {BuildingComponent} from './building/building';
import {BuildingService} from './building/building.service';
import {FloorComponent} from './floor/floor';
import {FloorService} from './floor/floor.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {WebSocketService} from 'angular2-websocket-service';
import {DndModule} from 'ng2-dnd';
import {DeviceService} from './device/device.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ImageUploadModule} from 'angular2-image-upload';
import {MapControllerComponent} from './map-editor/map.controller';
import {MapUploaderComponent} from './map-editor/map.uploader';
import {MapService} from './map-editor/map.service';
import {HintBarComponent} from './map-editor/hint-bar/hint-bar';
import {ToolbarComponent} from './map-editor/tool-bar/toolbar';
import {ScaleComponent} from './map-editor/tool-bar/tools/scale/scale';
import {ScaleInputComponent} from './map-editor/tool-bar/tools/scale/input/input';
import {ScaleInputService} from './map-editor/tool-bar/tools/scale/input/input.service';
import {ScaleHintComponent} from './map-editor/tool-bar/tools/scale/hint/hint';
import {ScaleHintService} from './map-editor/tool-bar/tools/scale/hint/hint.service';
import {UserComponent} from './user/user';
import {UserService} from './user/user.service';
import {AuthComponent} from './auth/auth';
import {AuthGuard, CanRead} from './auth/auth.guard';
import {AuthService} from './auth/auth.service';
import {WizardComponent} from './map-editor/tool-bar/tools/wizard/wizard';
import {ActionBarService} from './map-editor/action-bar/actionbar.service';
import {D3Service} from 'd3-ng2-service';
import {ScaleService} from './map-editor/tool-bar/tools/scale/scale.service';
import {PublishedComponent} from './map-viewer/published';
import {PublishedListComponent} from './publications/list/published-list';
import {appRoutes} from './app.routes';
import {PublishedService} from './map-viewer/published.service';
import {PublishedDialogComponent} from './publications/dialog/published.dialog';
import {ActionBarComponent} from 'app/map-editor/action-bar/actionbar';
import {Md5} from 'ts-md5/dist/md5';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  ButtonModule, PanelMenuModule, ToolbarModule, BreadcrumbModule, TooltipModule, ConfirmationService, GrowlModule, SidebarModule, CheckboxModule,
  MultiSelectModule, ConfirmDialogModule
} from 'primeng/primeng';
import {HintBarService} from './map-editor/hint-bar/hintbar.service';
import {ToolbarService} from './map-editor/tool-bar/toolbar.service';
import {AppComponent} from './app.component';
import {MessageServiceWrapper} from './utils/message.service';
import {MessageService} from 'primeng/components/common/messageservice';
import {BreadcrumbService} from './shared/services/breadcrumbs/breadcrumb.service';
import {AreaService} from './shared/services/area/area.service';
import {MapViewerService} from './map-editor/map.editor.service';
import {PermissionGroupService} from './user/permissionGroup/permissionGroup.service';
import {MapLoaderInformerService} from './shared/services/map-loader-informer/map-loader-informer.service';
import {IconService} from 'app/shared/services/drawing/icon.service';
import {MdIconRegistry} from '@angular/material';
import {AcceptButtonsService} from 'app/shared/components/accept-buttons/accept-buttons.service';
import {DrawingService} from './shared/services/drawing/drawing.service';
import {SocketService} from 'app/shared/services/socket/socket.service';
import {ComplexService} from './complex/complex.service';
import {HttpService} from './shared/services/http/http.service';
import {ProgressSpinnerModule} from 'primeng/components/progressspinner/progressspinner';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {PickListModule} from 'primeng/components/picklist/picklist';
import {InputTextModule} from 'primeng/components/inputtext/inputtext';
import {DragDropModule} from 'primeng/components/dragdrop/dragdrop';
import {DropdownModule} from 'primeng/components/dropdown/dropdown';
import {DialogModule} from 'primeng/components/dialog/dialog';
import {DataTableModule} from 'primeng/components/datatable/datatable';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown';
import {AppAutoFocusDirective} from './utils/directive/autofocus.directive';
import {DeviceComponent} from 'app/device/device';
import {AcceptButtonsComponent} from 'app/shared/components/accept-buttons/accept-buttons';
import {PermissionGroupComponent} from 'app/user/permissionGroup/permissionGroup';
import {UnauthorizedComponent} from 'app/unauthorized/unauthorized';
import {ChangePasswordComponent} from './user/changePassword/changePassword';
import {MapEditorComponent} from './map-editor/map.editor';
import {SharedModule} from './shared/modules/shared.module';
import {ZoomService} from './map-editor/zoom.service';
import {DrawBuilder} from './map-viewer/published.builder';

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
    MapEditorComponent,
    MapUploaderComponent,
    HintBarComponent,
    ToolbarComponent,
    ScaleComponent,
    ScaleInputComponent,
    ScaleHintComponent,
    UserComponent,
    AuthComponent,
    ChangePasswordComponent,
    UnauthorizedComponent,
    PermissionGroupComponent,
    ActionBarComponent,
    WizardComponent,
    AcceptButtonsComponent,
    PublishedComponent,
    PublishedListComponent,
    PublishedDialogComponent,
    DeviceComponent,
    AppAutoFocusDirective
  ],
  entryComponents: [
    PublishedDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
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
    DndModule.forRoot(),
    FlexLayoutModule,
    ImageUploadModule.forRoot(),
    SharedModule,
    AngularMultiSelectModule,
    DataTableModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    DragDropModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    PickListModule,
    CheckboxModule,
    ButtonModule,
    ToolbarModule,
    PanelMenuModule,
    SidebarModule,
    BreadcrumbModule,
    TooltipModule,
    GrowlModule,
    ProgressSpinnerModule,
    OverlayPanelModule
  ],
  providers: [
    BuildingService,
    FloorService,
    HttpService,
    ComplexService,
    WebSocketService,
    SocketService,
    DeviceService,
    MapService,
    AcceptButtonsService,
    DrawingService,
    MdIconRegistry,
    IconService,
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
    BreadcrumbService,
    MessageService,
    MessageServiceWrapper,
    ToolbarService,
    HintBarService,
    ZoomService
  ], bootstrap: [AppComponent]
})

export class AppModule {
}

