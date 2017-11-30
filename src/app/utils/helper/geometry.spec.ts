
import {Geometry} from './geometry';

describe('Geometry', () => {
  it('should set proper slope value', () => {
    console.log(Geometry.getSlope(1, 2));
    expect(Geometry.getSlope(1,2)).to.equal(1);
  })
});
