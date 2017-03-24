import {TestBed, async} from '@angular/core/testing';
const chai = require('chai');

import {ComplexComponent} from './complex';
import {FormsModule} from '@angular/forms';
import {ComplexService} from './complex.service';
import {Observable} from 'rxjs/Observable';
import Spy = jasmine.Spy;

describe('ComplexComponent', () => {

  let component: ComplexComponent;
  let complexService: ComplexService;
  let spy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        ComplexComponent
      ],
      providers: [
        ComplexService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ComplexComponent);
    component = fixture.debugElement.componentInstance;
    complexService = fixture.debugElement.injector.get(ComplexService);

    spy = spyOn(complexService, 'getComplexes').and.returnValue(Observable.create([]));
  }));

  it('should create component', async(() => {
    expect(component).toBeTruthy();
    expect(spy.calls.any()).toBe(false);
  }));

  describe('when we want to add complex', () => {
    it('should add it to complex list', () => {
      // given
      const newComplexName = 'some name';
      component.complexes = [];

      // when
      component.addComplex({name: newComplexName}, true);

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
      component.editComplex({name: newComplexName});

      // then
      chai.expect(component.complexes).to.deep.equal([{complex: newComplexName}]);
    });
  });

  // TODO: jak już będziemy mieli edycję to trzeba będzie to odkomentować i poprawić, sprawdzając czy przypadkiem po anulowaniu edycji nie zaaktualizował się model (ważne)
  // describe('when we want to cancel complex editing', () => {
  //   it('disable edit mode and set empty complex name', () => {
  //     // given
  //     const newComplexName = 'some new';
  //     component.editMode = true;
  //
  //     // when
  //     component.cancelEdit();
  //
  //     // then
  //     chai.expect(component.editMode).to.be.false;
  //     chai.expect(component.newComplexName).to.equal('');
  //   });
  // });

});
