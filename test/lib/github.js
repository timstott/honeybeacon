"use strict";

import * as github from "../../lib/github.js";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";

chai.use(chaiAsPromised);

describe("fetchGist", () => {
  const api = nock("https://api.github.com")
        .matchHeader("Authorization", "token ABC123")
        .get("/gists/XXX");


  beforeEach(() => {
    process.env.CONFIG_GIST_ID = "XXX";
    process.env.GITHUB_TOKEN   = "ABC123";
  });

  afterEach(() => nock.cleanAll());

  context("when the gist is found on GitHub", () => {
    beforeEach(() => api.reply(200, {a: true}));

    it("resolves with the gist content", () => {
      return expect(github.fetchGist()).to.eventually.deep.equal({a: true});
    });
  });


  context("when the authorization token is invalid", () => {
    beforeEach(() => api.reply(401));

    it("reject with an error", () => {
      return expect(github.fetchGist()).to.eventually
        .be.rejectedWith(Error, "Failed to fetch gist");
    });
  });
});

describe("parseGist", () => {
  context("when the gist includes no JSON files", () => {
    const body = {
      files: {
        "something.txt": {
          content: "}",
          language: "plain",
        }
      }
    };

    it("rejects with an error", () => {
      return expect(github.parseGist(body)).to.eventually
        .be.rejectedWith(Error, "Gist includes no JSON files");
    });
  });

  context("when the gist includes a JSON file with invalid content", () => {
    const body = {
      files: {
        "config.json": {
          content: "}",
          language: "JSON",
        }
      }
    };

    it("rejects with an error", () => {
      return expect(github.parseGist(body)).to.eventually
        .be.rejectedWith(Error, "Gist file has invalid JSON content");
    });
  });

  context("when the gist includes a JSON file with valid content", () => {
    const body = {
      files: {
        "config.json": {
          content: "{ \"project_id\": 1234 }",
          language: "JSON",
        }
      }
    };

    it("resolves with the content", () => {
      return expect(github.parseGist(body)).to.eventually
        .deep.equal({project_id: 1234});
    });
  });
});
