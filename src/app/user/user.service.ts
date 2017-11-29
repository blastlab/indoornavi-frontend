import {Injectable} from '@angular/core';
import {User} from './user.type';
import {HttpService} from '../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class UserService {
  private url = 'users/';

  constructor(protected httpService: HttpService) {
  }

  create(user: User): Observable<User> {
    return this.httpService.doPost(this.url, user);
  }

  update(user: User): Observable<User> {
    return this.httpService.doPut(this.url + user.id, user);
  }

  getUsers(): Observable<User[]> {
    return this.httpService.doGet(this.url);
  }

  remove(id: number): Observable<void> {
    return this.httpService.doDelete(this.url + id);
  }

  changePassword(passwords: { oldPassword: string; newPassword: string }): Observable<void> {
    return this.httpService.doPut(this.url + 'changePassword', passwords);
  }
}
