import { Injectable } from '@angular/core';
import { MdSnackBar } from '@angular/material';

@Injectable()
export class ToastService {

  constructor(private snackBar: MdSnackBar) {
  }

  showSuccess(msg: string) {
    this.snackBar.open(msg, null, {
      duration: 2000
    });
  }

  showFailure(msg: string) {
    this.snackBar.open(msg, null, {
     duration: 2000,
     extraClasses: ['error-toast']
    });
  }
}
