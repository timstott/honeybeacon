'use strict';

import { makeGetRequest } from './make-https.js';

export const fetchGist = () => {
  return new Promise((resolve, reject) => {
    const gistId  = process.env.CONFIG_GIST_ID;
    const gistUrl = `https://api.github.com/gists/${gistId}`;

    makeGetRequest(gistUrl)
      .catch(err => { reject(new Error('Failed to fetch gist')); })
      .then(data => resolve(data));
  });
};

export const parseGist = (body) => {
  return new Promise((resolve, reject) => {

    const configFile = Object.keys(body.files)
          .map((fileName) => body.files[fileName])
          .filter((file) => file.language === 'JSON')[0];


    if(!configFile) {
      reject(new Error('Gist includes no JSON files'));
    }

    let config;
    try {
      config = JSON.parse(configFile.content);
    } catch(_) {
      reject(new Error('Gist file has invalid JSON content'));
    }

    resolve(config);
  });
};
