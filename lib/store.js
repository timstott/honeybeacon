"use strict";

const unixTimestamp = () => { return Math.floor(Date.now() / 1000); };

let store = {};

const touchLastRequestedAtByDeviceId = (deviceId) => {
  return touchKeyByDeviceId("lastRequestedAt", deviceId);
};

const touchLastFaultReportedAtByDeviceId = (deviceId) => {
  return touchKeyByDeviceId("lastFaultReportedAt", deviceId);
};

const findLastFaultReportedAtByDeviceId = (deviceId) => {
  return new Promise((resolve) => {
    resolve((store[deviceId] || {}).lastFaultReportedAt);
  });
};

const touchKeyByDeviceId = (key, deviceId) => {
  return new Promise((resolve) => {
    const tmp = {}; tmp[key] = unixTimestamp();
    store[deviceId] = Object.assign({}, store[deviceId], tmp);
    resolve(true);
  });
};

const reset = () => {
  store = {};
};

export {
  findLastFaultReportedAtByDeviceId,
  reset,
  store,
  touchLastFaultReportedAtByDeviceId,
  touchLastRequestedAtByDeviceId,
  unixTimestamp,
};
