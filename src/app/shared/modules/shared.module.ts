import {NgModule} from '@angular/core';
import {AppHasPermissionDirective} from '../utils/directive/hasPermission.directive';

@NgModule({
  declarations: [
    AppHasPermissionDirective
  ],
  exports: [
    AppHasPermissionDirective
  ]
})
export class SharedModule {
}
