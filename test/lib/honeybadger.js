"use strict";

import * as hb from "../../lib/honeybadger.js";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";

chai.use(chaiAsPromised);

describe("projectHasFaults", () => {
  const hbAPI = nock("https://app.honeybadger.io/v2");
  const projectConfig = {
    authToken: "ABCD",
    lastFaultReportedAt: 123456789,
    projectId: 1234,
    query: "tag:MARKETING environment:production",
  };

  afterEach(() => nock.cleanAll());

  context("when faults are detected", () => {
    beforeEach(() => {
      hbAPI.get("/projects/1234/faults")
        .query({
          auth_token: "ABCD",
          occurred_after: 123456789,
          q: "tag:MARKETING environment:production"
        })
        .reply(200, {
          "results": [{}, {}]
        });
    });

    it("resolves with true", (done) => {
      expect(hb.projectHasFaults(projectConfig)).to.eventually.equal(true).then(() => {
        expect(hbAPI.isDone()).to.be.true;
        done();
      });
    });
  });

  context("when no faults are detected", () => {
    // TODO: extract common beforeEach
    beforeEach(() => {
      hbAPI.get("/projects/1234/faults")
        .query({
          auth_token: "ABCD",
          occurred_after: 123456789,
          q: "tag:MARKETING environment:production"
        })
        .reply(200, {
          "results": []
        });
    });

    it("resolves with false", (done) => {
      expect(hb.projectHasFaults(projectConfig)).to.eventually.equal(false).then(() => {
        expect(hbAPI.isDone()).to.be.true;
        done();
      });
    });
  });
});
