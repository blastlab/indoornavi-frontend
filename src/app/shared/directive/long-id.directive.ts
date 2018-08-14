import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appProperLongId]',
  providers: [{provide: NG_VALIDATORS, useExisting: LongIdValidatorDirective, multi: true}]
})
export class LongIdValidatorDirective implements Validator {

  @Input() properLongId: number;
  private message: ValidationErrors = null;

  static checkIsNumber(value: string): ValidationErrors {
    return /[0-9]/.test(value) ? null : {properLongId: 'validator.input.idNotANumber'}
  }

  static checkIsInRange(value: string): ValidationErrors {
    return parseInt(value, 10) < 9223372036854775807 ? null : {properLongId: 'validator.input.longIdOutOfRange'}
  }

  validate(control: AbstractControl): ValidationErrors {
    this.message = LongIdValidatorDirective.checkIsNumber(control.value);
    if (this.message == null) {
      this.message = LongIdValidatorDirective.checkIsInRange(control.value);
    }
    return this.message;
  }
}
