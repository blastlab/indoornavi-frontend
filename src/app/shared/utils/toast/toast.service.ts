import {Injectable} from '@angular/core';
import {MdSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ToastService {

  constructor(private snackBar: MdSnackBar, private translate: TranslateService) {
  }

  showSuccess(key: string, params?: Object) {
    this.translate.get(key, params).subscribe((value: string) => {
      this.snackBar.open(value, null, {
        duration: 2000
      });
    });
  }

  showFailure(key: string, params?: Object) {
    this.translate.get(key, params).subscribe((value: string) => {
      this.snackBar.open(value, null, {
        duration: 4000,
        extraClasses: ['error-toast']
      });
    });
  }

  forceHide() {
    if (this.snackBar._openedSnackBarRef) {
      this.snackBar._openedSnackBarRef.dismiss();
    }
  }
}
