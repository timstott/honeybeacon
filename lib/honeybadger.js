'use strict';

import https from 'https';
import querystring from 'querystring';

const HONEYBADGER_ENDPOINT = 'https://app.honeybadger.io/v2/projects';

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
    const url = `${HONEYBADGER_ENDPOINT}/${projectId}/faults?${queryString}`

    makeGetRequest(url).then((data) => {
      // TODO: move JSON.parse to makeGetRequest
      const { results } = JSON.parse(data);

      resolve(Array.isArray(results) && results.length > 0);
    }).catch((err) => reject(err));
  });
};

// TODO: extract to common module
const makeGetRequest = (url) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      const {statusCode} = response;

      if (statusCode != 200) {
        const errorMessage = `Failed GET request ${url}. Response status code ${statusCode}`;
        // TODO: replace with logger
        console.log(errorMessage);
        reject(new Error(errorMessage));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
};
