process.env.NODE_ENV = 'test';

import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';

describe('+', () => {
  it('adds two numbers', () => {
    expect(1 + 1).to.equal(2);
  });
});
