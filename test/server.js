'use strict';

process.env.NODE_ENV = 'test';
process.env.PORT     = 3333;

import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import nock from 'nock';

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

describe('/devices', () => {
  const api = nock('https://api.github.com');
  const request = chai.request(app).get('/devices');

  afterEach(() => nock.cleanAll());

  context('when the gist cannot be found on GitHub', () => {
    beforeEach(() => {
      process.env.CONFIG_GIST_ID = 'unknown-gist-id';

      api.get('/gists/unknown-gist-id').reply(404, {
        "message": "Not Found",
        "documentation_url": "https://developer.github.com/v3"
      });
    });

    it('responds as no faults', (done) => {
        request.end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal("Failed to fetch gist\n0\n");
          done();
        });
    });
  });
});
