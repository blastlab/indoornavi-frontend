import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({
  selector: '[properLongId]',
  providers: [{provide: NG_VALIDATORS, useExisting: LongIdValidator, multi: true}]
})
export class LongIdValidator implements Validator {

  @Input() properLongId: number;
  private message: any = null;

  validate(control: AbstractControl): { [key: string]: any } {
    this.message = LongIdValidator.isANumber(control.value);
    if(this.message == null) {
      this.message = LongIdValidator.isInRange(control.value);
    }
    return this.message;
  }

  static isANumber(value: string) :{ [key: string]: any } {
    return /[0-9]/.test(value) ? null : {properLongId: 'validator.input.idNotANumber'}
  }

  static isInRange(value: string) :{ [key: string]: any } {
    return  parseInt(value) < 9223372036854775807 ? null : {properLongId: 'validator.input.longIdOutOfRange'}
  }
}
