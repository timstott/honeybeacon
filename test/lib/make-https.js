"use strict";

import * as mh from "../../lib/make-https.js";
import { expect } from "chai";
import nock from "nock";

describe("makeGetRequest", () => {
  const apiBaseUrl = "https://hello.world";
  const api = nock(apiBaseUrl).matchHeader("User-Agent", "honeybeacon").get("/");

  afterEach(() => nock.cleanAll());

  context("when response is 200 with JSON", () => {
    beforeEach(() => {
      api.reply(200, {name: "Bob"});
    });

    it("resolves with parsed JSON content", () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .deep.equal({name: "Bob"});
    });
  });

  context("when response is 200 without JSON", () => {
    beforeEach(() => {
      api.reply(200, "Hello Bob");
    });

    it("rejects with an error", () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .be.rejectedWith(Error, "Unable to parse response as JSON");
    });
  });

  context("when response isn't 200", () => {
    beforeEach(() => {
      api.reply(500, "Internal Server Error");
    });

    it("rejects with an error", () => {
      return expect(mh.makeGetRequest(apiBaseUrl)).to.eventually
        .be.rejectedWith(Error, `Failed GET request ${apiBaseUrl} Responded with status code 500`);
    });
  });

  context("when optional headers are passed", () => {
    beforeEach(() => {
      api.matchHeader("Foo", "Bar").reply(200, {});
    });

    it("makes the call with the optional headers", () => {
      return expect(mh.makeGetRequest(apiBaseUrl, {"Foo": "Bar"})).to.be.fullfilled;
    });
  });
});
