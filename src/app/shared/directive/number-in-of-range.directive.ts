import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperNumberInOfRange]',
  providers: [{provide: NG_VALIDATORS, useExisting: NumberInOfRangeValidatorDirective, multi: true}]
})
export class NumberInOfRangeValidatorDirective implements Validator {
  @Input() appProperNumberInOfRange: string;
  @Input() translateKey: string;

  private message: ValidationErrors = null;

  static checkIsNumber(value: string, translateKey: string): ValidationErrors {
    return /^\d+$/.test(value) ? null : {properNumberInOfRange: `${translateKey}.mustBeNumber`}
  }

  static checkIsInRange(deviceType: string, value: string, translateKey: string): ValidationErrors {
    const val = parseInt(value, 10);

    if (deviceType === 'tags') {
      if (val < 32678) {
        return {
          properNumberInOfRange: `${translateKey}.numberInOfRange`
        };
      }
    } else {
      if (val > 32767 && val < 2147483648) {
        return null;
      } else {
        return {
          properNumberInOfRange: `${translateKey}.numberInOfRange`
        };
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = NumberInOfRangeValidatorDirective.checkIsNumber(control.value, this.translateKey);
    if (this.message == null) {
      this.message = NumberInOfRangeValidatorDirective.checkIsInRange(this.appProperNumberInOfRange, control.value, this.translateKey);
    }
    return this.message;
  }
}
