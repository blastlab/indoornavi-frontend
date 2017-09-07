import {Routes} from '@angular/router';
import {AuthComponent} from './auth/auth';
import {ComplexComponent} from './complex/complex';
import {CanRead} from './auth/auth.guard';
import {BuildingComponent} from './building/building';
import {AnchorComponent} from './anchor/anchor';
import {TagComponent} from './tag/tag';
import {UserComponent} from './user/user';
import {ChangePasswordComponent} from './user/changePassword';
import {PermissionGroupComponent} from './user/permissionGroup';
import {FloorComponent} from './floor/floor';
import {MapControllerComponent} from './map/map.controller';
import {UnauthorizedComponent} from './utils/unauthorized/unauthorized';
import {PublishedListComponent} from './published/list/published-list';
import {PublishedComponent} from './published/published';

export const appRoutes: Routes = [
  {path: '', redirectTo: '/complexes', pathMatch: 'full'},
  {path: 'login', component: AuthComponent},
  {path: 'logout', component: AuthComponent},
  {path: 'complexes', component: ComplexComponent, canActivate: [CanRead], data: {permission: 'COMPLEX'}},
  {path: 'complexes/:complexId/buildings', component: BuildingComponent, canActivate: [CanRead], data: {permission: 'BUILDING'}},
  {path: 'anchors', component: AnchorComponent, canActivate: [CanRead], data: {permission: 'ANCHOR'}},
  {path: 'tags', component: TagComponent, canActivate: [CanRead], data: {permission: 'TAG'}},
  {path: 'maps', component: PublishedListComponent, canActivate: [CanRead], data: {permission: 'MAP'}},
  {path: 'public/:id', component: PublishedComponent, canActivate: [CanRead]},
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
