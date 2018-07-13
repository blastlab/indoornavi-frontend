import {
  Directive,
  ExistingProvider,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {ValidationErrors} from '@angular/forms/src/directives/validators';

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
  private message : ValidationErrors = null;


  ngOnChanges(changes: SimpleChanges) {
    const change = changes['properNameValidator'];
    if (change) {
      this.validate(change.currentValue)
    }
  }

  validate(control: AbstractControl): ValidationErrors {

    if(control.value){
      this.message = ProperNameDirective.checkContent(control.value);
      if(!this.message) {
        this.message = ProperNameDirective.checkLength(control.value);
      }
      return this.message;
    }
    return null;
  }

  static checkLength(value: string): ValidationErrors {
    if(value.length < 4) {
      return {properName: "validator.input.min"};
    }
    if (value.length > 100) {
      return {properName: 'validator.input.max'};
    }
    return null;
  }

  static checkContent(value: string): ValidationErrors {
      if (/[^ -~)]/.test(value) || (!value.replace(/\s/g, '').length)) {
        return {properName: 'validator.input.illegalCharacter'};
      }
    return null;
  }
}
