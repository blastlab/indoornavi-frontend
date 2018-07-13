import {Attribute, Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({
  selector: '[properShortId]',
  providers: [{provide: NG_VALIDATORS, useExisting: ShortIdValidator, multi: true}]
})
export class ShortIdValidator implements Validator {

  @Input() properShortId: string;
  private message: any = null;

  constructor( @Attribute('properShortId') public type: string) {}

  validate(control: AbstractControl): { [key: string]: any } {
    this.type = this.properShortId;
    this.message = ShortIdValidator.isANumber(control.value);
    if(this.message == null) {
      this.message = this.isInRange(control.value);
    }
    return this.message;
  }

  static isANumber(value: string) :{ [key: string]: any } {
    return /[0-9]/.test(value) ? null : {properShortId: 'validator.input.idNotANumber'}
  }

  isInRange(value: string) :{ [key: string]: any } {
    if(this.type=='tags'){
      return parseInt(value) < 32768 ? null : {properShortId: 'validator.input.tagShortIdOutOfRange'};
    }
    else {
      return (parseInt(value) > 32767 && parseInt(value) < 2147483648) ? null : {properShortId: 'validator.input.shortIdOutOfRange'};
    }
  }
}
