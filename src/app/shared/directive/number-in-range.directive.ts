import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperNumberInRange]',
  providers: [{provide: NG_VALIDATORS, useExisting: NumberInRangeValidatorDirective, multi: true}]
})
export class NumberInRangeValidatorDirective implements Validator {
  @Input() appProperNumberInRange: string;
  @Input() translateKey: string;

  private message: ValidationErrors = null;

  static checkIsNumber(value: string, translateKey: string): ValidationErrors {
    return /^\d+$/.test(value) ? null : {properNumberInRange: `${translateKey}.mustBeNumber`}
  }

  static checkIsInRange(deviceType: string, value: string, translateKey: string): ValidationErrors {
    const val = parseInt(value, 10);

    if (deviceType === 'tags') {
      if (val > 32767) {
        return {
          properNumberInRange: `${translateKey}.numberInRange`
        };
      }
    } else {
      if (val < 32768 || val >= 2147483648) {
        return {
          properNumberInRange: `${translateKey}.numberInRange`
        };
      }
    }

    return null;
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = NumberInRangeValidatorDirective.checkIsNumber(control.value, this.translateKey);
    if (this.message == null) {
      this.message = NumberInRangeValidatorDirective.checkIsInRange(this.appProperNumberInRange, control.value, this.translateKey);
    }
    return this.message;
  }
}
