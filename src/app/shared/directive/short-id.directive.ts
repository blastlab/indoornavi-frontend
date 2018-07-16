import {Attribute, Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';;

@Directive({
  selector: '[properShortId]',
  providers: [{provide: NG_VALIDATORS, useExisting: ShortIdValidator, multi: true}]
})
export class ShortIdValidator implements Validator {
  @Input() properShortId: string;
  private message: ValidationErrors = null;

  constructor( @Attribute('properShortId') public type: string) {}

  validate(control: AbstractControl): ValidationErrors {
    this.message = ShortIdValidator.checkIsNumber(control.value);
    if(this.message == null) {
      this.message = ShortIdValidator.checkIsInRange(this.properShortId, control.value);
    }
    return this.message;
  }

  static checkIsNumber(value: string): ValidationErrors {
    return /[0-9]/.test(value) ? null : {properShortId: 'device.shortId.mustBeNumber'}
  }

  static checkIsInRange(deviceType: string, value: string): ValidationErrors {
    if(deviceType=='tags'){
      return parseInt(value) < 32768 ? null : {properShortId: 'validator.input.shortIdOutOfRange'};
    }
    else {
      return (parseInt(value) > 32767 && parseInt(value) < 2147483648) ? null : {properShortId: 'validator.input.shortIdOutOfRange'};
    }
  }
}
