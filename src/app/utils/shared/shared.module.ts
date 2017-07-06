import {NgModule} from '@angular/core';
import {AppHasPermissionDirective} from '../directive/hasPermission.directive';

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
