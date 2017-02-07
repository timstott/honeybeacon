"use strict";

import * as github from "./lib/github.js";
import * as hb from "./lib/honeybadger.js";
import { env, logger }  from "./lib/config.js";
import express from "express";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());


const noFaultsFoundCode = 0;
const faultsFoundCode   = 1;

app.get("/ping", (_, res) => {
  res.set("Content-Type", "text/plain");
  res.send("pong\n");
});

app.post("/devices", (req, res) => {
  logger.info(req.body);
  res.json(req.body);
});

app.get("/faults", (req, res) => {
  res.set("Content-Type", "text/plain");
  const deviceId    = req.query.deviceId;

  if (!deviceId) {
    res.status(400).send(`Missing query param deviceId\n${noFaultsFoundCode}\n`);
    return;
  }
  const hbAuthToken = process.env.HB_TOKEN;

  github.fetchGist().then(github.parseGist).then((data) => {
    const projectsHaveFaults = data.projects.map((p) => {
      const projectConfig = Object.assign({ authToken: hbAuthToken }, p);
      return hb.projectHasFaults(projectConfig);
    });

    Promise.all(projectsHaveFaults).then((data) => {
      const faultsFound = data.includes(true);

      if (faultsFound) {
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
  app.listen(env.SERVER_PORT, () => {
    logger.info(`Honeybeacon listening on port ${env.SERVER_PORT}`);
  });
}

module.exports = app;
