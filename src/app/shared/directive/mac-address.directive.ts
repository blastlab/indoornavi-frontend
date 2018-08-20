import {Directive, ExistingProvider, forwardRef} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {ValidationErrors} from '@angular/forms/src/directives/validators';

const NAME_VALIDATOR: ExistingProvider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MacAddressDirective),
  multi: true
};

const PATTERN_MAC_ADDRESS = /^(([A-Fa-f0-9]{2}[:-]){5}[A-Fa-f0-9]{2}[,]?)+$/;

@Directive({
  selector: '[appProperMacAddress]',
  providers: [NAME_VALIDATOR]
})

export class MacAddressDirective implements Validator {
  private message: ValidationErrors = null;

  static checkIsMacAddress(value: string): ValidationErrors {
    if (PATTERN_MAC_ADDRESS.test(value)) {
      return null;
    }

    return { properMacAddress: 'validator.input.incorrectMacAddress' };
  }

  validate(control: AbstractControl): ValidationErrors {
    if (control.value) {
      this.message = MacAddressDirective.checkIsMacAddress(control.value);
      return this.message;
    }
    return null;
  }
}
