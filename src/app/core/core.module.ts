import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {FooterComponent} from './components/footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot()
  ],
  exports: [
    FooterComponent
  ],
  declarations: [
    FooterComponent
  ]
})
export class CoreModule { }
