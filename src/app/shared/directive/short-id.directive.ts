import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperShortId]',
  providers: [{provide: NG_VALIDATORS, useExisting: ShortIdValidatorDirective, multi: true}]
})
export class ShortIdValidatorDirective implements Validator {
  @Input() appProperShortId: string;
  private message: ValidationErrors = null;

  static checkIsNumber(value: string): ValidationErrors {
    return /[0-9]/.test(value) ? null : {properShortId: 'device.shortId.mustBeNumber'}
  }

  static checkIsInRange(deviceType: string, value: string): ValidationErrors {
    if (deviceType === 'tags') {
      return parseInt(value, 10) < 32768 ? null : {properShortId: 'validator.input.shortIdOutOfRange'};
    } else {
      return (parseInt(value, 10) > 32767 && parseInt(value, 10) < 2147483648) ? null : {properShortId: 'validator.input.shortIdOutOfRange'};
    }
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = ShortIdValidatorDirective.checkIsNumber(control.value);
    if (this.message == null) {
      this.message = ShortIdValidatorDirective.checkIsInRange(this.appProperShortId, control.value);
    }
    return this.message;
  }
}
