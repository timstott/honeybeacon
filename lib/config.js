"use strict";
import winston from "winston";

const isProduction = () => {
  return process.env.NODE_ENV === "production";
};

const isTest = () => {
  return process.env.NODE_ENV === "test";
};

const env = {
  LOG_LEVEL:   (process.env.LOG_LEVEL || (isProduction() && "info") || "debug"),
  SERVER_PORT: (process.env.PORT || (isTest() && 3333) || 3000),
};

const transport = () => {
  if (isTest()) {
    return new (winston.transports.File)({
      filename: "log/test.log",
      json: false,
    });
  } else {
    return new (winston.transports.Console)();
  }
};
const logger = new (winston.Logger)({
  level: env.LOG_LEVEL,
  transports: [transport()]
});

export { env, logger };
