'use strict';

import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import nock from 'nock';
const util = require('util')
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

describe('/faults', () => {
  const githubHeaders = { 'User-Agent': 'honeybeacon' }
  const githubAPI = nock('https://api.github.com', { reqheaders: githubHeaders });
  const subject = chai.request(app);

  afterEach(() => nock.cleanAll());

  context('when the gist cannot be found on GitHub', () => {
    beforeEach(() => {
      process.env.CONFIG_GIST_ID = 'unknown-gist-id';

      githubAPI.get('/gists/unknown-gist-id').reply(404, {
        "message": "Not Found",
        "documentation_url": "https://developer.github.com/v3"
      });
    });

    it('responds as no faults', (done) => {
      subject.get('/faults').end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.text;
        expect(res.text).to.equal("Failed to fetch gist\n0\n");
        done();
      });
    });
  });

  context('when the gist is found on GitHub', () => {
    const hbAPI = nock('https://app.honeybadger.io/v2');
    const projectWithFaults = { projectId: 67890, query: "" };
    const projectWithNoFaults = {
      projectId: 12345,
      query: "tag:MKRT environment:production",
    };
    const otherProjectWithNoFaults = {
      projectId: 54321,
      query: "environment:development",
    };

    let ctxt = {};

    beforeEach(() => {
      ctxt.githubGist = () => {
        return {
          files: {
            'config.json': {
              content: JSON.stringify(ctxt.githubGistFileContext),
              language: 'JSON',
            }
          }
        }
      };

      process.env.CONFIG_GIST_ID = 'a21c4ea4t40f15736c52';
      process.env.HB_TOKEN = 'XYZ';

      githubAPI.get('/gists/a21c4ea4t40f15736c52').reply(200, ctxt.githubGist);
      hbAPI.get('/projects/12345/faults')
        .query({auth_token: 'XYZ', q: 'tag:MKRT environment:production'})
        .reply(200, { results: []} );
      hbAPI.get('/projects/54321/faults')
        .query({auth_token: 'XYZ', q: 'environment:development'})
        .reply(200, { results: []} );
    });

    context('when faults are found in some projects', () => {
      beforeEach(() => {
        ctxt.githubGistFileContext = {
          projects: [
            projectWithNoFaults,
            projectWithFaults,
            otherProjectWithNoFaults,
          ]
        };

        hbAPI.get('/projects/67890/faults')
          .query({auth_token: 'XYZ', q: ''})
          .reply(200, { results: [{}]} );
      });

      it('responds with faults found', (done) => {
        subject.get('/faults').end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.text;
          expect(res.text).to.equal("Faults found\n1\n");
          done();
        });
      });

      it('makes all external calls', (done) => {
        subject.get('/faults').end(() => {
          expect(githubAPI.isDone()).to.be.true;
          expect(hbAPI.isDone()).to.be.true;
          done();
        });
      });
    });

    context('when no faults are found in projects', () => {
      beforeEach(() => {
        ctxt.githubGistFileContext = {
          projects: [
            projectWithNoFaults,
            otherProjectWithNoFaults,
          ]
        };
      });

      it('responds with no faults found', (done) => {
        subject.get('/faults').end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.text;
          expect(res.text).to.equal("No faults found\n0\n");
          done();
        });
      });

      it('makes all external calls', (done) => {
        subject.get('/faults').end(() => {
          expect(githubAPI.isDone()).to.be.true;
          expect(hbAPI.isDone()).to.be.true;
          done();
        });
      });
    });
  });
});
