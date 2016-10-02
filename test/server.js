process.env.NODE_ENV = 'test';
process.env.PORT     = 3333;

import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);

describe('/ping', () => {
  it('retuns pong', (done) => {
    chai.request(app)
      .get('/ping')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.text;
        expect(res.text).to.equal("pong\n");
        done();
      });
  });
});
