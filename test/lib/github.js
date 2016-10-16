'use strict';

process.env.NODE_ENV = 'test';

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as github from '../../lib/github.js';

chai.use(chaiAsPromised);

describe('parseGist', () => {
  context('when the gist includes no JSON files', () => {
    const body = {
      files: {
        'something.txt': {
          content: '}',
          language: 'plain',
        }
      }
    };

    it('rejects with an error', () => {
      return expect(github.parseGist(body)).to.eventually
        .be.rejectedWith(Error, 'Gist includes no JSON files');
    });
  });

  context('when the gist includes a JSON file with invalid content', () => {
    const body = {
      files: {
        'config.json': {
          content: '}',
          language: 'JSON',
        }
      }
    };

    it('rejects with an error', () => {
      return expect(github.parseGist(body)).to.eventually
        .be.rejectedWith(Error, 'Gist file has invalid JSON content');
    });
  });

  context('when the gist includes a JSON file with valid content', () => {
    const body = {
      files: {
        'config.json': {
          content: "{ \"project_id\": 1234 }",
          language: 'JSON',
        }
      }
    };

    it('resolves with the content', () => {
      return expect(github.parseGist(body)).to.eventually
        .deep.equal({project_id: 1234});
    });
  });
});
