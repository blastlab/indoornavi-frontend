import {Helper} from './helper';

describe('Helper', () => {
  beforeEach(() => {
    // nothing to spyOn
  });
  it('should create deep copy of given object', () => {
    // given
    const obj = {value: 'deepCopy'};

    // when
    const objDeepCopy = Helper.deepCopy(obj);

    // then
    expect(objDeepCopy).not.toBe(obj);
  });

  it('created copy of given object should contain data of copied object', () => {
    // given
    const obj = {value: 'deepCopy'};

    // when
    const objDeepCopy = Helper.deepCopy(obj);

    // then
    expect(objDeepCopy).toEqual(obj);
    expect(objDeepCopy).not.toEqual({value: 'shallowCopy'});
  });

});
