import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[properLongId]',
  providers: [{provide: NG_VALIDATORS, useExisting: LongIdValidator, multi: true}]
})
export class LongIdValidator implements Validator {

  @Input() properLongId: number;
  private message: ValidationErrors = null;

  validate(control: AbstractControl): ValidationErrors {
    this.message = LongIdValidator.checkIsNumber(control.value);
    if(this.message == null) {
      this.message = LongIdValidator.checkIsInRange(control.value);
    }
    return this.message;
  }

  static checkIsNumber(value: string): ValidationErrors {
    return /[0-9]/.test(value) ? null : {properLongId: 'validator.input.idNotANumber'}
  }

  static checkIsInRange(value: string): ValidationErrors {
    return  parseInt(value) < 9223372036854775807 ? null : {properLongId: 'validator.input.longIdOutOfRange'}
  }
}
