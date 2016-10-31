'use strict';

import logger from 'winston';

process.env.NODE_ENV = 'test';
process.env.PORT     = 3333;

logger.clear()
logger.add(logger.transports.File, {
  filename: 'log/test.log',
  json: false,
  level: 'debug',
});
