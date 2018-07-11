import {Directive, ExistingProvider, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators} from '@angular/forms';

const NAME_VALIDATOR : ExistingProvider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => ProperNameDirective),
  multi: true
};

@Directive({
  selector: '[properNameValidator]',
  providers: [NAME_VALIDATOR]})
export class ProperNameDirective implements Validator, OnChanges  {
  @Input() inputValidator: string;
  private validator = Validators.nullValidator;
  message : any = null;


  ngOnChanges(changes: SimpleChanges) {
    const change = changes['properNameValidator'];
    if (change) {
      this.validator = this.validate(change.currentValue)
    }
  }

  validate(control: AbstractControl): ValidatorFn {

    if(control.value){
      this.message = ProperNameDirective.inputContent(control.value);
      if(!this.message) {
        this.message = ProperNameDirective.inputLength(control.value);
      }
      return this.message;
    }
    return null;
  }

  static inputLength(value: string) :{[key: string]: any} {
    if(value.length < 4) {
      return {properName: "validator.input.min"};
    }
    if (value.length > 100) {
      return {properName: 'validator.input.max'};
    }
    return null;
  }

  static inputContent(value: string): {[key: string]: any} {
      if (/[ \t\r\n\v\f]/.test(value)) {
        return {properName: 'validator.input.illegalCharacter'};
      }
    return null;
  }
}
