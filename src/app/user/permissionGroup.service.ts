import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Permission, PermissionGroup} from './user.type';

@Injectable()
export class PermissionGroupService {

  private static permission_url = 'permissions/';
  private static group_url = 'permissionGroups/';

  constructor(private httpService: HttpService) {
  }

  getPermissions(): Observable<Permission[]> {
    return this.httpService.doGet(PermissionGroupService.permission_url);
  }

  save(permissionGroup: PermissionGroup): Observable<PermissionGroup> {
    return (permissionGroup.id != null ?
        this.httpService.doPut(PermissionGroupService.group_url + permissionGroup.id, permissionGroup) :
        this.httpService.doPost(PermissionGroupService.group_url, permissionGroup)
    );
  }

  remove(id: number): Observable<any> {
    return this.httpService.doDelete(PermissionGroupService.group_url + id);
  }

  getPermissionGroups(): Observable<PermissionGroup[]> {
    return this.httpService.doGet(PermissionGroupService.group_url);
  }
}
