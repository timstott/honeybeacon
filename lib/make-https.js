import https from "https";
import url from "url";
import { logger } from "./config.js";

const DEFAULT_HEADERS = {
  "User-Agent": "honeybeacon",
};

export const makeGetRequest = (rawUrl, optionalHeaders) => {
  const headers = Object.assign({}, optionalHeaders, DEFAULT_HEADERS);
  const urlOptions = Object.assign({ headers: headers }, url.parse(rawUrl));

  return new Promise((resolve, reject) => {
    const request = https.get(urlOptions, (response) => {
      const { statusCode } = response;
      const body = [];
      response.on("data", (chunk) => body.push(chunk));
      response.on("end", () => {
        if (statusCode != 200) {
          const errorMessage = `Failed GET request ${rawUrl} Responded with status code ${statusCode}`;
          logger.error(errorMessage, { response: body.join("")});
          reject(new Error(errorMessage));
        }
        try {
          resolve(JSON.parse(body.join("")));
        } catch(_) {
          reject(new Error("Unable to parse response as JSON"));
        }
      });
    });
    request.on("error", (err) => reject(err));
  });
};
