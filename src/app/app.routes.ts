import {Routes} from '@angular/router';
import {AuthComponent} from './auth/auth';
import {ComplexComponent} from './complex/complex';
import {CanRead} from './auth/auth.guard';
import {BuildingComponent} from './building/building';
import {UserComponent} from './user/user/user';
import {ChangePasswordComponent} from './user/changePassword/changePassword';
import {PermissionGroupComponent} from './user/permissionGroup/permissionGroup';
import {FloorComponent} from './floor/floor';
import {MapControllerComponent} from './map-editor/map.controller';
import {UnauthorizedComponent} from './unauthorized/unauthorized';
import {PublishedListComponent} from './map-viewer/list/publication-list';
import {PublishedComponent} from './map-viewer/views/publications/publication';
import {DeviceComponent} from './device/device';
import {BluetoothComponent} from './bluetooth/bluetooth';
import {AnalyticsComponent} from './map-viewer/views/analytics/analytics';
import {NotSupportedBrowserComponent} from './not-supported-browser/not-supported-browser';
import {TagsFinderComponent} from './tags-finder/tags-finder.component';
import {TagFollowerComponent} from './map-viewer/views/tagfollower/tag-follower';
import {DebugCreatorComponent} from './debug-creator-hidden/debug-creator.component';

export const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'login', component: AuthComponent},
  {path: 'logout', component: AuthComponent},
  {path: 'tagsfinder', component: TagsFinderComponent, canActivate: [CanRead], data: {permission: 'TAG'}},
  {path: 'tagsfinder/follower/:id', component: TagFollowerComponent, data: {isPublic: true}},
  {path: 'complexes', component: ComplexComponent, canActivate: [CanRead], data: {permission: 'COMPLEX'}},
  {path: 'complexes/:complexId/buildings', component: BuildingComponent, canActivate: [CanRead], data: {permission: 'BUILDING'}},
  {path: 'anchors', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'ANCHOR'}},
  {path: 'tags', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'TAG'}},
  {path: 'sinks', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'SINK'}},
  {path: 'bluetooth', component: BluetoothComponent, canActivate: [CanRead], data: {permission: 'BLUETOOTH'}},
  {path: 'publications', component: PublishedListComponent, canActivate: [CanRead], data: {permission: 'PUBLICATION'}},
  {path: 'publications/:id', component: PublishedComponent, canActivate: [CanRead], data: {permission: 'PUBLICATION'}},
  {path: 'embedded/:id', component: PublishedComponent, data: {isPublic: true}},
  {path: 'analytics', component: AnalyticsComponent, canActivate: [CanRead], data: {permission: 'PUBLICATION'}},
  {path: 'analytics/:id', component: AnalyticsComponent, canActivate: [CanRead], data: {permission: 'PUBLICATION'}},
  {path: 'users', component: UserComponent, canActivate: [CanRead], data: {permission: 'USER'}},
  {path: 'changePassword', component: ChangePasswordComponent, canActivate: [CanRead]},
  {path: 'permissionGroups', component: PermissionGroupComponent, canActivate: [CanRead], data: {permission: 'PERMISSION_GROUP'}},
  {path: 'complexes/:complexId/buildings/:buildingId/floors', component: FloorComponent, canActivate: [CanRead], data: {permission: 'FLOOR'}},
  {
    path: 'complexes/:complexId/buildings/:buildingId/floors/:floorId/map',
    component: MapControllerComponent,
    canActivate: [CanRead],
    data: {permission: 'FLOOR'}
  },
  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: 'notSupportedBrowser', component: NotSupportedBrowserComponent},
  {path: 'hidden', component: DebugCreatorComponent, data: {permission: 'DEBUG'}},
  {path: '**', redirectTo: '/complexes'}
];
