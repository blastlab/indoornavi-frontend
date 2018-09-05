import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperNumberOutOfRange]',
  providers: [{provide: NG_VALIDATORS, useExisting: NumberOutOfRangeValidatorDirective, multi: true}]
})
export class NumberOutOfRangeValidatorDirective implements Validator {
  @Input() appProperNumberOutOfRange: string;
  @Input() translateKey: string;

  private message: ValidationErrors = null;

  static checkIsNumber(value: string, translateKey: string): ValidationErrors {
    return /^\d+$/.test(value) ? null : {properNumberOutOfRange: `${translateKey}.mustBeNumber`}
  }

  static checkIsInRange(deviceType: string, value: string, translateKey: string): ValidationErrors {
    const val = parseInt(value, 10);

    if (deviceType === 'tags') {
      if (val < 32678) {
        return {
          properNumberOutOfRange: `${translateKey}.numberOutOfRange`
        };
      }
    } else {
      if (val > 32767 && val < 2147483648) {
        return null;
      } else {
        return {
          properNumberOutOfRange: `${translateKey}.numberOutOfRange`
        };
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = NumberOutOfRangeValidatorDirective.checkIsNumber(control.value, this.translateKey);
    if (this.message == null) {
      this.message = NumberOutOfRangeValidatorDirective.checkIsInRange(this.appProperNumberOutOfRange, control.value, this.translateKey);
    }
    return this.message;
  }
}
