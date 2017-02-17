"use strict";

import { Sequelize } from "sequelize";
import { env, logger }  from "./config.js";

const sequelize = new Sequelize(env.DATABASE_URL, {
  logging: logger.debug
});

const Devices = sequelize.define("devices", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  configuration: Sequelize.JSONB,
});

const models = {
  Devices: Devices,
};

export { sequelize, models };
