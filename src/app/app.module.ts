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
import {DeviceService} from './device/device.service';
import {ImageUploadModule} from 'angular2-image-upload';
import {MapControllerComponent} from './map-editor/map.controller';
import {MapUploaderComponent} from './map-editor/uploader/map.uploader';
import {MapService} from './map-editor/uploader/map.uploader.service';
import {HintBarComponent} from './map-editor/hint-bar/hint-bar';
import {ToolbarComponent} from './map-editor/tool-bar/toolbar';
import {ScaleComponent} from './map-editor/tool-bar/tools/scale/scale';
import {ScaleInputComponent} from './map-editor/tool-bar/tools/scale/input/input';
import {ScaleInputService} from './map-editor/tool-bar/tools/scale/input/input.service';
import {ScaleHintComponent} from './map-editor/tool-bar/tools/scale/hint/hint';
import {ScaleHintService} from './map-editor/tool-bar/tools/scale/hint/hint.service';
import {UserComponent} from './user/user/user';
import {UserService} from './user/user/user.service';
import {AuthComponent} from './auth/auth';
import {AuthGuard, CanRead} from './auth/auth.guard';
import {AuthService} from './auth/auth.service';
import {WizardComponent} from './map-editor/tool-bar/tools/wizard/wizard';
import {ActionBarService} from './map-editor/action-bar/actionbar.service';
import {ScaleService} from './shared/services/scale/scale.service';
import {PublishedListComponent} from './map-viewer/list/publication-list';
import {AllFieldsFilter} from './shared/utils/filters/allFieldsFilter';
import {DevicePlacerController} from './map-editor/tool-bar/tools/devices/device-placer.controller';
import {appRoutes} from './app.routes';
import {PublishedService} from './map-viewer/publication.service';
import {PublicationDialogComponent} from './map-viewer/dialog/publication.dialog';
import {ActionBarComponent} from 'app/map-editor/action-bar/actionbar';
import {Md5} from 'ts-md5/dist/md5';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  BreadcrumbModule,
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  FileUploadModule,
  GrowlModule,
  MultiSelectModule,
  PanelMenuModule,
  RadioButtonModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import {HintBarService} from './map-editor/hint-bar/hintbar.service';
import {ToolbarService} from './map-editor/tool-bar/toolbar.service';
import {AppComponent} from './app.component';
import {MessageServiceWrapper} from './shared/services/message/message.service';
import {MessageService} from 'primeng/components/common/messageservice';
import {BreadcrumbService} from './shared/services/breadcrumbs/breadcrumb.service';
import {AreaService} from './shared/services/area/area.service';
import {MapEditorService} from './map-editor/map.editor.service';
import {PermissionGroupService} from './user/permissionGroup/permissionGroup.service';
import {MapLoaderInformerService} from './shared/services/map-loader-informer/map-loader-informer.service';
import {IconService} from 'app/shared/services/drawing/icon.service';
import {AcceptButtonsService} from 'app/shared/components/accept-buttons/accept-buttons.service';
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
import {AppAutoFocusDirective} from './shared/directive/autofocus.directive';
import {DeviceComponent} from 'app/device/device';
import {AcceptButtonsComponent} from 'app/shared/components/accept-buttons/accept-buttons';
import {PermissionGroupComponent} from 'app/user/permissionGroup/permissionGroup';
import {UnauthorizedComponent} from 'app/unauthorized/unauthorized';
import {ChangePasswordComponent} from './user/changePassword/changePassword';
import {SharedModule} from './shared/modules/shared.module';
import {ToolDetailsComponent} from './map-editor/tool-bar/shared/details/tool-details';
import {MdIconRegistry} from '@angular/material';
import {SocketConnectorComponent} from './map-viewer/views/socket-connector.component';
import {ZoomService} from './shared/services/zoom/zoom.service';
import {MapComponent} from './map/map';
import {AreasComponent} from './map-editor/tool-bar/tools/area/areas';
import {AreaDetailsComponent} from './map-editor/tool-bar/tools/area/details/area-details';
import {AreaDetailsService} from './map-editor/tool-bar/tools/area/details/area-details.service';
import {ContextMenuService} from './shared/wrappers/editable/editable.service';
import {PublishedComponent} from './map-viewer/views/publications/publication';
import {AnalyticsComponent} from './map-viewer/views/analytics/analytics';
import {DevicesComponent} from './map-editor/tool-bar/tools/devices/devices';
import {DevicesListComponent} from './map-editor/tool-bar/tools/devices/list/devices-list';
import {MapObjectService} from './shared/utils/drawing/map.object.service';
import {MinSelectedValidator} from './shared/directive/minselected.directive';
import {TagVisibilityTogglerComponent} from './shared/components/tag-visibility-toggler/tag-visibility-toggler';
import {TagVisibilityTogglerService} from './shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {HeatMapControllerComponent} from './shared/components/heat-map-controller/heat-map-controller/heat-map-controller.component';
import {HeatMapControllerService} from './shared/components/heat-map-controller/heat-map-controller/heat-map-controller.service';
import {MousePositionViewerComponent} from './map-editor/mouse-position-viewer/mouse-position-viewer.component';
import {MapClickService} from './shared/services/map-click/map-click.service';
import {NotSupportedBrowserComponent} from './not-supported-browser/not-supported-browser';
import {LongIdValidator} from './shared/directive/long-id.directive';
import {ShortIdValidator} from './shared/directive/short-id.directive';

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
    PublicationDialogComponent,
    DeviceComponent,
    LongIdValidator,
    ShortIdValidator,
    AppAutoFocusDirective,
    ToolDetailsComponent,
    ToolDetailsComponent,
    DeviceComponent,
    SocketConnectorComponent,
    MapComponent,
    AreasComponent,
    AreaDetailsComponent,
    AppAutoFocusDirective,
    DevicesComponent,
    DevicesListComponent,
    AllFieldsFilter,
    AreaDetailsComponent,
    AnalyticsComponent,
    MinSelectedValidator,
    TagVisibilityTogglerComponent,
    HeatMapControllerComponent,
    MousePositionViewerComponent,
    NotSupportedBrowserComponent
  ],
  entryComponents: [
    PublicationDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    RouterModule.forRoot(appRoutes),
    ImageUploadModule.forRoot(),
    SharedModule,
    DataTableModule,
    SliderModule,
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
    OverlayPanelModule,
    ContextMenuModule,
    FileUploadModule,
    RadioButtonModule
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
    IconService,
    MapService,
    ScaleInputService,
    ScaleHintService,
    MapLoaderInformerService,
    MapClickService,
    UserService,
    AuthService,
    CanRead,
    AuthGuard,
    ActionBarService,
    PermissionGroupService,
    DevicePlacerController,
    ScaleService,
    PublishedService,
    MapEditorService,
    AreaService,
    Md5,
    ConfirmationService,
    BreadcrumbService,
    MessageService,
    MessageServiceWrapper,
    ToolbarService,
    HintBarService,
    MdIconRegistry,
    HintBarService,
    ZoomService,
    AreaDetailsService,
    ContextMenuService,
    MapObjectService,
    ContextMenuService,
    TagVisibilityTogglerService,
    HeatMapControllerService
  ], bootstrap: [AppComponent]
})

export class AppModule {
}
