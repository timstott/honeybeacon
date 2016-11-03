"use strict";

import { makeGetRequest } from "./make-https.js";
import querystring from "querystring";

const HONEYBADGER_ENDPOINT = "https://app.honeybadger.io/v2/projects";

/* Resolves with true when a project has faults or false when none.
 * Expected projectConfig:
 * {
 *   authToken: xxx,
 *   projectId: xxx,
 *   query:     xxx,
 * }
 */
export const projectHasFaults = (projectConfig) => {
  return new Promise((resolve, reject) => {
    const { authToken, projectId, query } = projectConfig;
    const queryString = querystring.stringify({
      auth_token: authToken,
      q: query,
    });
    const url = `${HONEYBADGER_ENDPOINT}/${projectId}/faults?${queryString}`;

    makeGetRequest(url).then((data) => {
      const { results } = data;
      if (!Array.isArray(results)) {
        reject(new Error("Unexpected HoneyBadger response"));
      }
      resolve(results.length > 0);
    }).catch((err) => reject(err));
  });
};
