import { TestBed, async } from '@angular/core/testing';
let chai = require('chai');

import { AppComplex } from './app.complex';
import {FormsModule} from "@angular/forms";

describe('AppComplex', () => {

  let component:AppComplex;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [
        AppComplex
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComplex);
    component = fixture.debugElement.componentInstance;

  }));

  it('should create component', async(() => {
    expect(component).toBeTruthy();
  }));

  describe('when we want to add complex', () => {
    it('should add it to complex list', () => {
      // given
      const newComplexName = 'some name';
      component.complexes = [];
      component.newComplexName = newComplexName;

      // when
      component.addComplex();

      // then
      chai.expect(component.complexes).to.deep.equal([{name: newComplexName}]);
    });
  });

  describe('when we want to remove complex', () => {
    it('should remove it from complex list', () => {
      // given
      const newComplexName = 'some name';
      const newComplexName2 = 'some different name';
      component.complexes = [{name: newComplexName}, {name: newComplexName2}];

      // when
      component.removeComplex(0);

      // then
      chai.expect(component.complexes).to.deep.equal([{name: newComplexName2}]);
    });
  });

  describe('when we edit and save complex with new name', () => {
    it('should change complex name on list', () => {
      // given
      const oldComplexName = 'some name';
      const newComplexName = 'some new name';
      component.complexes = [{name: oldComplexName}];

      // when
      component.editComplex(component.complexes[0]);
      component.newComplexName = newComplexName;
      component.saveComplex();

      // then
      chai.expect(component.complexes).to.deep.equal([{complex: newComplexName}]);
    });
  });

  describe('when we want to cancel complex editing', () => {
    it('disable edit mode and set empty complex name', () => {
      // given
      const newComplexName = 'some new';
      component.newComplexName = newComplexName;
      component.editMode = true;

      // when
      component.cancelEdit();

      // then
      chai.expect(component.editMode).to.be.false;
      chai.expect(component.newComplexName).to.equal('');
    });
  });

});
