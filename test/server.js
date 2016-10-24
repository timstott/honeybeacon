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
  const githubAPI = nock('https://api.github.com');
  const hbAPI = nock('https://app.honeybadger.io/v2');
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
      subject.get('/devices').end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal("Failed to fetch gist\n0\n");
          done();
        });
    });
  });

  context('when faults are found in one project', () => {
    const githubGistFileContext = {
      projects: [
        {
          projectId: 12345,
          query: "tag:MKRT environment:production",
        }
      ]
    };
    const githubGist = {
      files: {
        'config.json': {
          content: JSON.stringify(githubGistFileContext),
          language: 'JSON',
        }
      }
    };

    beforeEach(() => {
      process.env.CONFIG_GIST_ID = 'a21c4ea4t40f15736c52';
      process.env.HB_TOKEN = 'XYZ';

      githubAPI.get('/gists/a21c4ea4t40f15736c52').reply(200, githubGist);
      hbAPI.get('/projects/12345/faults')
        .query({auth_token: 'XYZ', q: 'tag:MKRT environment:production'})
        .reply(200, { results: [{}]} );
    });

    it('responds with faults detected', (done) => {
      subject.get('/devices').end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Faults found\n1\n");
        done();
      });
    });
  });


  context('when faults are found in some projects', () => {
    const githubGistFileContext = {
      projects: [
        {
          projectId: 12345,
          query: "tag:MKRT environment:production",
        },
        {
          projectId: 67890,
          query: "",
        },
        {
          projectId: 54321,
          query: "environment:development",
        },
      ]
    };
    const githubGist = {
      files: {
        'config.json': {
          content: JSON.stringify(githubGistFileContext),
          language: 'JSON',
        }
      }
    };

    beforeEach(() => {
      process.env.CONFIG_GIST_ID = 'a21c4ea4t40f15736c52';
      process.env.HB_TOKEN = 'XYZ';

      githubAPI.get('/gists/a21c4ea4t40f15736c52').reply(200, githubGist);
      hbAPI.get('/projects/12345/faults')
        .query({auth_token: 'XYZ', q: 'tag:MKRT environment:production'})
        .reply(200, { results: []} );
      hbAPI.get('/projects/67890/faults')
        .query({auth_token: 'XYZ', q: ''})
        .reply(200, { results: [{}]} );
      hbAPI.get('/projects/54321/faults')
        .query({auth_token: 'XYZ', q: 'environment:development'})
        .reply(200, { results: []} );
    });

    it('responds with faults detected', (done) => {
      subject.get('/devices').end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Faults found\n1\n");
        done();
      });
    });
  });
});
