'use strict';

import * as mh from '../../lib/make-https.js';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';

describe('makeGetRequest', () => {
  const apiBaseUrl = 'https://hello.world';
  const api = nock(apiBaseUrl).get('/');

  context('when response is 200 with JSON', () => {
    beforeEach(() => {
      api.reply(200, {name: 'Bob'});
    });

    it('resolves with parsed JSON content', () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .deep.equal({name: 'Bob'});
    });
  });

  context('when response is 200 without JSON', () => {
    beforeEach(() => {
      api.reply(200, 'Hello Bob');
    });

    it('rejects with an error', () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .be.rejectedWith(Error, 'Unable to parse response as JSON')
    });
  });

  context("when response isn't 200", () => {
    beforeEach(() => {
      api.reply(500);
    });

    it('rejects with an error', () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .be.rejectedWith(Error, `Failed GET request ${apiBaseUrl} Responded with status code 500`)
    });
  });
});
