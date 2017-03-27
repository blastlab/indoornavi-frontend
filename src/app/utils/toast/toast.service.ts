import { Injectable } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ToastService {

  constructor(private snackBar: MdSnackBar, private translate: TranslateService) {
  }

  showSuccess(key: string) {
    this.translate.get(key).subscribe((value: string) => {
      this.snackBar.open(value, null, {
        duration: 2000
      });
    });
  }

  showFailure(key: string) {
    this.translate.get(key).subscribe((value: string) => {
      this.snackBar.open(value, null, {
        duration: 2000,
        extraClasses: ['error-toast']
      });
    });
  }
}
