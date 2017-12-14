import {Routes} from '@angular/router';
import {AuthComponent} from './auth/auth';
import {ComplexComponent} from './complex/complex';
import {CanRead} from './auth/auth.guard';
import {BuildingComponent} from './building/building';
import {UserComponent} from './user/user';
import {ChangePasswordComponent} from './user/changePassword/changePassword';
import {PermissionGroupComponent} from './user/permissionGroup/permissionGroup';
import {FloorComponent} from './floor/floor';
import {MapControllerComponent} from './map-editor/map.controller';
import {UnauthorizedComponent} from './unauthorized/unauthorized';
import {PublishedListComponent} from './publications/list/published-list';
import {PublishedComponent} from './map-viewer/published';
import {DeviceComponent} from './device/device';
import {AnalyticsComponent} from './published/analytics/analytics';

export const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'login', component: AuthComponent},
  {path: 'logout', component: AuthComponent},
  {path: 'complexes', component: ComplexComponent, canActivate: [CanRead], data: {permission: 'COMPLEX'}},
  {path: 'complexes/:complexId/buildings', component: BuildingComponent, canActivate: [CanRead], data: {permission: 'BUILDING'}},
  {path: 'anchors', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'ANCHOR'}},
  {path: 'tags', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'TAG'}},
  {path: 'sinks', component: DeviceComponent, canActivate: [CanRead], data: {permission: 'SINK'}},
  {path: 'maps', component: PublishedListComponent, canActivate: [CanRead], data: {permission: 'MAP'}},
  {path: 'maps/:id', component: PublishedComponent, canActivate: [CanRead], data: {permission: 'MAP'}},
  {path: 'embedded/:id', component: PublishedComponent},
  {path: 'maps/:id/analytics', component: AnalyticsComponent, canActivate: [CanRead], data: {permission: 'MAP'}},
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
  {path: '**', redirectTo: '/complexes'}
];
