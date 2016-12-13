"use strict";

import * as github from "./lib/github.js";
import * as hb from "./lib/honeybadger.js";
import * as store from "./lib/store.js";
import express from "express";
import logger from "winston";
const app = express();
const serverPort = process.env.PORT || 3000;

const noFaultsFoundCode = 0;
const faultsFoundCode   = 1;

app.get("/ping", (_, res) => {
  res.set("Content-Type", "text/plain");
  res.send("pong\n");
});

app.get("/faults", (req, res) => {
  res.set("Content-Type", "text/plain");
  const deviceId    = req.query.deviceId;

  if (!deviceId) {
    res.status(400).send(`Missing query param deviceId\n${noFaultsFoundCode}\n`);
    return;
  }
  const hbAuthToken = process.env.HB_TOKEN;
  let lastFaultReportedAt;

  store.touchLastRequestedAtByDeviceId(deviceId);

  store.findLastFaultReportedAtByDeviceId(deviceId)
    .then((data) => {
      lastFaultReportedAt = data || store.unixTimestamp();
    })
    .then(github.fetchGist)
    .then(github.parseGist).then((data) => {
      const projectsHaveFaults = data.projects.map((p) => {
        const projectConfig = Object.assign(
          { authToken: hbAuthToken, lastFaultReportedAt: lastFaultReportedAt }, p);
        return hb.projectHasFaults(projectConfig);
      });

      Promise.all(projectsHaveFaults).then((data) => {
        const faultsFound = data.includes(true);

        if (faultsFound) {
          store.touchLastFaultReportedAtByDeviceId(deviceId);
          res.send(`Faults found\n${faultsFoundCode}\n`);
        } else {
          res.send(`No faults found\n${noFaultsFoundCode}\n`);
        }
      }).catch(() => {
        res.status(500).send(`No faults found\n${noFaultsFoundCode}\n`);
      });
    }).catch(err => {
      res.status(500).send(`${err.message}\n${noFaultsFoundCode}\n`);
    });
});

if (!module.parent) {
  app.listen(serverPort, () => {
    logger.info(`Honeybeacon listening on port ${serverPort}`);
  });
}

module.exports = app;
