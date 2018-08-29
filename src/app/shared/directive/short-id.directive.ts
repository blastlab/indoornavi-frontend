import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperShortId]',
  providers: [{provide: NG_VALIDATORS, useExisting: ShortIdValidatorDirective, multi: true}]
})
export class ShortIdValidatorDirective implements Validator {
  @Input() appProperShortId: string;
  @Input() translateKey: string;

  private message: ValidationErrors = null;

  static checkIsNumber(value: string, translateKey: string): ValidationErrors {
    return /[0-9]/.test(value) ? null : {properShortId: `${translateKey}.mustBeNumber`}
  }

  static checkIsInRange(deviceType: string, value: string, translateKey: string): ValidationErrors {
    if (deviceType === 'tags') {
      return parseInt(value, 10) < 32768 ? null : {properShortId: `${translateKey}.shortIdOutOfRange`};
    } else {
      return (parseInt(value, 10) > 32767 && parseInt(value, 10) < 2147483648) ? null : {properShortId: `${translateKey}.shortIdOutOfRange`};
    }
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = ShortIdValidatorDirective.checkIsNumber(control.value, this.translateKey);
    if (this.message == null) {
      this.message = ShortIdValidatorDirective.checkIsInRange(this.appProperShortId, control.value, this.translateKey);
    }
    return this.message;
  }
}
